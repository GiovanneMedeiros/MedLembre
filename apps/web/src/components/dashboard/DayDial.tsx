import type { CSSProperties } from "react";
import type { TimelineItem } from "../../types/dashboard";
import { medicationHex } from "../../lib/medicationColors";
import { useCountUp } from "../../hooks/useCountUp";

interface DayDialProps {
  items: TimelineItem[];
  now: Date;
}

const SIZE = 320;
const C = SIZE / 2;
const R_TRACK = 128;
const R_PROGRESS = 100;
const STACK_STEP = 19;

const STATUS_LABEL: Record<TimelineItem["status"], string> = {
  tomado: "tomado",
  proximo: "próximo",
  pendente: "pendente",
  atrasado: "atrasado",
  perdido: "perdido",
};

// Doses de exemplo mostradas quando ainda não há nada programado.
const DEMO = [
  { horario: "08:00", cor: "brand" },
  { horario: "12:30", cor: "blue" },
  { horario: "15:00", cor: "amber" },
  { horario: "20:00", cor: "purple" },
  { horario: "22:00", cor: "teal" },
];

function minutesOf(horario: string) {
  const [h, m] = horario.split(":").map(Number);
  return h * 60 + (m || 0);
}

function polar(minutes: number, radius: number) {
  const angle = (minutes / 1440) * 2 * Math.PI - Math.PI / 2;
  return { x: C + radius * Math.cos(angle), y: C + radius * Math.sin(angle) };
}

function circumference(r: number) {
  return 2 * Math.PI * r;
}

