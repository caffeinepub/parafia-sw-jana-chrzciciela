import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useState } from "react";
import { WspolnotySkeleton } from "../components/parish/PageSkeleton";
import { SectionReveal } from "../components/parish/SectionReveal";
import { useActor } from "../hooks/useActor";
import { Link } from "../router";

// ============================================================
// COMMUNITY COLOR PALETTE
// ============================================================

const COMMUNITY_PALETTE = [
  "#3B82F6", // sapphire blue
  "#10B981", // emerald green
  "#8B5CF6", // violet
  "#F43F5E", // rose
  "#14B8A6", // teal
  "#6366F1", // indigo
  "#F59E0B", // amber
  "#0EA5E9", // sky blue
];

// ============================================================
// COMMUNITY TYPE
// ============================================================

export interface Community {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  meetingDay: string;
  meetingTime: string;
  meetingPlace: string;
  caretaker: string;
  contactPhone: string;
  contactEmail: string;
  order: number;
  heroImageUrl?: string;
}

const CONTENT_KEY = "communities";

// ============================================================
// WSPOLNOTY META
// ============================================================

export interface WspolnotyMeta {
  heroSubtitle: string;
  heroDescription: string;
  mapLabel: string;
  mapTitle: string;
  centerLine1: string;
  centerLine2: string;
  invitationTitle: string;
  invitationText: string;
}

const META_KEY = "wspolnotyMeta";

export const DEFAULT_META: WspolnotyMeta = {
  heroSubtitle:
    "Parafia żyje dzięki ludziom, którzy razem modlą się, służą i wzrastają w wierze.",
  heroDescription:
    "W naszej parafii działa wiele wspólnot. Każda z nich jest miejscem modlitwy, przyjaźni i duchowego wzrostu.",
  mapLabel: "Kręgi na wodzie",
  mapTitle: "Centrum życia parafialnego",
  centerLine1: "Liturgia",
  centerLine2: "Msza Święta",
  invitationTitle: "Znajdź swoje miejsce we wspólnocie",
  invitationText:
    "Każdy ma w Kościele swoje miejsce i swoje powołanie. Jeśli chcesz dołączyć do jednej ze wspólnot – zapraszamy.",
};

