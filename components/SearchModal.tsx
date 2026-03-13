"use client";

import { Search, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

type SearchResult = {
  id: string;
  title: string;
  type: string;
  subject: string;
  url: string;
};

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  /* focus when modal opens */

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  /* ESC close */

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  /* debounce search */

  useEffect(() => {
    if (search.length < 2) {
      setResults([]);
      return;
    }

    const performSearch = async () => {
      setLoading(true);

      try {
        const res = await fetch(`/api/search-materials?q=${search}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(performSearch, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const close = () => {
    setOpen(false);
    setSearch("");
    setResults([]);
  };

  const openLink = (url: string) => {
    window.open(url, "_blank");
    close();
  };

  return (
    <>
      {/* trigger */}

      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 pl-3 pr-12 py-2 rounded-full bg-neutral-200 dark:bg-neutral-100 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-600 transition w-full"
      >
        <Search />
        <span className="hidden md:inline text-sm">Buscar...</span>
      </button>

      {/* modal */}

      {open && (
        <div
          onClick={close}
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-neutral-800 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden"
          >
            {/* header */}

            <div className="p-4 border-b flex items-center gap-3">
              <Search />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar materiales, libros, guías..."
                className="flex-1 bg-transparent outline-none text-lg"
              />
              {search && (
                <button onClick={() => setSearch("")}>
                  <X />
                </button>
              )}
              <button
                onClick={close}
                className="text-xs border px-2 py-1 rounded"
              >
                ESC
              </button>
            </div>

            {/* body */}

            <div className="max-h-[60vh] overflow-y-auto">
              {loading && <div className="p-8 text-center">Buscando...</div>}

              {!search && (
                <div className="p-8 text-center text-neutral-400">
                  Escribe para buscar
                </div>
              )}

              {search && !loading && results.length === 0 && (
                <div className="p-8 text-center text-neutral-500">
                  No encontramos resultados para &quot;{search}&quot;
                </div>
              )}

              <ul className="divide-y">
                {results.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => openLink(item.url)}
                      className="w-full text-left p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 flex justify-between"
                    >
                      <div>
                        <h4 className="font-medium">{item.title}</h4>

                        <div className="text-xs text-neutral-500 mt-1 flex gap-2">
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded">
                            {item.type}
                          </span>

                          <span>{item.subject}</span>
                        </div>
                      </div>
                      →
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* footer */}

            <div className="p-2 text-xs text-center text-neutral-400 border-t">
              Presiona Enter para seleccionar
            </div>
          </div>
        </div>
      )}
    </>
  );
}
