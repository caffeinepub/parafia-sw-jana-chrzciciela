import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { Check, Copy, Pencil, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { SectionReveal } from "../components/parish/SectionReveal";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { Link } from "../router";

// ============================================================
// TYPES
// ============================================================

interface PrayerIntention {
  id: string;
  name: string;
  title: string;
  content: string;
  email: string;
  visibility: string;
  status: string;
  date: string;
  prayerCount: bigint;
  featured: boolean;
}

// ============================================================
// HOOKS
// ============================================================

function usePublicIntentions() {
  const { actor, isFetching } = useActor();
  return useQuery<PrayerIntention[]>({
    queryKey: ["publicIntentions"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return (await (
          actor as any
        ).getPublicPrayerIntentions()) as PrayerIntention[];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

function useContentBlock(key: string) {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["contentBlock", key],
    queryFn: async () => {
      if (!actor) return "";
      try {
        const result = await actor.getContentBlock(key);
        if (!result) return "";
        return typeof result === "object" && "content" in result
          ? (result as { content: string }).content
          : "";
      } catch {
        return "";
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// ============================================================
// HELPERS
// ============================================================

function isMassNow(): boolean {
  try {
    const raw = localStorage.getItem("liturgy_current_week");
    if (!raw) return false;
    const data = JSON.parse(raw);
    const entries: { dayIndex: number; time: string; entryType: string }[] =
      data?.entries ?? data ?? [];
    const now = new Date();
    const todayIndex = now.getDay(); // 0=Sun..6=Sat
    const todayEntries = entries.filter(
      (e) => e.entryType === "mass" && e.dayIndex === todayIndex,
    );
    for (const entry of todayEntries) {
      const [h, m] = entry.time.split(":").map(Number);
      if (Number.isNaN(h) || Number.isNaN(m)) continue;
      const massStart = new Date(now);
      massStart.setHours(h, m, 0, 0);
      const diff = (now.getTime() - massStart.getTime()) / 60000;
      if (diff >= -5 && diff <= 60) return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ============================================================
// CANDLE VISUALIZATION
// ============================================================

const candleStyle = `
  @keyframes kaplica-flicker {
    0%, 100% { transform: scaleY(1) scaleX(1); opacity: 1; }
    25% { transform: scaleY(1.07) scaleX(0.93); opacity: 0.95; }
    50% { transform: scaleY(0.94) scaleX(1.06); opacity: 0.98; }
    75% { transform: scaleY(1.03) scaleX(0.97); opacity: 0.96; }
  }
  @keyframes kaplica-pulse-glow {
    0%, 100% { box-shadow: 0 0 30px 8px rgba(251,191,36,0.35), 0 0 60px 20px rgba(251,191,36,0.15); }
    50% { box-shadow: 0 0 50px 16px rgba(251,191,36,0.55), 0 0 100px 40px rgba(251,191,36,0.25); }
  }
  @keyframes kaplica-mass-glow {
    0%, 100% { box-shadow: 0 0 60px 20px rgba(251,191,36,0.7), 0 0 120px 50px rgba(251,191,36,0.4), 0 0 200px 80px rgba(251,191,36,0.15); }
    50% { box-shadow: 0 0 80px 30px rgba(251,191,36,0.9), 0 0 160px 70px rgba(251,191,36,0.5), 0 0 260px 100px rgba(251,191,36,0.2); }
  }
  @keyframes kaplica-small-flicker {
    0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.9; }
    33% { transform: scaleY(1.08) scaleX(0.92); opacity: 0.85; }
    66% { transform: scaleY(0.93) scaleX(1.07); opacity: 0.95; }
  }
`;

interface CandleProps {
  size: "large" | "medium" | "small";
  color: string;
  glowColor: string;
  label?: string;
  isMassActive?: boolean;
  onClick?: () => void;
  featured?: boolean;
}

function Candle({
  size,
  color,
  glowColor,
  label,
  isMassActive,
  onClick,
  featured,
}: CandleProps) {
  const dims =
    size === "large"
      ? { w: 28, h: 80 }
      : size === "medium"
        ? { w: 18, h: 56 }
        : { w: 12, h: 40 };
  const flameH = size === "large" ? 32 : size === "medium" ? 22 : 16;
  const flameW = size === "large" ? 18 : size === "medium" ? 12 : 8;

  return (
    <button
      type="button"
      className="flex flex-col items-center gap-1 cursor-pointer select-none bg-transparent border-0 p-0"
      onClick={onClick}
      style={{ minWidth: dims.w + 20 }}
    >
      {/* flame */}
      <div
        style={{
          width: flameW,
          height: flameH,
          background: `radial-gradient(ellipse at 50% 80%, #fff 0%, #fde68a 30%, ${color} 65%, transparent 100%)`,
          borderRadius: "50% 50% 40% 40% / 60% 60% 40% 40%",
          animation: `kaplica-${size === "large" ? "flicker" : "small-flicker"} ${size === "large" ? "1.8s" : "2.3s"} ease-in-out infinite`,
          filter: `drop-shadow(0 0 ${size === "large" ? 8 : 4}px ${color})`,
        }}
      />
      {/* body */}
      <div
        style={{
          width: dims.w,
          height: dims.h,
          background: `linear-gradient(180deg, ${color}cc 0%, ${color}88 40%, ${color}44 100%)`,
          borderRadius: 4,
          animation: isMassActive
            ? "kaplica-mass-glow 2.5s ease-in-out infinite"
            : featured
              ? "kaplica-pulse-glow 3s ease-in-out infinite"
              : undefined,
          boxShadow: `0 0 ${size === "large" ? 20 : 10}px ${size === "large" ? 8 : 4}px ${glowColor}`,
          border: `1px solid ${color}66`,
        }}
      />
      {label && (
        <span
          style={{
            fontSize: size === "large" ? 11 : 9,
            color: "rgba(253,230,138,0.8)",
            textAlign: "center",
            maxWidth: 80,
            lineHeight: 1.3,
            marginTop: 4,
          }}
        >
          {label}
        </span>
      )}
    </button>
  );
}

interface IntentionPopupProps {
  intention: PrayerIntention;
  onClose: () => void;
}

function IntentionPopup({ intention, onClose }: IntentionPopupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ duration: 0.2 }}
      className="absolute z-50 bg-slate-900 border border-amber-800/40 rounded-xl p-4 shadow-2xl"
      style={{
        minWidth: 220,
        maxWidth: 280,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -80%)",
        color: "rgba(253,230,138,0.9)",
      }}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2 right-2 text-amber-700 hover:text-amber-400"
      >
        <X className="w-3 h-3" />
      </button>
      <p className="font-display text-sm font-light mb-1">{intention.title}</p>
      <p className="text-xs opacity-70 mb-1">{intention.name || "Anonimowo"}</p>
      <p className="text-xs opacity-50">{intention.date}</p>
    </motion.div>
  );
}

interface CandleVisualizationProps {
  intentions: PrayerIntention[];
}

function CandleVisualization({ intentions }: CandleVisualizationProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const massActive = isMassNow();
  const visible = intentions.slice(0, 12);

  return (
    <div
      className="relative flex flex-col items-center py-16 px-4"
      data-ocid="kaplica.candles.canvas_target"
    >
      {/* Mass candle -- center */}
      <div className="flex flex-col items-center mb-12">
        <Candle
          size="large"
          color="#f59e0b"
          glowColor="rgba(245,158,11,0.4)"
          label="Liturgia · Msza Święta"
          isMassActive={massActive}
        />
        {massActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 px-3 py-1 rounded-full text-xs"
            style={{
              background: "rgba(245,158,11,0.2)",
              color: "#fde68a",
              border: "1px solid rgba(245,158,11,0.4)",
            }}
          >
            ✨ Trwa Msza Święta
          </motion.div>
        )}
      </div>

      {/* Intention candles -- semicircle on desktop, row on mobile */}
      {visible.length > 0 && (
        <div
          className="flex flex-wrap justify-center gap-4 max-w-2xl"
          style={{
            ...(massActive ? { transform: "translateY(-8px)" } : {}),
          }}
        >
          {visible.map((intention, i) => (
            <div key={intention.id} className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                data-ocid={`kaplica.intentions.item.${i + 1}`}
              >
                <Candle
                  size="small"
                  color="#fb923c"
                  glowColor="rgba(251,146,60,0.3)"
                  featured={intention.featured}
                  label={
                    intention.title.slice(0, 16) +
                    (intention.title.length > 16 ? "…" : "")
                  }
                  onClick={() =>
                    setSelectedId(
                      selectedId === intention.id ? null : intention.id,
                    )
                  }
                />
              </motion.div>
              <AnimatePresence>
                {selectedId === intention.id && (
                  <IntentionPopup
                    intention={intention}
                    onClose={() => setSelectedId(null)}
                  />
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {visible.length === 0 && (
        <p
          className="text-center text-sm"
          style={{ color: "rgba(253,230,138,0.4)" }}
        >
          Bądź pierwszą zapalającą świecę modlitwy
        </p>
      )}
    </div>
  );
}

// ============================================================
// INTENTION FORM
// ============================================================

const SUBMIT_LS_KEY = "kaplica_last_submit";

function IntentionForm({ onSubmitted }: { onSubmitted: () => void }) {
  const { actor } = useActor();
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = () => {
    const last = localStorage.getItem(SUBMIT_LS_KEY);
    if (!last) return true;
    const lastDate = new Date(Number.parseInt(last));
    const now = new Date();
    return (
      lastDate.getDate() !== now.getDate() ||
      lastDate.getMonth() !== now.getMonth() ||
      lastDate.getFullYear() !== now.getFullYear()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Proszę wypełnić tytuł i treść intencji.");
      return;
    }
    if (!canSubmit()) {
      setError("Możesz złożyć tylko jedną intencję dziennie.");
      return;
    }
    if (!actor) {
      setError("Brak połączenia z serwerem. Spróbuj ponownie.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const intention: PrayerIntention = {
        id: `intention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        title: title.trim(),
        content: content.trim(),
        email: email.trim(),
        visibility,
        status: "pending",
        date: new Date().toLocaleDateString("pl-PL"),
        prayerCount: BigInt(0),
        featured: false,
      };
      await (actor as any).submitPrayerIntention(intention);
      localStorage.setItem(SUBMIT_LS_KEY, Date.now().toString());
      setSuccess(true);
      setName("");
      setTitle("");
      setContent("");
      setEmail("");
      onSubmitted();
    } catch {
      setError("Wystąpił błąd. Spróbuj ponownie.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
        data-ocid="kaplica.form.success_state"
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "oklch(0.90 0.08 145 / 0.3)" }}
        >
          <Check
            className="w-6 h-6"
            style={{ color: "oklch(0.55 0.15 145)" }}
          />
        </div>
        <p className="font-display text-lg font-light mb-1">
          Dziękujemy za Twoją intencję
        </p>
        <p className="font-sans text-sm font-light text-muted-foreground">
          Twoja intencja została złożona i oczekuje na zatwierdzenie.
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-4"
          onClick={() => setSuccess(false)}
        >
          Złóż kolejną intencję
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="font-sans text-xs font-light text-muted-foreground uppercase tracking-wider">
            Imię (opcjonalne)
          </Label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Imię lub Anonimowo"
            className="w-full px-3 py-2 rounded-xl border border-border bg-background/50 font-sans text-sm font-light placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40"
            data-ocid="kaplica.form.name_input"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="font-sans text-xs font-light text-muted-foreground uppercase tracking-wider">
            Email (opcjonalne)
          </Label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (opcjonalnie, do powiadomień)"
            className="w-full px-3 py-2 rounded-xl border border-border bg-background/50 font-sans text-sm font-light placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40"
            data-ocid="kaplica.form.email_input"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="font-sans text-xs font-light text-muted-foreground uppercase tracking-wider">
          Tytuł intencji <span className="text-destructive">*</span>
        </Label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tytuł intencji, np. O zdrowie"
          required
          className="w-full px-3 py-2 rounded-xl border border-border bg-background/50 font-sans text-sm font-light placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40"
          data-ocid="kaplica.form.title_input"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="font-sans text-xs font-light text-muted-foreground uppercase tracking-wider">
          Treść intencji <span className="text-destructive">*</span>
        </Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Treść intencji..."
          rows={4}
          required
          className="font-sans text-sm font-light placeholder:text-muted-foreground/50 rounded-xl resize-none"
          data-ocid="kaplica.form.content_textarea"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="font-sans text-xs font-light text-muted-foreground uppercase tracking-wider">
          Widoczność
        </Label>
        <select
          value={visibility}
          onChange={(e) =>
            setVisibility(e.target.value as "public" | "private")
          }
          className="w-full px-3 py-2 rounded-xl border border-border bg-background/50 font-sans text-sm font-light focus:outline-none focus:ring-1 focus:ring-primary/40"
          data-ocid="kaplica.form.visibility_select"
        >
          <option value="public">
            Publikuj w Kaplicy modlitwy (publiczna)
          </option>
          <option value="private">Tylko do modlitwy parafii (prywatna)</option>
        </select>
      </div>

      {error && <p className="text-xs text-destructive font-sans">{error}</p>}

      <Button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl font-sans font-light text-sm"
        data-ocid="kaplica.form.submit_button"
      >
        {submitting ? "Wysyłanie..." : "🙏 Powierz Bogu"}
      </Button>
    </form>
  );
}

// ============================================================
// INTENTIONS LIST
// ============================================================

type FilterTab = "newest" | "mostPrayers" | "assigned";

function IntentionsList({ intentions }: { intentions: PrayerIntention[] }) {
  const { actor } = useActor();
  const [filter, setFilter] = useState<FilterTab>("newest");
  const [prayedIds, setPrayedIds] = useState<Set<string>>(() => {
    const ids = new Set<string>();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("kaplica_prayed_")) {
        ids.add(key.replace("kaplica_prayed_", ""));
      }
    }
    return ids;
  });
  const [counts, setCounts] = useState<Record<string, number>>({});

  const filtered = intentions
    .filter((i) => i.status === "approved" || i.status === "assigned")
    .filter((i) => {
      if (filter === "assigned") return i.status === "assigned";
      return true;
    })
    .sort((a, b) => {
      if (filter === "mostPrayers") {
        return Number(b.prayerCount) - Number(a.prayerCount);
      }
      return b.date.localeCompare(a.date);
    });

  const handlePray = async (id: string) => {
    if (prayedIds.has(id) || !actor) return;
    try {
      await (actor as any).incrementPrayerCount(id);
      localStorage.setItem(`kaplica_prayed_${id}`, "1");
      setPrayedIds((prev) => new Set([...prev, id]));
      setCounts((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
    } catch {
      /* silent */
    }
  };

  return (
    <div data-ocid="kaplica.intentions.list">
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(
          [
            { key: "newest", label: "Najnowsze" },
            { key: "mostPrayers", label: "Najwięcej modlitw" },
            { key: "assigned", label: "Przypisane do Mszy" },
          ] as { key: FilterTab; label: string }[]
        ).map((tab) => (
          <button
            type="button"
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-sans font-light transition-all ${
              filter === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            data-ocid="kaplica.intentions.filter.tab"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground font-sans text-sm font-light">
          Brak intencji w tej kategorii
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((intention, i) => {
            const prayed = prayedIds.has(intention.id);
            const count =
              Number(intention.prayerCount) + (counts[intention.id] ?? 0);
            return (
              <motion.div
                key={intention.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-border bg-card/60 p-4 flex flex-col sm:flex-row sm:items-start gap-3"
                data-ocid={`kaplica.intentions.item.${i + 1}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-display text-sm font-light">
                      {intention.title}
                    </span>
                    {intention.featured && (
                      <Badge
                        variant="outline"
                        className="text-xs border-amber-400/50 text-amber-600"
                      >
                        ⭐ Świeca dnia
                      </Badge>
                    )}
                    {intention.status === "assigned" && (
                      <Badge
                        variant="outline"
                        className="text-xs border-primary/40 text-primary"
                      >
                        Msza Święta
                      </Badge>
                    )}
                  </div>
                  <p className="font-sans text-sm font-light text-muted-foreground leading-relaxed line-clamp-2 mb-2">
                    {intention.content}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground/60 font-sans">
                    <span>{intention.name || "Anonimowo"}</span>
                    <span>·</span>
                    <span>{intention.date}</span>
                    <span>·</span>
                    <span>🙏 {count}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={() => handlePray(intention.id)}
                    disabled={prayed}
                    className={`px-4 py-2 rounded-xl text-xs font-sans font-light transition-all ${
                      prayed
                        ? "bg-muted text-muted-foreground cursor-default"
                        : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}
                  >
                    {prayed ? "✓ Modlę się" : "🙏 Modlę się"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================
// EDITABLE TEXT
// ============================================================

interface EditableTextProps {
  value: string;
  onSave: (val: string) => void;
  as?: "h1" | "h2" | "p" | "span";
  className?: string;
  multiline?: boolean;
  style?: React.CSSProperties;
}

function EditableText({
  value,
  onSave,
  as: Tag = "p",
  className,
  multiline,
  style,
}: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  if (editing) {
    return (
      <div className="flex flex-col gap-2 w-full">
        {multiline ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            className="w-full bg-white/10 rounded px-2 py-1 text-inherit font-inherit text-sm resize-none"
          />
        ) : (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full bg-white/10 rounded px-2 py-1 text-inherit font-inherit"
          />
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              onSave(draft);
              setEditing(false);
            }}
            className="text-xs text-green-300 hover:text-green-100"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft(value);
              setEditing(false);
            }}
            className="text-xs text-red-300 hover:text-red-100"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }
  return (
    <Tag
      className={className}
      onClick={() => setEditing(true)}
      style={{ cursor: "text", ...style }}
    >
      {value}
    </Tag>
  );
}

// ============================================================
// PAGE
// ============================================================

export function KaplicaPage() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: heroTitle, refetch: refetchTitle } =
    useContentBlock("kaplica_hero_title");
  const { data: heroSubtitle, refetch: refetchSubtitle } = useContentBlock(
    "kaplica_hero_subtitle",
  );
  const { data: heroDesc, refetch: refetchDesc } = useContentBlock(
    "kaplica_hero_description",
  );
  const { data: donationTitle, refetch: refetchDonTitle } = useContentBlock(
    "kaplica_donation_title",
  );
  const { data: donationText, refetch: refetchDonText } = useContentBlock(
    "kaplica_donation_text",
  );
  const { data: accountNumber, refetch: refetchAccount } = useContentBlock(
    "kaplica_account_number",
  );

  const { data: intentions = [], refetch: refetchIntentions } =
    usePublicIntentions();

  const [copied, setCopied] = useState(false);

  const saveBlock = async (key: string, value: string, refetch: () => void) => {
    if (!actor) return;
    try {
      await actor.updateContentBlock(key, value);
      refetch();
    } catch {
      /* silent */
    }
  };

  const handleCopy = () => {
    const text =
      accountNumber ||
      "Parafia św. Jana Chrzciciela\nNumer konta: [do uzupełnienia]";
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const title = heroTitle || "Kaplica modlitwy";
  const subtitle = heroSubtitle || "Powierz Bogu to, co nosisz w sercu";
  const description =
    heroDesc ||
    "Każda intencja jest jak zapalona świeca. Razem tworzymy wspólnotę modlitwy. Msza Święta jest źródłem łaski, wokół której gromadzi się modlitwa parafii.";
  const donTitle = donationTitle || "Ofiara – Dar serca";
  const donText =
    donationText ||
    "Jeśli chcesz wesprzeć życie parafii, możesz złożyć dar serca.";
  const account =
    accountNumber ||
    "Parafia św. Jana Chrzciciela\nNumer konta: [do uzupełnienia przez administratora]";

  const approvedIntentions = intentions.filter(
    (i) => i.status === "approved" || i.status === "assigned",
  );

  return (
    <main className="min-h-screen bg-background">
      <style>{candleStyle}</style>

      {/* ── HERO ────────────────────────────────────────── */}
      <section
        className="relative flex items-center justify-center min-h-[50vh] overflow-hidden"
        data-ocid="kaplica.hero.section"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, #0f0c29 0%, #1a1040 30%, #0d1b3e 60%, #0a0a0a 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "rgba(0,0,0,0.2)" }}
        />

        {/* subtle candle glow in bg */}
        <div
          className="absolute"
          style={{
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(245,158,11,0.08) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        />

        <div className="relative z-10 text-center px-6 max-w-2xl mx-auto py-24">
          {isAuthenticated ? (
            <EditableText
              value={title}
              onSave={(v) => saveBlock("kaplica_hero_title", v, refetchTitle)}
              as="h1"
              className="font-display text-4xl md:text-5xl font-extralight text-white mb-4 cursor-text"
            />
          ) : (
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="font-display text-4xl md:text-5xl font-extralight text-white mb-4"
            >
              {title}
            </motion.h1>
          )}

          {isAuthenticated ? (
            <EditableText
              value={subtitle}
              onSave={(v) =>
                saveBlock("kaplica_hero_subtitle", v, refetchSubtitle)
              }
              className="font-sans text-xl font-light mb-4 cursor-text"
              style={{ color: "rgba(253,230,138,0.9)" }}
            />
          ) : (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="font-sans text-xl font-light mb-4"
              style={{ color: "rgba(253,230,138,0.9)" }}
            >
              {subtitle}
            </motion.p>
          )}

          {isAuthenticated ? (
            <EditableText
              value={description}
              onSave={(v) =>
                saveBlock("kaplica_hero_description", v, refetchDesc)
              }
              className="font-sans text-sm font-light leading-relaxed cursor-text"
              style={{ color: "rgba(255,255,255,0.55)" }}
              multiline
            />
          ) : (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.28 }}
              className="font-sans text-sm font-light leading-relaxed"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              {description}
            </motion.p>
          )}

          {isAuthenticated && (
            <div className="mt-4">
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 text-xs font-sans font-light transition-colors"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                <Pencil className="w-3 h-3" /> Edytuj w panelu
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── INTENTION FORM ──────────────────────────────── */}
      <SectionReveal>
        <section className="py-16 px-4">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <p
                className="font-sans text-xs font-light uppercase tracking-widest mb-2"
                style={{ color: "oklch(0.55 0.08 280)" }}
              >
                Formularz intencji
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-extralight text-foreground">
                Złóż intencję
              </h2>
              <p className="font-sans text-sm font-light text-muted-foreground mt-2">
                Powierz Bogu to, co nosisz w sercu. Każda intencja zostanie
                objęta modlitwą parafii.
              </p>
            </div>
            <Card className="rounded-3xl border-border/50 shadow-sm">
              <CardContent className="pt-6">
                <IntentionForm onSubmitted={() => refetchIntentions()} />
              </CardContent>
            </Card>
          </div>
        </section>
      </SectionReveal>

      {/* ── CANDLE VISUALIZATION ────────────────────────── */}
      <section style={{ background: "#020617" }} className="py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-4">
            <h2
              className="font-display text-2xl md:text-3xl font-extralight"
              style={{ color: "rgba(253,230,138,0.9)" }}
            >
              Kaplica świec
            </h2>
            <p
              className="font-sans text-xs font-light mt-1"
              style={{ color: "rgba(253,230,138,0.4)" }}
            >
              Każda świeca to intencja powierzona Bogu
            </p>
          </div>
          <CandleVisualization intentions={approvedIntentions} />
        </div>
      </section>

      {/* ── PUBLIC INTENTIONS LIST ──────────────────────── */}
      <SectionReveal>
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-extralight text-foreground">
                Wspólnota modlitwy
              </h2>
              <p className="font-sans text-sm font-light text-muted-foreground mt-2">
                Modlimy się razem za siebie nawzajem
              </p>
            </div>
            <IntentionsList intentions={approvedIntentions} />
          </div>
        </section>
      </SectionReveal>

      {/* ── DAR SERCA ───────────────────────────────────── */}
      <SectionReveal>
        <section className="py-16 px-4">
          <div className="max-w-lg mx-auto">
            <Card
              className="rounded-3xl border-border/50"
              style={{
                background: "oklch(0.97 0.015 80 / 0.6)",
              }}
            >
              <CardContent className="pt-8 pb-8 text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "oklch(0.90 0.06 80 / 0.5)" }}
                >
                  <span style={{ fontSize: 22 }}>🕯️</span>
                </div>

                {isAuthenticated ? (
                  <EditableText
                    value={donTitle}
                    onSave={(v) =>
                      saveBlock("kaplica_donation_title", v, refetchDonTitle)
                    }
                    as="h2"
                    className="font-display text-xl font-light text-foreground mb-2 cursor-text"
                  />
                ) : (
                  <h2 className="font-display text-xl font-light text-foreground mb-2">
                    {donTitle}
                  </h2>
                )}

                {isAuthenticated ? (
                  <EditableText
                    value={donText}
                    onSave={(v) =>
                      saveBlock("kaplica_donation_text", v, refetchDonText)
                    }
                    className="font-sans text-sm font-light text-muted-foreground mb-6 cursor-text"
                    multiline
                  />
                ) : (
                  <p className="font-sans text-sm font-light text-muted-foreground mb-6">
                    {donText}
                  </p>
                )}

                <div
                  className="rounded-2xl px-6 py-4 mb-4 text-left"
                  style={{
                    background: "oklch(0.94 0.02 80)",
                    border: "1px solid oklch(0.87 0.04 80)",
                  }}
                >
                  {isAuthenticated ? (
                    <EditableText
                      value={account}
                      onSave={(v) =>
                        saveBlock("kaplica_account_number", v, refetchAccount)
                      }
                      className="font-sans text-sm font-light text-foreground whitespace-pre-line cursor-text"
                      multiline
                    />
                  ) : (
                    <p className="font-sans text-sm font-light text-foreground whitespace-pre-line">
                      {account}
                    </p>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="rounded-xl font-sans font-light gap-2"
                  data-ocid="kaplica.donation.copy_button"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Skopiowano!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Kopiuj numer konta
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </SectionReveal>
    </main>
  );
}
