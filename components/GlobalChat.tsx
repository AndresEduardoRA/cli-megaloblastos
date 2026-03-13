"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageCircle,
  Send,
  X,
  LogIn,
  Trash2,
  ShieldAlert,
  UserX,
  Power,
  Loader2,
  ChevronUp,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/hooks/useUser";
import { signInWithGoogle } from "@/services/auth-client";

interface Message {
  id: string;
  user_id: string;
  content: string;
  reactions: Record<string, number>;
  created_at: string;
  profiles: {
    username: string;
    role: string;
    is_blocked: boolean;
  };
}

export default function GlobalChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [userProfile, setUserProfile] = useState<{
    role: string;
    is_blocked: boolean;
  } | null>(null);

  const user = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const PAGE_SIZE = 10;

  const fetchUserProfile = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("role, is_blocked")
      .eq("id", user.id)
      .single();
    if (data) setUserProfile(data);
  }, [user, supabase]);

  const fetchChatStatus = useCallback(async () => {
    const { data } = await supabase
      .from("config")
      .select("value")
      .eq("key", "chat_enabled")
      .single();
    if (data) setChatEnabled(data.value);
  }, [supabase]);

  const fetchMessages = useCallback(
    async (isInitial = false) => {
      if (isInitial) setIsLoading(true);
      else setIsFetchingMore(true);

      const query = supabase
        .from("messages")
        .select("*, profiles(username, role, is_blocked)")
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);

      // Use a local variable to get current messages state for pagination
      setMessages((currentMessages) => {
        if (!isInitial && currentMessages.length > 0) {
          query.lt("created_at", currentMessages[0].created_at);
        }
        return currentMessages;
      });

      const { data, error } = await query;

      if (!error && data) {
        const formattedData = (data.reverse() as any);
        if (isInitial) {
          setMessages(formattedData);
          setTimeout(scrollToBottom, 100);
        } else {
          const prevScrollHeight =
            scrollContainerRef.current?.scrollHeight || 0;
          setMessages((prev) => [...formattedData, ...prev]);
          setHasMore(data.length === PAGE_SIZE);

          // Maintain scroll position after loading more
          setTimeout(() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop =
                scrollContainerRef.current.scrollHeight - prevScrollHeight;
            }
          }, 0);
        }
      }

      setIsLoading(false);
      setIsFetchingMore(false);
    },
    [supabase],
  );

  useEffect(() => {
    fetchChatStatus();
    if (user) fetchUserProfile();
  }, [user, fetchChatStatus, fetchUserProfile]);

  useEffect(() => {
    if (isOpen) {
      fetchMessages(true);
    }
  }, [isOpen, fetchMessages]);

  useEffect(() => {
    if (isOpen) {
      const channel = supabase
        .channel("global_chat")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          async (payload) => {
            // Get profile data for the new message
            const { data } = await supabase
              .from("messages")
              .select("*, profiles(username, role, is_blocked)")
              .eq("id", payload.new.id)
              .single();

            if (data) {
              setMessages((prev) => {
                // Prevent duplicates
                if (prev.some((m) => m.id === data.id)) return prev;
                return [...prev, data as any];
              });
              setTimeout(scrollToBottom, 100);
            }
          },
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "messages" },
          (payload) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === payload.new.id ? { ...m, ...payload.new } : m,
              ),
            );
          },
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "messages" },
          (payload) => {
            setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
          },
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "config" },
          (payload) => {
            if (payload.new.key === "chat_enabled")
              setChatEnabled(payload.new.value);
          },
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("Subscribed to global chat by Andres Alpiri");
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, supabase]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop === 0 && hasMore && !isFetchingMore) {
      fetchMessages(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !user ||
      !newMessage.trim() ||
      isLoading ||
      !chatEnabled ||
      userProfile?.is_blocked
    )
      return;

    const { error } = await supabase
      .from("messages")
      .insert([{ user_id: user.id, content: newMessage.trim() }]);

    if (!error) setNewMessage("");
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!user || userProfile?.is_blocked) return;
    const message = messages.find((m) => m.id === messageId);
    if (!message) return;
    const reactions = { ...message.reactions };
    reactions[emoji] = (reactions[emoji] || 0) + 1;
    await supabase.from("messages").update({ reactions }).eq("id", messageId);
  };

  // Admin Actions
  const deleteMessage = async (id: string) => {
    if (!confirm("¿Eliminar este mensaje?")) return;
    await supabase.from("messages").delete().eq("id", id);
  };

  const blockUser = async (userId: string) => {
    if (!confirm("¿Bloquear a este usuario del chat?")) return;
    await supabase
      .from("profiles")
      .update({ is_blocked: true })
      .eq("id", userId);
  };

  const toggleChat = async () => {
    const newValue = !chatEnabled;
    await supabase
      .from("config")
      .update({ value: newValue })
      .eq("key", "chat_enabled");
  };

  const clearChat = async () => {
    if (
      !confirm("¿ESTÁS SEGURO? Se borrarán TODOS los mensajes permanentemente.")
    )
      return;
    await supabase
      .from("messages")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all
    setMessages([]);
  };

  const isSuperAdmin = userProfile?.role === "super_admin";

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
          isOpen ? "bg-neutral-800 text-white" : "bg-amber-600 text-white"
        }`}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
        {!isOpen && !chatEnabled && (
          <Power
            size={14}
            className="absolute top-0 right-0 text-red-500 bg-white rounded-full"
          />
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[600px] bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-600/20">
                <MessageCircle size={22} />
              </div>
              <div>
                <h3 className="font-bold text-neutral-800 dark:text-white">
                  Chat Global
                </h3>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-2 h-2 rounded-full ${chatEnabled ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    {chatEnabled ? "En línea" : "Desactivado"}
                  </p>
                </div>
              </div>
            </div>

            {isSuperAdmin && (
              <div className="flex gap-1">
                <button
                  onClick={toggleChat}
                  title={chatEnabled ? "Desactivar Chat" : "Activar Chat"}
                  className={`p-2 rounded-xl transition-colors ${chatEnabled ? "text-green-600 hover:bg-green-50" : "text-red-600 hover:bg-red-50"}`}
                >
                  <Power size={18} />
                </button>
                <button
                  onClick={clearChat}
                  title="Borrar Historial"
                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar"
          >
            {!chatEnabled && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3 p-6">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600">
                  <ShieldAlert size={32} />
                </div>
                <h4 className="font-bold text-neutral-800 dark:text-white">
                  Chat Temporalmente Desactivado
                </h4>
                <p className="text-sm text-neutral-500">
                  Un administrador ha pausado la conversación global.
                </p>
              </div>
            )}

            {chatEnabled && (
              <>
                {isFetchingMore && (
                  <div className="flex justify-center py-2">
                    <Loader2
                      size={20}
                      className="animate-spin text-amber-600"
                    />
                  </div>
                )}

                {hasMore && !isFetchingMore && messages.length >= PAGE_SIZE && (
                  <div className="flex justify-center">
                    <button
                      onClick={() => fetchMessages(false)}
                      className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-amber-600 transition-colors flex items-center gap-1"
                    >
                      <ChevronUp size={12} /> Cargar anteriores
                    </button>
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col group ${msg.user_id === user?.id ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span
                        className={`text-[10px] font-black uppercase tracking-tighter ${
                          msg.profiles?.role === "super_admin"
                            ? "text-red-500"
                            : msg.profiles?.role === "admin"
                              ? "text-amber-600"
                              : "text-neutral-400"
                        }`}
                      >
                        {msg.profiles?.username || "Usuario"}
                      </span>
                      {isSuperAdmin && msg.user_id !== user?.id && (
                        <button
                          onClick={() => blockUser(msg.user_id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all"
                          title="Bloquear Usuario"
                        >
                          <UserX size={10} />
                        </button>
                      )}
                    </div>

                    <div className="relative group/msg max-w-[85%]">
                      <div
                        className={`p-3.5 rounded-2xl text-sm shadow-sm ${
                          msg.user_id === user?.id
                            ? "bg-amber-600 text-white rounded-tr-none shadow-amber-600/10"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-tl-none"
                        } ${msg.profiles?.is_blocked ? "opacity-50 italic" : ""}`}
                      >
                        {msg.profiles?.is_blocked
                          ? "Mensaje oculto (usuario bloqueado)"
                          : msg.content}

                        {Object.keys(msg.reactions || {}).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Object.entries(msg.reactions).map(
                              ([emoji, count]) => (
                                <button
                                  key={emoji}
                                  onClick={() => addReaction(msg.id, emoji)}
                                  className="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 hover:bg-black/20 transition-colors"
                                >
                                  {emoji} {count}
                                </button>
                              ),
                            )}
                          </div>
                        )}
                      </div>

                      {/* Admin/User Delete Button */}
                      {(isSuperAdmin || msg.user_id === user?.id) && (
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          className={`absolute -top-2 ${msg.user_id === user?.id ? "-left-6" : "-right-6"} p-1.5 bg-white dark:bg-neutral-800 shadow-lg border border-neutral-100 dark:border-neutral-700 rounded-lg text-red-500 opacity-0 group-hover/msg:opacity-100 transition-all hover:scale-110`}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>

                    {/* Reactions Selector */}
                    {!userProfile?.is_blocked && chatEnabled && (
                      <div
                        className={`flex gap-2 mt-1.5 px-2 opacity-0 group-hover:opacity-100 transition-opacity ${msg.user_id === user?.id ? "flex-row-reverse" : "flex-row"}`}
                      >
                        {["🔥", "❤️", "👍", "😮", "😂"].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => addReaction(msg.id, emoji)}
                            className="text-xs hover:scale-150 transition-transform duration-200"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Footer Input */}
          <div className="p-5 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            {user ? (
              userProfile?.is_blocked ? (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl text-center">
                  <p className="text-xs font-bold text-red-600">
                    Tu cuenta ha sido bloqueada del chat.
                  </p>
                </div>
              ) : !chatEnabled ? (
                <p className="text-xs text-center text-neutral-400 font-medium">
                  El chat no está aceptando mensajes.
                </p>
              ) : (
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 px-4 py-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-neutral-400"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isLoading}
                    className="p-3 bg-amber-600 text-white rounded-2xl hover:bg-amber-700 transition-all disabled:opacity-50 shadow-lg shadow-amber-600/20"
                  >
                    <Send size={20} />
                  </button>
                </form>
              )
            ) : (
              <div className="text-center space-y-4">
                <p className="text-xs text-neutral-500 font-medium">
                  Únete a la conversación global
                </p>
                <button
                  onClick={() => signInWithGoogle()}
                  className="w-full flex items-center justify-center gap-3 py-3 bg-white dark:bg-neutral-800 border-2 border-neutral-100 dark:border-neutral-800 rounded-2xl text-sm font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 transition-all shadow-sm"
                >
                  <LogIn size={18} className="text-amber-600" />
                  <span>Entrar con Google</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
