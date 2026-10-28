"use client";

import { useEffect, useRef, useState } from "react";
import rules from "./rules.json";

type Rule = {
  intent: string;
  keywords: string[];
  reply: string;
};

type Message = {
  id: number;
  text: string;
  sender: "bot" | "user";
};

const restaurantRules = rules as Rule[];

const quickTopics = [
  { label: "Menu", message: "Show me the menu", icon: "🍔" },
  { label: "Deals", message: "Show me today's deals", icon: "🔥" },
  { label: "Timings", message: "What are your timings?", icon: "🕒" },
  { label: "Location", message: "Where is your location?", icon: "📍" },
  { label: "Delivery", message: "Tell me about delivery", icon: "🛵" },
  { label: "Payment", message: "What payment methods do you accept?", icon: "💳" },
];

const initialMessage: Message = {
  id: 1,
  sender: "bot",
  text: "👋 Assalam-o-Alaikum! Welcome to Desi Bites!\n\nI'm your restaurant assistant in Sargodha. I can help you explore our menu, deals, delivery, opening hours, location and payment methods.\n\nHow can I help you today?",
};

/**
 * Escapes special regular-expression characters.
 */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Checks whether a keyword appears as a complete word or phrase.
 *
 * Examples:
 * "hi" matches "hi there"
 * "hi" does NOT match "this"
 * "family deal" matches "Show me the family deal"
 */
function containsWholeKeyword(
  message: string,
  keyword: string
): boolean {
  const escapedKeyword = escapeRegExp(keyword.trim()).replace(
    /\s+/g,
    "\\s+"
  );

  const pattern = new RegExp(
    `(^|[^a-z0-9])${escapedKeyword}(?=$|[^a-z0-9])`,
    "i"
  );

  return pattern.test(message);
}

/**
 * Finds the best matching rule.
 *
 * The rule with the most matching keywords wins.
 * If two rules have the same score, the earlier rule wins.
 */
function findBestRule(message: string): Rule | undefined {
  const normalizedMessage = message.trim().toLowerCase();

  if (!normalizedMessage) {
    return undefined;
  }

  let bestRule: Rule | undefined;
  let bestScore = 0;

  for (const rule of restaurantRules) {
    let score = 0;

    for (const keyword of rule.keywords) {
      if (containsWholeKeyword(normalizedMessage, keyword)) {
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestRule = rule;
    }
  }

  return bestRule;
}

function getBotReply(message: string): string {
  const matchedRule = findBestRule(message);

  if (matchedRule) {
    return matchedRule.reply;
  }

  return "😊 Sorry, I didn't quite understand that.\n\nI'm here to help with Desi Bites! You can ask me about:\n\n🍔 Our menu and prices\n🔥 Special deals\n🛵 Home delivery\n🕒 Opening timings\n📍 Restaurant location\n💳 Payment methods\n\nYou can also use the quick buttons below to explore these topics.";
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    initialMessage,
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const nextId = useRef(2);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isTyping]);

  function sendMessage(messageText: string) {
    const trimmedMessage = messageText.trim();

    if (!trimmedMessage || isTyping) {
      return;
    }

    const userMessage: Message = {
      id: nextId.current++,
      text: trimmedMessage,
      sender: "user",
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
    ]);

    setInput("");
    setIsTyping(true);

    // Show the typing indicator before displaying the answer.
    window.setTimeout(() => {
      const reply = getBotReply(trimmedMessage);

      const botMessage: Message = {
        id: nextId.current++,
        text: reply,
        sender: "bot",
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        botMessage,
      ]);

      setIsTyping(false);
      inputRef.current?.focus();
    }, 500);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(input);
  }

  return (
    <main className="min-h-screen bg-orange-50 px-3 py-5 text-stone-800 sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-xl sm:min-h-[calc(100vh-4rem)]">
        {/* Restaurant header */}
        <header className="bg-gradient-to-r from-orange-600 to-orange-500 px-5 py-5 text-white sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
              🍽️
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Desi Bites
              </h1>

              <p className="mt-1 text-sm text-orange-50">
                Restaurant Assistant · Sargodha
              </p>

              <div className="mt-2 flex items-center gap-2 text-xs text-orange-50">
                <span className="h-2 w-2 rounded-full bg-green-300" />
                Online · Ready to help
              </div>
            </div>
          </div>
        </header>

        {/* Quick topic buttons */}
        <section className="border-b border-orange-100 bg-orange-50/70 px-4 py-4 sm:px-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-stone-500">
            Explore our restaurant
          </p>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {quickTopics.map((topic) => (
              <button
                key={topic.label}
                type="button"
                onClick={() => sendMessage(topic.message)}
                disabled={isTyping}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-orange-400 hover:bg-orange-100 hover:text-orange-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span aria-hidden="true">{topic.icon}</span>
                <span>{topic.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Chat messages */}
        <section
          aria-label="Chat messages"
          aria-live="polite"
          className="flex-1 space-y-5 overflow-y-auto bg-white px-4 py-6 sm:px-6"
        >
          <div className="mb-5 text-center">
            <span className="inline-block rounded-full bg-orange-50 px-4 py-2 text-xs font-medium text-orange-700">
              Welcome to Desi Bites 👋
            </span>
          </div>

          {messages.map((message) => {
            const isUser = message.sender === "user";

            return (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <div
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-lg"
                  >
                    🍽️
                  </div>
                )}

                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 sm:max-w-[75%] ${
                    isUser
                      ? "rounded-br-md bg-orange-600 text-white"
                      : "rounded-bl-md border border-orange-100 bg-orange-50 text-stone-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words text-sm leading-6 sm:text-[15px]">
                    {message.text}
                  </p>
                </div>

                {isUser && (
                  <div
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-200 text-lg"
                  >
                    👤
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div
              className="flex items-end gap-2"
              role="status"
              aria-label="The restaurant assistant is typing"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-lg">
                🍽️
              </div>

              <div className="rounded-2xl rounded-bl-md border border-orange-100 bg-orange-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm italic text-stone-500">
                    Typing
                  </span>

                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-500" />
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </section>

        {/* Message input */}
        <footer className="border-t border-orange-100 bg-white p-4 sm:px-6 sm:py-5">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 sm:gap-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about our menu, deals..."
              aria-label="Type your message"
              autoComplete="off"
              disabled={isTyping}
              className="h-12 min-w-0 flex-1 rounded-xl border border-orange-200 bg-orange-50/50 px-4 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 disabled:opacity-60 sm:h-14 sm:text-base"
            />

            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 font-bold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-300 sm:h-14 sm:px-6"
            >
              <span>Send</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="h-4 w-4"
              >
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>
          </form>

          <div className="mt-3 flex flex-col items-center justify-between gap-1 text-center text-[11px] text-stone-400 sm:flex-row sm:text-xs">
            <span>Powered by a simple rule-based chatbot</span>
            <span>Desi Bites · Sargodha</span>
          </div>
        </footer>
      </div>
    </main>
  );
}