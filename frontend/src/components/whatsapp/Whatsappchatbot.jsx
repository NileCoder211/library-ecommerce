/**
 * WhatsAppChatbot.jsx
 *
 * AI chat widget — calls your backend /api/chatbot/chat
 * which uses GPT-4o-mini with live product database search.
 */

import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, MessageCircle } from "lucide-react";

const BUSINESS_PHONE = import.meta.env.VITE_WHATSAPP_PHONE || "254745653399";
const API_BASE       = import.meta.env.VITE_API_URL        || "http://localhost:5000/api";

const WELCOME_MESSAGE = {
  role:    "assistant",
  content: "👋 Hi! I'm Shamith's assistant. Ask me about our furniture, prices, stock, or delivery — I'll look it up for you in real time!",
};

export default function WhatsAppChatbot() {
  const [open,      setOpen]      = useState(false);
  const [messages,  setMessages]  = useState([WELCOME_MESSAGE]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [toolLabel, setToolLabel] = useState("");

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, toolLabel]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);
    setToolLabel("Searching our catalogue…");

    try {
      // Send full conversation history to your backend
      // Backend handles tool calling + product DB lookups
      const res = await fetch(`${API_BASE}/chatbot/chat`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to get response");

      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role:    "assistant",
          content: "Sorry, something went wrong. Please try again or click \"Chat with our team\" to reach us on WhatsApp.",
        },
      ]);
    } finally {
      setLoading(false);
      setToolLabel("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handoffToWhatsApp = () => {
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
    const text = lastUserMsg
      ? `Hi! I was chatting with your assistant and need help with: "${lastUserMsg.content}"`
      : "Hi! I need help with a question about your furniture.";
    window.open(`https://wa.me/${BUSINESS_PHONE}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const hasExchange = messages.length > 1;

  return (
    <>
      {/* ── Chat window ───────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[340px] sm:w-[380px] flex flex-col
                     bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          style={{ maxHeight: "520px" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 bg-gray-900">
            <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center flex-none">
              <WaIcon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white leading-none">Luxura Assistant</p>
              <p className="text-xs text-gray-400 mt-0.5">Searches live inventory</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#faf9f7]"
            style={{ minHeight: 0 }}
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap
                    ${msg.role === "user"
                      ? "bg-gray-900 text-white rounded-br-sm"
                      : "bg-white text-gray-800 rounded-bl-sm border border-gray-100 shadow-sm"
                    }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading / tool lookup indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm
                                px-3.5 py-2.5 flex items-center gap-2 text-xs text-gray-400">
                  <Loader2 size={13} className="animate-spin text-green-500" />
                  {toolLabel || "Thinking…"}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Handoff banner — appears after first exchange */}
          {hasExchange && (
            <div className="px-4 py-2 bg-green-50 border-t border-green-100 flex items-center justify-between gap-2">
              <p className="text-xs text-green-700">Need a human?</p>
              <button
                onClick={handoffToWhatsApp}
                className="flex items-center gap-1.5 text-xs font-semibold text-green-700
                           hover:text-green-900 transition-colors"
              >
                <WaIcon size={13} className="text-green-600" />
                Chat with our team
              </button>
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 border-t border-gray-100 bg-white flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about products, prices, delivery…"
              rows={1}
              disabled={loading}
              className="flex-1 resize-none text-sm text-gray-800 placeholder-gray-300
                         border border-gray-200 rounded-xl px-3 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-gray-900
                         max-h-24 overflow-y-auto disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-9 h-9 flex-none rounded-xl bg-gray-900 hover:bg-gray-700
                         disabled:opacity-30 disabled:cursor-not-allowed
                         flex items-center justify-center text-white transition-colors"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── Toggle button ─────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full
                   bg-gray-900 hover:bg-gray-700 text-white
                   shadow-lg hover:shadow-xl transition-all duration-200
                   flex items-center justify-center"
        aria-label="Open chat assistant"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </>
  );
}

function WaIcon({ size = 20, className = "text-white" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}