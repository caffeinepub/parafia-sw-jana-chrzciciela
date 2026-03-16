import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ZycieCategory =
  | "chrzty"
  | "komunia"
  | "bierzmowanie"
  | "malzenstwa"
  | "domojca"
  | "wydarzenia";

export interface ZycieEntry {
  id: string;
  category: ZycieCategory;
  year: number;
  name: string;
  date: string;
  notes?: string;
}

export interface ZycieData {
  heroTitle: string;
  heroSubtitle: string;
  heroDesc: string;
  entries: ZycieEntry[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const CATEGORY_META: Record<
  ZycieCategory,
  { label: string; color: string; glow: string; angle: number }
> = {
  chrzty: {
    label: "Chrzty",
    color: "#60A5FA",
    glow: "rgba(96,165,250,0.45)",
    angle: 0,
  },
  komunia: {
    label: "I Komunia",
    color: "#FBBF24",
    glow: "rgba(251,191,36,0.45)",
    angle: 60,
  },
  bierzmowanie: {
    label: "Bierzmowanie",
    color: "#F87171",
    glow: "rgba(248,113,113,0.45)",
    angle: 120,
  },
  malzenstwa: {
    label: "Małżeństwa",
    color: "#F472B6",
    glow: "rgba(244,114,182,0.45)",
    angle: 180,
  },
  domojca: {
    label: "Dom Ojca",
    color: "#A78BFA",
    glow: "rgba(167,139,250,0.45)",
    angle: 240,
  },
  wydarzenia: {
    label: "Wydarzenia",
    color: "#34D399",
    glow: "rgba(52,211,153,0.45)",
    angle: 300,
  },
};

const CATEGORIES = Object.keys(CATEGORY_META) as ZycieCategory[];

// ─── Demo data ────────────────────────────────────────────────────────────────

function buildDemoData(): ZycieEntry[] {
  const entries: ZycieEntry[] = [];
  let id = 1;
  const names = [
    "Jan",
    "Maria",
    "Piotr",
    "Anna",
    "Tomasz",
    "Katarzyna",
    "Paweł",
    "Agnieszka",
    "Michał",
    "Barbara",
    "Krzysztof",
    "Małgorzata",
    "Andrzej",
    "Elżbieta",
    "Józef",
    "Zofia",
    "Stanisław",
    "Helena",
    "Marek",
    "Teresa",
    "Łukasz",
    "Monika",
  ];
  const eventNames = [
    "Odpust Parafialny",
    "Kolędowanie Parafialne",
    "Rekolekcje Wielkopostne",
    "Pielgrzymka do Częstochowy",
    "Festyn Rodzinny",
    "Wigilia dla Samotnych",
    "Procesja Bożego Ciała",
    "Dzień Wspólnoty",
    "Spotkanie Opłatkowe",
    "Misje Parafialne",
  ];
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const rDate = (y: number) => {
    const m = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
    const d = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };
  for (const year of [2024, 2025, 2026]) {
    for (let i = 0; i < 9; i++)
      entries.push({
        id: String(id++),
        category: "chrzty",
        year,
        name: pick(names),
        date: rDate(year),
      });
    for (let i = 0; i < 8; i++)
      entries.push({
        id: String(id++),
        category: "komunia",
        year,
        name: pick(names),
        date: rDate(year),
      });
    for (let i = 0; i < 7; i++)
      entries.push({
        id: String(id++),
        category: "bierzmowanie",
        year,
        name: pick(names),
        date: rDate(year),
        notes: `Hasło: "${["Miłość", "Nadzieja", "Wiara", "Pokój", "Radość"][i % 5]}"`,
      });
    for (let i = 0; i < 6; i++) {
      const n1 = pick(names);
      const n2 = pick(names);
      entries.push({
        id: String(id++),
        category: "malzenstwa",
        year,
        name: `${n1} i ${n2}`,
        date: rDate(year),
      });
    }
    for (let i = 0; i < 8; i++)
      entries.push({
        id: String(id++),
        category: "domojca",
        year,
        name: pick(names),
        date: rDate(year),
      });
    for (let i = 0; i < 7; i++)
      entries.push({
        id: String(id++),
        category: "wydarzenia",
        year,
        name: pick(eventNames),
        date: rDate(year),
      });
  }
  return entries;
}

const DEFAULT_ZYCIE_DATA: ZycieData = {
  heroTitle: "Życie parafii",
  heroSubtitle: "Wzrastamy razem w wierze",
  heroDesc:
    "Parafia to nie tylko miejsce. To wspólnota życia.\nOd Chrztu Świętego, przez sakramenty, aż po przejście do Domu Ojca – tworzymy jeden witraż życia zakorzenionego w Chrystusie.",
  entries: buildDemoData(),
};

function loadData(): ZycieData {
  try {
    const raw = localStorage.getItem("zycieData");
    if (raw) return JSON.parse(raw) as ZycieData;
  } catch {
    /* ignore */
  }
  return DEFAULT_ZYCIE_DATA;
}

// ─── SVG Helpers ──────────────────────────────────────────────────────────────

const CX = 300;
const CY = 300;
const R_OUTER = 258;
const R_MID2 = 200;
const R_MID1 = 140;
const R_INNER = 80;

function polarToXY(angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function sectorPath(
  startDeg: number,
  endDeg: number,
  rOuter: number,
  rInner: number,
) {
  const s1 = polarToXY(startDeg, rInner);
  const s2 = polarToXY(startDeg, rOuter);
  const e1 = polarToXY(endDeg, rOuter);
  const e2 = polarToXY(endDeg, rInner);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${s1.x} ${s1.y}`,
    `L ${s2.x} ${s2.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${e1.x} ${e1.y}`,
    `L ${e2.x} ${e2.y}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${s1.x} ${s1.y}`,
    "Z",
  ].join(" ");
}

function arcTextPath(r: number, startDeg: number, endDeg: number) {
  const s = polarToXY(startDeg, r);
  const e = polarToXY(endDeg, r);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

// ─── Particles ────────────────────────────────────────────────────────────────

interface Particle {
  id: number;
  r: number;
  orbitR: number;
  startAngle: number;
  duration: number;
  color: string;
  opacity: number;
}

const PARTICLES: Particle[] = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  r: 2 + Math.random() * 2.5,
  orbitR: 278 + Math.random() * 32,
  startAngle: (i / 14) * 360,
  duration: 24 + Math.random() * 20,
  color: ["#F9D76B", "#FFFDE7", "#FFF9C4", "#FFF176"][i % 4],
  opacity: 0.25 + Math.random() * 0.35,
}));

// ─── Rosette ─────────────────────────────────────────────────────────────────────

interface RosetteProps {
  entries: ZycieEntry[];
  year: number;
  onSectorClick: (cat: ZycieCategory) => void;
  activeCat: ZycieCategory | null;
}

function Rosette({ entries, year, onSectorClick, activeCat }: RosetteProps) {
  const [hovered, setHovered] = useState<ZycieCategory | null>(null);

  const counts = useMemo(() => {
    const c: Partial<Record<ZycieCategory, number>> = {};
    for (const e of entries.filter((e) => e.year === year)) {
      c[e.category] = (c[e.category] ?? 0) + 1;
    }
    return c;
  }, [entries, year]);

  const total = useMemo(
    () => Object.values(counts).reduce((a, b) => a + b, 0),
    [counts],
  );

  return (
    <svg
      viewBox="0 0 600 600"
      className="w-full max-w-[540px] mx-auto"
      aria-label="Rozeta Życia Parafii"
      role="img"
      style={{ filter: "drop-shadow(0 0 40px rgba(251,191,36,0.08))" }}
    >
      <title>Rozeta Życia Parafii – {year}</title>
      <defs>
        <radialGradient id="centerGold" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF9C3" stopOpacity="1" />
          <stop offset="60%" stopColor="#F59E0B" stopOpacity="1" />
          <stop offset="100%" stopColor="#92400E" stopOpacity="1" />
        </radialGradient>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a1a2e" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0a0a14" stopOpacity="0" />
        </radialGradient>
        {CATEGORIES.map((cat) => (
          <filter
            key={cat}
            id={`glow-${cat}`}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}
        {CATEGORIES.map((cat, i) => (
          <path
            key={`arc-${cat}`}
            id={`arc-${cat}`}
            d={arcTextPath(R_MID2 - 18, i * 60 + 5, (i + 1) * 60 - 5)}
            fill="none"
          />
        ))}
      </defs>

      <circle cx={CX} cy={CY} r={R_OUTER + 10} fill="url(#bgGrad)" />

      {CATEGORIES.map((cat, i) => {
        const meta = CATEGORY_META[cat];
        const startDeg = i * 60;
        const endDeg = (i + 1) * 60;
        const isHov = hovered === cat || activeCat === cat;
        const mid = polarToXY(startDeg + 30, (R_MID1 + R_INNER) / 2);

        return (
          <g
            key={cat}
            tabIndex={0}
            aria-label={`${meta.label}: ${counts[cat] ?? 0} wpisów`}
            onClick={() => onSectorClick(cat)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onSectorClick(cat);
            }}
            onMouseEnter={() => setHovered(cat)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: "pointer" }}
          >
            <path
              d={sectorPath(startDeg, endDeg, R_OUTER, R_MID2)}
              fill={meta.color}
              fillOpacity={isHov ? 0.72 : 0.42}
              stroke="#0a0a14"
              strokeWidth="1.5"
              style={{ transition: "fill-opacity 0.3s" }}
            />
            <path
              d={sectorPath(startDeg, endDeg, R_MID2, R_MID1)}
              fill={meta.color}
              fillOpacity={isHov ? 0.85 : 0.58}
              stroke="#0a0a14"
              strokeWidth="1.5"
              style={{ transition: "fill-opacity 0.3s" }}
            />
            <path
              d={sectorPath(startDeg, endDeg, R_MID1, R_INNER)}
              fill={meta.color}
              fillOpacity={isHov ? 0.92 : 0.68}
              stroke="#0a0a14"
              strokeWidth="1.5"
              style={{ transition: "fill-opacity 0.3s" }}
              filter={isHov ? `url(#glow-${cat})` : undefined}
            />
            <text
              x={mid.x}
              y={mid.y + 6}
              textAnchor="middle"
              fill="#fff"
              fontWeight="700"
              fontSize="18"
              fontFamily="Playfair Display, serif"
              opacity={isHov ? 1 : 0.85}
              style={{ pointerEvents: "none", transition: "opacity 0.3s" }}
            >
              {counts[cat] ?? 0}
            </text>
            <text
              style={{ pointerEvents: "none", userSelect: "none" }}
              fill="#fff"
              fontSize="11"
              fontWeight="600"
              letterSpacing="0.05em"
              opacity={isHov ? 1 : 0.75}
              fontFamily="Plus Jakarta Sans, sans-serif"
            >
              <textPath
                href={`#arc-${cat}`}
                startOffset="50%"
                textAnchor="middle"
              >
                {meta.label.toUpperCase()}
              </textPath>
            </text>
          </g>
        );
      })}

      {[R_MID1, R_MID2].map((r) => (
        <circle
          key={r}
          cx={CX}
          cy={CY}
          r={r}
          fill="none"
          stroke="#0a0a14"
          strokeWidth="2"
          opacity="0.8"
        />
      ))}
      <circle
        cx={CX}
        cy={CY}
        r={R_OUTER}
        fill="none"
        stroke="#0a0a14"
        strokeWidth="2"
        opacity="0.6"
      />

      {CATEGORIES.map((cat, i) => {
        const p = polarToXY(i * 60, R_OUTER);
        return (
          <line
            key={cat}
            x1={CX}
            y1={CY}
            x2={p.x}
            y2={p.y}
            stroke="#0a0a14"
            strokeWidth="2"
            opacity="0.7"
          />
        );
      })}

      {PARTICLES.map((p) => (
        <circle key={p.id} r={p.r} fill={p.color} opacity={p.opacity}>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`${p.startAngle} ${CX} ${CY}`}
            to={`${p.startAngle + 360} ${CX} ${CY}`}
            dur={`${p.duration}s`}
            repeatCount="indefinite"
          />
          <animateMotion
            dur={`${p.duration}s`}
            repeatCount="indefinite"
            path={`M ${CX + p.orbitR} ${CY} A ${p.orbitR} ${p.orbitR} 0 1 1 ${CX + p.orbitR - 0.001} ${CY}`}
          />
        </circle>
      ))}

