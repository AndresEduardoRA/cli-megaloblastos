<template>
  <div
    class="flex flex-col h-[calc(100vh-240px)] md:h-[calc(100vh-260px)] max-w-4xl mx-auto bg-white dark:bg-neutral-800 rounded-lg shadow-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 relative"
  >
    <!-- Admin Controls (Overlay or Top Bar) -->
    <div
      v-if="isAdmin"
      class="bg-red-600 text-white px-4 py-2 flex justify-between items-center text-sm"
    >
      <span class="font-bold"
        ><i class="ri-shield-user-line mr-1"></i> Modo Admin</span
      >
      <button
        @click="activatePanicMode"
        class="bg-white text-red-600 px-3 py-1 rounded-full text-xs font-bold hover:bg-red-50 transition-colors flex items-center gap-1"
      >
        <i class="ri-alarm-warning-fill"></i> PÁNICO (24h Ban)
      </button>
    </div>

    <!-- Header -->
    <div
      class="bg-amber-600 p-4 text-white flex justify-between items-center shadow-md z-10"
    >
      <div class="flex items-center gap-2">
        <i class="ri-chat-smile-2-line text-2xl"></i>
        <div>
          <h2 class="text-xl font-bold leading-none">Chat Global</h2>
          <span
            v-if="!chatActive"
            class="text-xs bg-red-500 px-2 py-0.5 rounded-full"
            >Desactivado</span
          >
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm opacity-90 hidden sm:inline">Tu nombre:</span>
        <input
          v-model="username"
          @change="saveUsername"
          type="text"
          class="bg-amber-700 text-white px-3 py-1 rounded border border-amber-500 focus:outline-none focus:border-amber-300 text-sm w-32 sm:w-40 placeholder-amber-300/70 transition-colors"
          placeholder="Anónimo"
        />
      </div>
    </div>

    <!-- Messages Area -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-6 bg-neutral-50 dark:bg-neutral-900 scroll-smooth relative"
    >
      <div
        v-if="!chatActive"
        class="absolute inset-0 bg-neutral-100/80 dark:bg-neutral-900/80 z-20 flex flex-col items-center justify-center text-center p-6 backdrop-blur-sm"
      >
        <i class="ri-lock-2-line text-6xl text-neutral-400 mb-4"></i>
        <h3 class="text-2xl font-bold text-neutral-600 dark:text-neutral-300">
          Chat Temporalmente Desactivado
        </h3>
        <p class="text-neutral-500 max-w-md mt-2">
          El chat ha sido desactivado por un administrador por motivos de
          seguridad. Volverá a estar disponible en 24 horas.
        </p>
      </div>

      <div
        v-if="loading"
        class="flex justify-center items-center h-full text-neutral-400"
      >
        <i class="ri-loader-4-line text-3xl animate-spin"></i>
      </div>

      <div
        v-else-if="messages.length === 0 && chatActive"
        class="flex flex-col justify-center items-center h-full text-neutral-400 opacity-60"
      >
        <i class="ri-chat-1-line text-5xl mb-2"></i>
        <p>Sé el primero en escribir algo...</p>
      </div>

      <div
        v-for="msg in messages"
        :key="msg.id"
        class="flex flex-col animate-fade-in-up group/msg"
        :class="msg.username === username ? 'items-end' : 'items-start'"
      >
        <div class="flex items-end gap-2 max-w-[90%] sm:max-w-[75%] relative">
          <!-- Admin Delete Button -->
          <button
            v-if="isAdmin"
            @click="deleteMessage(msg.id)"
            class="absolute -top-3 -right-3 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover/msg:opacity-100 transition-opacity shadow-sm z-10"
            title="Eliminar mensaje"
          >
            <i class="ri-delete-bin-line text-xs"></i>
          </button>

          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm self-end mb-1"
            :class="
              msg.username === username
                ? 'bg-amber-100 text-amber-800 order-2'
                : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
            "
          >
            {{ getInitials(msg.username) }}
          </div>

          <div
            class="flex flex-col gap-1"
            :class="msg.username === username ? 'items-end' : 'items-start'"
          >
            <div
              class="px-4 py-2 rounded-2xl shadow-sm relative"
              :class="[
                msg.username === username
                  ? 'bg-amber-600 text-white rounded-tr-none'
                  : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 rounded-tl-none',
              ]"
            >
              <div class="flex justify-between items-baseline gap-4 mb-0.5">
                <p
                  class="text-xs font-bold opacity-80"
                  :class="
                    msg.username === username
                      ? 'text-amber-100'
                      : 'text-amber-600 dark:text-amber-500'
                  "
                >
                  {{ msg.username || "Anónimo" }}
                </p>
                <!-- Metadata Info (Hover) -->
                <span
                  class="text-[10px] opacity-50"
                  :title="getMetadataTitle(msg)"
                >
                  {{ formatTime(msg.created_at) }}
                </span>
              </div>

              <p
                class="text-sm sm:text-base break-words leading-snug whitespace-pre-wrap"
              >
                {{ msg.content }}
              </p>
            </div>

            <!-- Reactions -->
            <div class="flex gap-1 px-1">
              <button
                v-for="(emoji, type) in reactionEmojis"
                :key="type"
                @click="addReaction(msg.id, type, msg.reactions)"
                class="flex items-center gap-1 text-xs bg-neutral-100 dark:bg-neutral-700/50 hover:bg-neutral-200 dark:hover:bg-neutral-700 px-1.5 py-0.5 rounded-full transition-colors border border-transparent hover:border-neutral-300 dark:hover:border-neutral-600"
                :class="{
                  'opacity-50': (msg.reactions?.[type] || 0) === 0 && !isAdmin,
                  'border-amber-500 bg-amber-50 dark:bg-amber-900/30':
                    myReactions[msg.id] === type,
                }"
              >
                <span>{{ emoji }}</span>
                <span
                  v-if="(msg.reactions?.[type] || 0) > 0"
                  class="font-medium text-neutral-600 dark:text-neutral-400"
                  >{{ msg.reactions?.[type] || 0 }}</span
                >
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div
      class="p-4 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700"
    >
      <form @submit.prevent="sendMessage" class="flex gap-2 items-end">
        <div class="relative flex-1">
          <textarea
            ref="messageInput"
            v-model="newMessage"
            @keydown.enter.exact.prevent="sendMessage"
            placeholder="Escribe un mensaje..."
            class="w-full bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500/50 border border-transparent focus:border-amber-500 transition-all resize-none max-h-32 min-h-[48px]"
            rows="1"
            :disabled="sending || !chatActive"
          ></textarea>
          <i class="ri-chat-3-line absolute right-3 top-3 text-neutral-400"></i>
        </div>
        <button
          type="submit"
          :disabled="!newMessage.trim() || sending || !chatActive"
          class="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 hover:shadow-amber-500/30"
        >
          <i v-if="sending" class="ri-loader-4-line animate-spin text-xl"></i>
          <i v-else class="ri-send-plane-fill text-xl ml-0.5"></i>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from "vue";
