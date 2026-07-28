import type { ReactNode } from "react";
import { Check, MessageCircle } from "lucide-react";

export function WhatsAppMockup() {
  return (
    <div className="relative mx-auto w-[280px] select-none sm:w-[300px]" aria-hidden="true">
      {/* halo suave atrás do aparelho */}
      <div className="absolute inset-0 -z-10 scale-90 rounded-[3rem] bg-gradient-to-b from-brand-200/50 to-transparent blur-2xl" />

      <div className="rounded-[2.5rem] border-[8px] border-ink-900 bg-ink-900 shadow-lift">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#e9e3de]">
          {/* notch */}
          <div className="absolute left-1/2 top-0 z-10 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-ink-900" />

          {/* barra de contato estilo WhatsApp */}
          <div className="flex items-center gap-3 bg-[#075e54] px-4 pb-3 pt-8 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">MedLembre</p>
              <p className="text-[11px] text-white/70">online</p>
            </div>
          </div>

          {/* corpo da conversa */}
          <div
            className="flex min-h-[360px] flex-col gap-2.5 px-3 py-4"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)",
              backgroundSize: "16px 16px",
            }}
          >
            <div className="flex justify-center">
              <span className="rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-medium text-ink-500">
                Hoje
              </span>
            </div>

            <ChatBubble align="left">
              <p>
                💊 Hora do seu remédio: <strong>Losartana 50mg</strong>. Já tomou?
              </p>
              <BubbleMeta time="09:00" />
            </ChatBubble>

            <div className="flex justify-start gap-2 pl-1">
              <QuickReply>✅ Já tomei</QuickReply>
              <QuickReply>⏰ Lembrar em 10 min</QuickReply>
            </div>

            <ChatBubble align="right">
              <p>Já tomei ✅</p>
              <BubbleMeta time="09:02" outgoing />
            </ChatBubble>

            <ChatBubble align="left">
              <p>Perfeito! Vejo você às 21h para a próxima dose 👍</p>
              <BubbleMeta time="09:02" />
            </ChatBubble>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ align, children }: { align: "left" | "right"; children: ReactNode }) {
  const isRight = align === "right";
  return (
    <div className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-[13px] leading-snug shadow-sm ${
          isRight ? "rounded-tr-sm bg-[#d9fdd3] text-ink-900" : "rounded-tl-sm bg-white text-ink-900"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function BubbleMeta({ time, outgoing }: { time: string; outgoing?: boolean }) {
  return (
    <span className="mt-1 flex items-center justify-end gap-1 text-[10px] text-ink-300">
      {time}
      {outgoing && <Check className="h-3 w-3 text-sky-500" aria-hidden="true" />}
    </span>
  );
}

function QuickReply({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-[#075e54]/20 bg-white px-2.5 py-1 text-[11px] font-medium text-[#075e54] shadow-sm">
      {children}
    </span>
  );
}