export function DayDial({ items, now }: DayDialProps) {
  const total = items.length;
  const taken = items.filter((i) => i.status === "tomado").length;
  const animatedTaken = useCountUp(taken);

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowAngle = (nowMinutes / 1440) * 360;

  const trackLen = circumference(R_TRACK);
  const elapsedLen = (nowMinutes / 1440) * trackLen;
  const progressLen = circumference(R_PROGRESS);
  const takenLen = total > 0 ? (taken / total) * progressLen : 0;

  // Doses no mesmo horário são empilhadas para dentro do anel.
  const stackIndex = new Map<string, number>();
  const markers = [...items]
    .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor))
    .map((item) => {
      const idx = stackIndex.get(item.horario) ?? 0;
      stackIndex.set(item.horario, idx + 1);
      return { item, ...polar(minutesOf(item.horario), R_TRACK - idx * STACK_STEP) };
    });

  const label =
    total === 0
      ? "Exemplo do relógio do dia: cada ponto é uma dose. Cadastre um medicamento para ver o seu."
      : `${taken} de ${total} doses tomadas hoje`;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[340px]">
      <div
        className="absolute inset-[12%] rounded-full bg-brand-200/40 blur-3xl"
        aria-hidden="true"
      />
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={label} className="relative h-full w-full overflow-visible">
        {/* Mostrador */}
        <circle cx={C} cy={C} r={R_TRACK + 18} fill="white" />
        <circle cx={C} cy={C} r={R_TRACK} fill="none" stroke="var(--color-brand-50)" strokeWidth={14} />

        {/* Parte do dia que já passou */}
        <circle
          cx={C}
          cy={C}
          r={R_TRACK}
          fill="none"
          stroke="var(--color-brand-100)"
          strokeWidth={14}
          strokeDasharray={`${elapsedLen} ${trackLen}`}
          transform={`rotate(-90 ${C} ${C})`}
          className="animate-dial-draw"
          style={{ "--dial-length": `${elapsedLen}px` } as CSSProperties}
        />

        {/* Marcas de hora */}
        {Array.from({ length: 24 }, (_, h) => {
          const major = h % 6 === 0;
          const a = polar(h * 60, R_TRACK - 12);
          const b = polar(h * 60, R_TRACK - (major ? 20 : 15));
          return (
            <line
              key={h}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="var(--color-ink-300)"
              strokeOpacity={major ? 0.9 : 0.4}
              strokeWidth={major ? 2 : 1}
              strokeLinecap="round"
            />
          );
        })}
        {[0, 6, 12, 18].map((h) => {
          const p = polar(h * 60, R_TRACK + 30);
          return (
            <text
              key={h}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-ink-300 text-[11px] font-semibold tabular-nums"
            >
              {h}h
            </text>
          );
        })}

        {/* Progresso do dia: doses tomadas */}
        <circle cx={C} cy={C} r={R_PROGRESS} fill="none" stroke="var(--color-ink-900)" strokeOpacity={0.05} strokeWidth={8} />
        {total > 0 && (
          <circle
            cx={C}
            cy={C}
            r={R_PROGRESS}
            fill="none"
            stroke="var(--color-emerald-500)"
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={`${takenLen} ${progressLen}`}
            transform={`rotate(-90 ${C} ${C})`}
            className="animate-dial-draw transition-[stroke-dasharray] duration-700 ease-out"
            style={{ "--dial-length": `${takenLen}px`, animationDelay: "0.3s" } as CSSProperties}
          />
        )}

        {/* Modo exemplo: o anel enche e esvazia em loop */}
        {total === 0 && (
          <circle
            cx={C}
            cy={C}
            r={R_PROGRESS}
            fill="none"
            stroke="var(--color-emerald-400)"
            strokeOpacity={0.6}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={`${progressLen * 0.8} ${progressLen}`}
            transform={`rotate(-90 ${C} ${C})`}
            style={
              {
                "--dial-length": `${progressLen * 0.8}px`,
                animation: "dial-draw 3s ease-in-out 0.6s infinite alternate both",
              } as CSSProperties
            }
          />
        )}

        {/* Ponteiro "agora" */}
        <g
          className="animate-hand-sweep"
          style={{ transform: `rotate(${nowAngle}deg)`, transformOrigin: `${C}px ${C}px`, animationDelay: "0.2s" }}
        >
          <line
            x1={C}
            y1={C - R_TRACK + 22}
            x2={C}
            y2={C - R_TRACK - 14}
            stroke="var(--color-brand-600)"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <circle cx={C} cy={C - R_TRACK - 16} r={4} fill="var(--color-brand-600)" />
        </g>

        {/* Doses de exemplo */}
        {total === 0 &&
          DEMO.map((demo, i) => {
            const { x, y } = polar(minutesOf(demo.horario), R_TRACK);
            const color = medicationHex(demo.cor);
            return (
              <g
                key={demo.horario}
                className="animate-dose-pop"
                style={{ transformBox: "fill-box", transformOrigin: "center", animationDelay: `${0.5 + i * 0.1}s` }}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={8.5}
                  stroke={color}
                  strokeWidth={3}
                  fill="white"
                  className="animate-demo-dose"
                  style={{ color, animationDelay: `${1 + i * 0.6}s` }}
                />
              </g>
            );
          })}

        {/* Doses */}
        {markers.map(({ item, x, y }, i) => {
          const color = medicationHex(item.cor);
          const isTaken = item.status === "tomado";
          const isMissed = item.status === "perdido";
          return (
            <g
              key={`${item.medicationId}-${item.scheduledFor}`}
              className="animate-dose-pop"
              style={{ transformBox: "fill-box", transformOrigin: "center", animationDelay: `${0.5 + i * 0.07}s` }}
            >
              <title>{`${item.horario} – ${item.nome} (${STATUS_LABEL[item.status]})`}</title>
              {item.status === "atrasado" && (
                <circle
                  cx={x}
                  cy={y}
                  r={13}
                  fill="var(--color-red-500)"
                  fillOpacity={0.25}
                  className="animate-pulse-soft"
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                />
              )}
              <circle
                cx={x}
                cy={y}
                r={8.5}
                fill={isTaken ? color : isMissed ? "var(--color-ink-300)" : "white"}
                stroke={isMissed ? "var(--color-ink-300)" : item.status === "atrasado" ? "var(--color-red-500)" : color}
                strokeWidth={isTaken || isMissed ? 0 : 3}
                className="transition-[fill,stroke-width] duration-500"
              />
              {isTaken && (
                <path
                  d={`M${x - 3.5} ${y + 0.2} l2.4 2.4 l4.8 -4.8`}
                  fill="none"
                  stroke="white"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Centro */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        {total === 0 ? (
          <>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-600">Exemplo</span>
            <p className="mt-2 max-w-[10rem] font-heading text-lg leading-snug font-bold text-balance text-ink-900">
              Seu dia aparece aqui
            </p>
            <p className="mt-1 max-w-[10rem] text-xs text-ink-500">Cada ponto é uma dose no horário certo.</p>
          </>
        ) : (
          <>
            <p className="font-heading text-5xl font-extrabold tabular-nums tracking-tight text-ink-900">
              {animatedTaken}
              <span className="text-2xl font-bold text-ink-300">/{total}</span>
            </p>
            <p className="mt-1 text-sm font-medium text-ink-500">
              {taken === total ? "tudo tomado hoje" : "doses tomadas"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/** Legenda dos marcadores do relógio (forma + rótulo, nunca só cor). */
export function DayDialLegend() {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-medium text-ink-500">
      <li className="flex items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <circle cx="7" cy="7" r="6" fill="var(--color-emerald-500)" />
          <path d="M4 7.2l2 2 4-4" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Tomada
      </li>
      <li className="flex items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <circle cx="7" cy="7" r="5" fill="white" stroke="var(--color-ink-500)" strokeWidth="2.5" />
        </svg>
        A tomar
      </li>
      <li className="flex items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <circle cx="7" cy="7" r="6.5" fill="var(--color-red-500)" fillOpacity="0.25" />
          <circle cx="7" cy="7" r="4" fill="white" stroke="var(--color-red-500)" strokeWidth="2.2" />
        </svg>
        Atrasada
      </li>
      <li className="flex items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <line x1="7" y1="1" x2="7" y2="11" stroke="var(--color-brand-600)" strokeWidth="2" strokeLinecap="round" />
          <circle cx="7" cy="12" r="2" fill="var(--color-brand-600)" />
        </svg>
        Agora
      </li>
    </ul>
  );
}