import { createClient } from "@supabase/supabase-js";
import Cookie from "js-cookie";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const messages = ref([]);
const newMessage = ref("");
const username = ref("Anónimo");
const loading = ref(true);
const sending = ref(false);
const messagesContainer = ref(null);
const messageInput = ref(null);
const isAdmin = ref(false);
const chatActive = ref(true);

const reactionEmojis = {
  like: "👍",
  love: "❤️",
  haha: "😂",
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const getInitials = (name) => {
  return (name || "A").substring(0, 2).toUpperCase();
};

const formatTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getMetadataTitle = (msg) => {
  const date = new Date(msg.created_at).toLocaleString("es-ES");
  const device = msg.device_info ? `\nDispositivo: ${msg.device_info}` : "";
  const location = msg.location ? `\nUbicación: ${msg.location}` : "";
  return `Enviado: ${date}${device}${location}`;
};

const saveUsername = () => {
  if (!username.value.trim()) username.value = "Anónimo";
  localStorage.setItem("chat_username", username.value);
};

const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  let device = "Desconocido";
  if (/mobile/i.test(ua)) device = "Móvil";
  else if (/tablet/i.test(ua)) device = "Tablet";
  else device = "PC";

  const os = /Windows/i.test(ua)
    ? "Windows"
    : /Mac/i.test(ua)
      ? "Mac"
      : /Linux/i.test(ua)
        ? "Linux"
        : /Android/i.test(ua)
          ? "Android"
          : /iOS/i.test(ua)
            ? "iOS"
            : "";

  return `${device} (${os})`;
};

const checkAdmin = () => {
  const userCookie = Cookie.get("user");
  if (userCookie) {
    try {
      const userData = JSON.parse(userCookie);
      if (userData && userData.token) {
        isAdmin.value = true;
      }
    } catch (e) {
      console.error("Invalid cookie format");
    }
  }
};

const fetchChatSettings = async () => {
  const { data, error } = await supabase
    .from("chat_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (data) {
    if (data.disabled_until && new Date(data.disabled_until) > new Date()) {
      chatActive.value = false;
    } else {
      chatActive.value = data.is_active;
    }
  }
};