export function useWspolnotyMeta() {
  const { actor, isFetching } = useActor();
  return useQuery<WspolnotyMeta>({
    queryKey: ["wspolnotyMeta"],
    queryFn: async () => {
      if (!actor) return DEFAULT_META;
      try {
        const block = await (actor as any).getContentBlock(META_KEY);
        if (!block) return DEFAULT_META;
        const raw =
          typeof block === "string" ? block : ((block as any)?.content ?? "");
        if (!raw) return DEFAULT_META;
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_META, ...parsed };
      } catch {
        return DEFAULT_META;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
  });
}

// ============================================================
// COMMUNITY QUERIES
// ============================================================

const LS_KEY_COMMUNITIES = "parish_communities_cache";

export function useAllCommunities() {
  const { actor, isFetching } = useActor();

  const getLocalData = () => {
    try {
      const raw = localStorage.getItem(LS_KEY_COMMUNITIES);
      return raw ? (JSON.parse(raw) as Community[]) : undefined;
    } catch {
      return undefined;
    }
  };

  return useQuery<Community[]>({
    queryKey: ["communities"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const block = await (actor as any).getContentBlock(CONTENT_KEY);
        if (!block || block === null) return [];
        const raw =
          typeof block === "string" ? block : ((block as any)?.content ?? "");
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        const result = Array.isArray(parsed) ? parsed : [];
        try {
          localStorage.setItem(LS_KEY_COMMUNITIES, JSON.stringify(result));
        } catch {}
        return result;
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
    placeholderData: getLocalData,
  });
}

// ============================================================
// HERO
// ============================================================

function WspolnotyHero({ meta }: { meta: WspolnotyMeta }) {
  return (
    <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border border-primary/5"
            style={{
              width: `${i * 25}vw`,
              height: `${i * 25}vw`,
              maxWidth: `${i * 300}px`,
              maxHeight: `${i * 300}px`,
              animation: `pulse ${3 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto space-y-6 py-24">
        <p className="font-sans text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Parafia Żywa
        </p>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extralight text-foreground tracking-tight leading-none">
          Wspólnoty
        </h1>
        <div className="w-12 h-px bg-primary/30 mx-auto" />
        <p className="font-editorial text-lg sm:text-xl font-light text-foreground/70 leading-relaxed">
          {meta.heroSubtitle}
        </p>
        <p className="font-sans text-sm text-muted-foreground/70 leading-relaxed">
          {meta.heroDescription}
        </p>
      </div>
    </section>
  );
}

// ============================================================
// INTERACTIVE MAP
// ============================================================

function CommunityMap({
  communities,
  onSelect,
  meta,
}: {
  communities: Community[];
  onSelect: (c: Community) => void;
  meta: WspolnotyMeta;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const maxVisible = 8;
  const visible = communities.slice(0, maxVisible);

  const getPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const radius = 170;
    return {
      x: 260 + radius * Math.cos(angle),
      y: 260 + radius * Math.sin(angle),
    };
  };

  return (
    <div
      className="hidden md:flex justify-center items-center py-8"
      data-ocid="wspolnoty.map.canvas_target"
    >
      <div className="relative" style={{ width: 520, height: 520 }}>
        <svg
          width="520"
          height="520"
          viewBox="0 0 520 520"
          className="absolute inset-0"
          aria-hidden="true"
        >
          {/* Orbit rings with warm golden tint */}
          {[80, 140, 200].map((r, i) => (
            <circle
              key={r}
              cx="260"
              cy="260"
              r={r}
              fill="none"
              stroke="#F59E0B"
              strokeOpacity="0.12"
              strokeWidth="0.5"
              style={{
                animation: `pulse ${4 + i}s ease-in-out infinite`,
                animationDelay: `${i * 0.7}s`,
              }}
            />
          ))}
          {/* Connecting lines using each community's palette color */}
          {visible.map((c, i) => {
            const pos = getPosition(i, visible.length);
            const color = COMMUNITY_PALETTE[i % COMMUNITY_PALETTE.length];
            return (
              <line
                key={`line-${c.id}`}
                x1="260"
                y1="260"
                x2={pos.x}
                y2={pos.y}
                stroke={color}
                strokeOpacity="0.3"
                strokeWidth="0.5"
              />
            );
          })}
        </svg>

        {/* Center - Golden Sun / Liturgia */}
        <div
          className="absolute flex items-center justify-center"
          style={{ left: 260 - 56, top: 260 - 56, width: 112, height: 112 }}
        >
          <div
            className="w-28 h-28 rounded-full flex flex-col items-center justify-center text-center"
            style={{
              background:
                "radial-gradient(circle at 40% 35%, #FDE68A 0%, #F59E0B 55%, #D97706 100%)",
              border: "2px solid #FCD34D",
              boxShadow:
                "0 0 24px 8px rgba(251,191,36,0.35), 0 0 48px 16px rgba(251,191,36,0.15)",
              animation: "pulse 3s ease-in-out infinite",
            }}
          >
            <span
              className="font-sans text-xs font-medium leading-tight tracking-wide uppercase"
              style={{ color: "#78350F" }}
            >
              {meta.centerLine1}
            </span>
            <span
              className="font-sans text-[9px] leading-tight mt-0.5"
              style={{ color: "rgba(146,64,14,0.70)" }}
            >
              {meta.centerLine2}
            </span>
          </div>
        </div>

        {/* Planet nodes */}
        {visible.map((c, i) => {
          const pos = getPosition(i, visible.length);
          const isHovered = hovered === c.id;
          const color = COMMUNITY_PALETTE[i % COMMUNITY_PALETTE.length];

          const defaultStyle: React.CSSProperties = {
            background: `${color}18`,
            border: `1.5px solid ${color}60`,
            color: color,
          };
          const hoveredStyle: React.CSSProperties = {
            background: `${color}30`,
            border: `2px solid ${color}`,
            color: color,
            boxShadow: `0 0 16px 4px ${color}40`,
          };

          return (
            <button
              type="button"
              key={c.id}
              className="absolute cursor-pointer bg-transparent border-none p-0"
              style={{
                left: pos.x - 40,
                top: pos.y - 40,
                width: 80,
                height: 80,
              }}
              onMouseEnter={() => setHovered(c.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect(c)}
              data-ocid="wspolnoty.map.map_marker"
            >
              <motion.div
                className="w-20 h-20 rounded-full flex flex-col items-center justify-center text-center transition-colors duration-200"
                style={isHovered ? hoveredStyle : defaultStyle}
                animate={{ y: isHovered ? -4 : 0, scale: isHovered ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <span
                  className="font-sans text-[9px] text-center px-1 leading-tight font-medium"
                  style={{ color: color }}
                >
                  {c.name.length > 14 ? `${c.name.substring(0, 12)}…` : c.name}
                </span>
              </motion.div>
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute z-10 bg-card border border-border rounded-xl shadow-lg p-3 w-48 pointer-events-none"
                    style={{
                      left: "50%",
                      transform: "translateX(-50%)",
                      top: pos.y > 260 ? -80 : 88,
                    }}
                  >
                    <p className="font-sans text-xs font-medium text-foreground">
                      {c.name}
                    </p>
                    {c.shortDescription && (
                      <p className="font-sans text-[10px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                        {c.shortDescription}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// COMMUNITY CARD
// ============================================================

function CommunityCard({
  community,
  index,
  onSelect,
}: {
  community: Community;
  index: number;
  onSelect: (c: Community) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
      data-ocid={`wspolnoty.item.${index + 1}`}
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-muted/40 to-muted/80 relative overflow-hidden">
        {community.heroImageUrl ? (
          <img
            src={community.heroImageUrl}
            alt={community.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <span className="font-display text-2xl font-light text-primary/60">
                {community.name.charAt(0)}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="p-6 space-y-4">
        <h3 className="font-display text-xl font-light text-foreground">
          {community.name}
        </h3>
        {community.shortDescription && (
          <p className="font-sans text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {community.shortDescription}
          </p>
        )}
        {(community.meetingDay || community.meetingTime) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-sans">
              {[community.meetingDay, community.meetingTime]
                .filter(Boolean)
                .join(" \u00B7 ")}
            </span>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full rounded-full font-sans font-light text-sm hover:bg-primary/5 transition-colors"
          onClick={() => onSelect(community)}
          data-ocid="wspolnoty.card.button"
        >
          Zobacz wspólnotę <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
}

// ============================================================
// DETAIL PANEL
// ============================================================

function DetailPanel({
  community,
  onClose,
}: {
  community: Community | null;
  onClose: () => void;
}) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {community && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
            data-ocid="wspolnoty.panel"
          />
          {/* Slide-in panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border shadow-2xl z-50 overflow-y-auto"
            data-ocid="wspolnoty.detail.panel"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors z-10"
              data-ocid="wspolnoty.detail.close_button"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Hero image */}
            {community.heroImageUrl && (
              <div className="aspect-[16/9] relative overflow-hidden bg-muted/30">
                <img
                  src={community.heroImageUrl}
                  alt={community.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              </div>
            )}

            <div className="p-6 space-y-6">
              {/* Name */}
              <h2 className="font-display text-2xl font-light text-foreground pr-10">
                {community.name}
              </h2>

              {/* Short description */}
              {community.shortDescription && (
                <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                  {community.shortDescription}
                </p>
              )}

              {/* Divider */}
              <div className="w-12 h-px bg-primary/30" />

              {/* Full description */}
              {community.fullDescription && (
                <p className="font-sans text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                  {community.fullDescription}
                </p>
              )}

              {/* Meeting info */}
              {(community.meetingDay ||
                community.meetingTime ||
                community.meetingPlace) && (
                <div className="space-y-2">
                  <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Spotkania
                  </p>
                  <div className="space-y-1.5">
                    {(community.meetingDay || community.meetingTime) && (
                      <div className="flex items-center gap-2 text-sm text-foreground/70">
                        <Calendar className="w-4 h-4 flex-shrink-0 text-primary/60" />
                        <span className="font-sans">
                          {[community.meetingDay, community.meetingTime]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </div>
                    )}
                    {community.meetingPlace && (
                      <div className="flex items-center gap-2 text-sm text-foreground/70">
                        <MapPin className="w-4 h-4 flex-shrink-0 text-primary/60" />
                        <span className="font-sans">
                          {community.meetingPlace}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Caretaker & contact */}
              {(community.caretaker ||
                community.contactPhone ||
                community.contactEmail) && (
                <div className="space-y-2">
                  <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Kontakt
                  </p>
                  <div className="space-y-1.5">
                    {community.caretaker && (
                      <div className="flex items-center gap-2 text-sm text-foreground/70">
                        <User className="w-4 h-4 flex-shrink-0 text-primary/60" />
                        <span className="font-sans">{community.caretaker}</span>
                      </div>
                    )}
                    {community.contactPhone && (
                      <div className="flex items-center gap-2 text-sm text-foreground/70">
                        <Phone className="w-4 h-4 flex-shrink-0 text-primary/60" />
                        <a
                          href={`tel:${community.contactPhone}`}
                          className="font-sans hover:text-primary transition-colors"
                        >
                          {community.contactPhone}
                        </a>
                      </div>
                    )}
                    {community.contactEmail && (
                      <div className="flex items-center gap-2 text-sm text-foreground/70">
                        <Mail className="w-4 h-4 flex-shrink-0 text-primary/60" />
                        <a
                          href={`mailto:${community.contactEmail}`}
                          className="font-sans hover:text-primary transition-colors"
                        >
                          {community.contactEmail}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// INVITATION
// ============================================================

function InvitationSection({ meta }: { meta: WspolnotyMeta }) {
  return (
    <SectionReveal>
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <p className="font-sans text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Zaproszenie
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-extralight text-foreground">
            {meta.invitationTitle}
          </h2>
          <div className="w-12 h-px bg-primary/30 mx-auto" />
          <p className="font-sans text-muted-foreground leading-relaxed">
            {meta.invitationText}
          </p>
          <Link
            to="/kontakt"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary/90 text-primary-foreground rounded-full font-sans text-sm font-light hover:bg-primary transition-colors duration-300"
            data-ocid="wspolnoty.invitation.primary_button"
          >
            Skontaktuj się z nami <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </SectionReveal>
  );
}

// ============================================================
// MAIN
// ============================================================

export function WspolnotyPage() {
  const { data: communities = [], isLoading } = useAllCommunities();
  const { data: meta = DEFAULT_META } = useWspolnotyMeta();
  const [selected, setSelected] = useState<Community | null>(null);

  if (isLoading && communities.length === 0) {
    return <WspolnotySkeleton />;
  }

  return (
    <main className="pt-nav">
      <WspolnotyHero meta={meta} />

      {!isLoading && communities.length > 0 && (
        <SectionReveal>
          <section className="py-12 px-4 bg-muted/10">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8">
                <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {meta.mapLabel}
                </p>
                <h2 className="font-display text-2xl font-extralight text-foreground mt-2">
                  {meta.mapTitle}
                </h2>
              </div>
              <CommunityMap
                communities={communities}
                onSelect={setSelected}
                meta={meta}
              />
            </div>
          </section>
        </SectionReveal>
      )}

      <SectionReveal>
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Nasze grupy
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-extralight text-foreground mt-2">
                Wspólnoty parafialne
              </h2>
            </div>
            {isLoading ? (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                data-ocid="wspolnoty.list.loading_state"
              >
                {Array.from({ length: 6 }).map((_item, i) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                    key={`sk-${i}`}
                    className="rounded-2xl overflow-hidden border border-border"
                  >
                    <Skeleton className="aspect-[4/3]" />
                    <div className="p-6 space-y-3">
                      <Skeleton className="h-6 w-2/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-9 w-full rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : communities.length === 0 ? (
              <div
                className="text-center py-24 px-4"
                data-ocid="wspolnoty.list.empty_state"
              >
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
                  <span className="font-display text-3xl font-light text-muted-foreground/40">
                    W
                  </span>
                </div>
                <p className="font-display text-2xl font-extralight text-muted-foreground mb-2">
                  Brak wspólnot
                </p>
                <p className="font-sans text-sm text-muted-foreground/60">
                  Wspólnoty zostaną dodane przez administratora.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {communities.map((c, i) => (
                  <CommunityCard
                    key={c.id}
                    community={c}
                    index={i}
                    onSelect={setSelected}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </SectionReveal>

      <InvitationSection meta={meta} />

      <DetailPanel community={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