      <circle cx={CX} cy={CY} r={R_INNER} fill="url(#centerGold)">
        <animate
          attributeName="r"
          values={`${R_INNER};${R_INNER + 4};${R_INNER}`}
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>
      <circle
        cx={CX}
        cy={CY}
        r={R_INNER}
        fill="none"
        stroke="#92400E"
        strokeWidth="2"
        opacity="0.5"
      />

      <text
        x={CX}
        y={CY - 6}
        textAnchor="middle"
        fill="#fff"
        fontWeight="800"
        fontSize="26"
        fontFamily="Playfair Display, serif"
        style={{ pointerEvents: "none" }}
      >
        {year}
      </text>
      <text
        x={CX}
        y={CY + 16}
        textAnchor="middle"
        fill="#FEF9C3"
        fontWeight="500"
        fontSize="12"
        fontFamily="Plus Jakarta Sans, sans-serif"
        opacity="0.9"
        style={{ pointerEvents: "none" }}
      >
        {total} wpisów
      </text>
    </svg>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({
  cat,
  entries,
  year,
  onClose,
}: {
  cat: ZycieCategory;
  entries: ZycieEntry[];
  year: number;
  onClose: () => void;
}) {
  const meta = CATEGORY_META[cat];
  const filtered = entries
    .filter((e) => e.category === cat && e.year === year)
    .sort((a, b) => a.date.localeCompare(b.date));

  const fmt = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "long",
      });
    } catch {
      return d;
    }
  };

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className="fixed top-0 right-0 h-full w-full max-w-sm z-50 flex flex-col"
      style={{
        background: "rgba(10,10,20,0.97)",
        backdropFilter: "blur(16px)",
        borderLeft: `2px solid ${meta.color}44`,
      }}
      data-ocid="zycie.panel"
    >
      <div
        className="flex items-center justify-between px-6 py-5"
        style={{ borderBottom: `1px solid ${meta.color}33` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{
              background: meta.color,
              boxShadow: `0 0 10px ${meta.glow}`,
            }}
          />
          <h2
            className="font-display text-lg font-semibold"
            style={{ color: meta.color }}
          >
            {meta.label}
          </h2>
          <span className="font-sans text-sm text-white/40">{year}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
          data-ocid="zycie.panel.close_button"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
        {filtered.length === 0 ? (
          <div
            className="text-center py-12 text-white/30 font-sans text-sm"
            data-ocid="zycie.panel.empty_state"
          >
            Brak wpisów w tym roku
          </div>
        ) : (
          filtered.map((e, idx) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="rounded-lg px-4 py-3"
              style={{
                background: `${meta.color}12`,
                borderLeft: `3px solid ${meta.color}60`,
              }}
              data-ocid={`zycie.panel.item.${idx + 1}`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-sans text-sm font-medium text-white/90">
                  {e.name}
                </span>
                <span className="font-sans text-xs text-white/40 whitespace-nowrap mt-0.5">
                  {fmt(e.date)}
                </span>
              </div>
              {e.notes && (
                <p className="font-sans text-xs text-white/50 mt-1">
                  {e.notes}
                </p>
              )}
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ZyciePage() {
  const [data, setData] = useState<ZycieData>(loadData);
  const [year, setYear] = useState(2026);
  const [activeCat, setActiveCat] = useState<ZycieCategory | null>(null);

  useEffect(() => {
    const onStorage = () => setData(loadData());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleSectorClick = useCallback((cat: ZycieCategory) => {
    setActiveCat((prev) => (prev === cat ? null : cat));
  }, []);

  const countForYear = useCallback(
    (cat: ZycieCategory) =>
      data.entries.filter((e) => e.category === cat && e.year === year).length,
    [data.entries, year],
  );

  return (
    <main className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative min-h-[46vh] flex items-end pb-16 pt-nav overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 60% 0%, #1a1032 0%, #0d0a1a 45%, #060510 100%)",
            }}
          />
          <svg
            className="absolute inset-0 w-full h-full opacity-10"
            viewBox="0 0 1440 600"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            {[1500, 1620, 1740, 1860, 1980, 2100].map((x2) => (
              <line
                key={x2}
                x1="720"
                y1="-50"
                x2={String(x2)}
                y2="650"
                stroke="#F59E0B"
                strokeWidth="1"
                opacity="0.6"
              />
            ))}
          </svg>
        </div>
        <div className="relative container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2">
              <div className="w-px h-6 bg-amber-400/60" />
              <span className="font-sans text-xs tracking-widest uppercase text-amber-400/80">
                Parafia
              </span>
            </div>
            <h1
              className="font-display text-5xl md:text-6xl lg:text-7xl font-light text-white leading-none"
              style={{ textShadow: "0 0 40px rgba(251,191,36,0.18)" }}
            >
              {data.heroTitle}
            </h1>
            <p className="font-display text-lg md:text-xl text-amber-200/80 font-light italic">
              {data.heroSubtitle}
            </p>
            <p className="font-sans text-sm md:text-base text-white/50 max-w-lg leading-relaxed whitespace-pre-line">
              {data.heroDesc}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ROSETTE */}
      <section
        className="relative py-16 px-4"
        style={{
          background: "linear-gradient(180deg, #060510 0%, #080614 100%)",
        }}
      >
        {/* Year picker */}
        <div className="flex justify-center mb-8">
          <div
            className="inline-flex items-center gap-1 rounded-full p-1"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {[2024, 2025, 2026].map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setYear(y)}
                className="px-5 py-1.5 rounded-full font-sans text-sm font-medium transition-all duration-300"
                style={{
                  background:
                    year === y ? "rgba(251,191,36,0.18)" : "transparent",
                  color: year === y ? "#FBBF24" : "rgba(255,255,255,0.45)",
                  border:
                    year === y
                      ? "1px solid rgba(251,191,36,0.4)"
                      : "1px solid transparent",
                }}
                data-ocid="zycie.year.toggle"
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <Rosette
            entries={data.entries}
            year={year}
            onSectorClick={handleSectorClick}
            activeCat={activeCat}
          />
        </div>

        {/* Legend */}
        <div className="mt-10 grid grid-cols-3 md:grid-cols-6 gap-3 max-w-2xl mx-auto">
          {CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            const count = countForYear(cat);
            return (
              <motion.button
                key={cat}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSectorClick(cat)}
                className="flex flex-col items-center gap-2 rounded-xl p-3 transition-all duration-300"
                style={{
                  background:
                    activeCat === cat
                      ? `${meta.color}18`
                      : "rgba(255,255,255,0.03)",
                  border: `1px solid ${activeCat === cat ? `${meta.color}55` : "rgba(255,255,255,0.07)"}`,
                }}
                data-ocid={`zycie.${cat}.toggle`}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: meta.color,
                    boxShadow: `0 0 8px ${meta.glow}`,
                  }}
                />
                <span className="font-sans text-xs text-white/60 text-center leading-tight">
                  {meta.label}
                </span>
                <span
                  className="font-display text-xl font-bold"
                  style={{ color: meta.color }}
                >
                  {count}
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Detail panel */}
      <AnimatePresence>
        {activeCat && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveCat(null)}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.5)" }}
            />
            <DetailPanel
              cat={activeCat}
              entries={data.entries}
              year={year}
              onClose={() => setActiveCat(null)}
            />
          </>
        )}
      </AnimatePresence>

      <div className="py-8" style={{ background: "#060510" }} />
    </main>
  );
}