const fetchMessages = async () => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(50);

  if (error) console.error("Error fetching messages:", error);
  else {
    messages.value = data;
    scrollToBottom();
  }
  loading.value = false;
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || sending.value || !chatActive.value) return;

  sending.value = true;
  const content = newMessage.value.trim();
  const user = username.value || "Anónimo";
  const deviceInfo = getDeviceInfo();

  const { error } = await supabase.from("messages").insert([
    {
      content,
      username: user,
      device_info: deviceInfo,
      reactions: { like: 0, love: 0, haha: 0 },
    },
  ]);

  if (error) {
    console.error("Error sending message:", error);
    alert("Error al enviar mensaje");
  } else {
    newMessage.value = "";
  }
  sending.value = false;
  await nextTick();
  messageInput.value?.focus();
};

const myReactions = ref({});

const loadMyReactions = () => {
  const stored = localStorage.getItem("chat_reactions");
  if (stored) {
    try {
      myReactions.value = JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing reactions", e);
    }
  }
};

const saveMyReactions = () => {
  localStorage.setItem("chat_reactions", JSON.stringify(myReactions.value));
};

const addReaction = async (msgId, type, currentReactions) => {
  const newReactions = { ...currentReactions };
  const previousReaction = myReactions.value[msgId];

  // 1. Toggle (Remove existing)
  if (previousReaction === type) {
    newReactions[type] = Math.max(0, (newReactions[type] || 0) - 1);
    delete myReactions.value[msgId];
  }
  // 2. Switch (Remove old, add new)
  else if (previousReaction) {
    newReactions[previousReaction] = Math.max(
      0,
      (newReactions[previousReaction] || 0) - 1
    );
    newReactions[type] = (newReactions[type] || 0) + 1;
    myReactions.value[msgId] = type;
  }
  // 3. Add new (No previous)
  else {
    newReactions[type] = (newReactions[type] || 0) + 1;
    myReactions.value[msgId] = type;
  }

  saveMyReactions();

  // Optimistic update
  const msgIndex = messages.value.findIndex((m) => m.id === msgId);
  if (msgIndex !== -1) {
    messages.value[msgIndex].reactions = newReactions;
  }

  const { error } = await supabase
    .from("messages")
    .update({ reactions: newReactions })
    .eq("id", msgId);

  if (error) console.error("Error updating reaction:", error);
};

const deleteMessage = async (id) => {
  if (!confirm("¿Estás seguro de eliminar este mensaje?")) return;

  const { error } = await supabase.from("messages").delete().eq("id", id);

  if (error) alert("Error al eliminar mensaje");
  else {
    messages.value = messages.value.filter((m) => m.id !== id);
  }
};

const activatePanicMode = async () => {
  if (
    !confirm(
      "¿ESTÁS SEGURO? Esto desactivará el chat por 24 horas y borrará TODOS los mensajes."
    )
  )
    return;

  const disabledUntil = new Date();
  disabledUntil.setHours(disabledUntil.getHours() + 24);

  // 1. Disable chat
  await supabase
    .from("chat_settings")
    .update({ is_active: false, disabled_until: disabledUntil.toISOString() })
    .eq("id", 1);

  // 2. Delete all messages
  await supabase.from("messages").delete().neq("id", 0); // Delete all

  chatActive.value = false;
  messages.value = [];
};

onMounted(() => {
  const savedUser = localStorage.getItem("chat_username");
  if (savedUser) username.value = savedUser;

  loadMyReactions();
  checkAdmin();
  fetchChatSettings();
  fetchMessages();

  // Subscribe to messages
  const msgChannel = supabase
    .channel("public:messages")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      (payload) => {
        messages.value.push(payload.new);
        scrollToBottom();
      }
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "messages" },
      (payload) => {
        const index = messages.value.findIndex((m) => m.id === payload.new.id);
        if (index !== -1) {
          messages.value[index] = payload.new;
        }
      }
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "messages" },
      (payload) => {
        messages.value = messages.value.filter((m) => m.id !== payload.old.id);
      }
    )
    .subscribe();

  // Subscribe to settings
  const settingsChannel = supabase
    .channel("public:chat_settings")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "chat_settings" },
      (payload) => {
        if (
          payload.new.disabled_until &&
          new Date(payload.new.disabled_until) > new Date()
        ) {
          chatActive.value = false;
        } else {
          chatActive.value = payload.new.is_active;
        }

        if (!chatActive.value) {
          messages.value = []; // Clear view if disabled
        }
      }
    )
    .subscribe();
});
</script>

<style scoped>
/* Custom scrollbar for webkit */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 20px;
}
.dark ::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.5);
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fade-in-up 0.3s ease-out forwards;
}
</style>
