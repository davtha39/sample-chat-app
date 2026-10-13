"use client";

import { useEffect, useRef, useState } from "react";
import apiClient from "src/utils/api.js";
import { io, type Socket } from "socket.io-client";

type ChatMessage = {
  id: string;
  user: string;
  text: string;
  at: number;
};

function formatTime(at: number) {
  return new Date(at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Chat() {
  const socketRef = useRef<Socket | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [connected, setConnected] = useState(false);
  const [presence, setPresence] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [user, setUser] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    let socket: Socket | null = null;
    let cancelled = false;

    const connect = async () => {
      await fetch("/api/socket", { cache: "no-store" }).catch(() => {});
      if (cancelled) return;

      socket = io({ path: "/api/socket" });
      socketRef.current = socket;

      socket.on("connect", () => setConnected(true));
      socket.on("disconnect", () => setConnected(false));
      socket.on("chat:history", (history: ChatMessage[]) =>
        setMessages(history),
      );
      socket.on("chat:message", (message: ChatMessage) =>
        setMessages((prev) => [...prev, message]),
      );
      socket.on("chat:presence", (count: number) => setPresence(count));
    };
    console.log(messages);
    connect();

    return () => {
      cancelled = true;
      socket?.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    try {
      await apiClient.post("/send-chat", {
        name: user.trim() || "Anonymous",
        message: trimmed,
        user_agent: navigator.userAgent,
        ip: window.location.hostname
      });

      socketRef.current?.emit("chat:message", {
        user: user.trim() || "Anonymous",
        text: trimmed,
      });
      setText("");

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Chat</h1>
        <span className="flex items-center gap-2 text-sm text-zinc-500">
          <span
            className={`h-2 w-2 rounded-full ${
              connected ? "bg-emerald-500" : "bg-zinc-400"
            }`}
          />
          {connected ? `Online · ${presence}` : "Connecting…"}
        </span>
      </header>

      <input
        value={user}
        onChange={(event) => setUser(event.target.value)}
        placeholder="Your name"
        maxLength={32}
        className="rounded-lg border border-black/[.08] bg-white px-4 py-2 text-sm outline-none focus:border-black/30 dark:border-white/[.145] dark:bg-zinc-900 dark:focus:border-white/40"
      />

      <div
        ref={listRef}
        className="flex h-96 flex-col gap-3 overflow-y-auto rounded-xl border border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-zinc-900"
      >
        {messages.length === 0 ? (
          <p className="m-auto text-sm text-zinc-400">
            No messages yet. Say hello!
          </p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium">{message.user}</span>
                <span className="text-xs text-zinc-400">
                  {formatTime(message.at)}
                </span>
              </div>
              <p className="w-fit max-w-full break-words rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800">
                {message.text}
              </p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={send} className="flex gap-2">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type a message…"
          maxLength={500}
          className="flex-1 rounded-lg border border-black/[.08] bg-white px-4 py-2 text-sm outline-none focus:border-black/30 dark:border-white/[.145] dark:bg-zinc-900 dark:focus:border-white/40"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="rounded-lg bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-40 dark:hover:bg-[#ccc]"
        >
          Send
        </button>
      </form>
    </div>
  );
}
