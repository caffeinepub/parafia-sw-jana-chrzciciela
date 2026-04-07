import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, Copy, Pencil, Save, Star, X } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { ModlitwaSkeleton } from "../components/parish/PageSkeleton";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { getWeekId } from "../hooks/useLiturgy";

// ============================================================
// TYPES
// ============================================================

export interface PrayerStar {
  id: string;
  name?: string;
  city?: string;
  intention?: string;
  isPublic: boolean;
  isApproved: boolean;
  joinedAt: string;
  color: string;
  prayCount: number;
  isHidden?: boolean;
}

export interface MassIntention {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  intention: string;
  status: "pending" | "approved" | "rejected" | "archived";
  offeringStatus: "none" | "paid" | "pending";
  assignedWeekId?: string;
  assignedDayIndex?: number;
  assignedEntryId?: string;
  assignedMassTime?: string;
  assignedMassDate?: string;
  createdAt: string;
  color: string;
}

export interface LiturgyService {
  id: string;
  serviceType: string;
  description: string;
  time: string;
  date: string;
  color: string;
}

export interface ModlitwaConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  accountNumber: string;
  bankOwner: string;
  thankYouTitle: string;
  thankYouText: string;
}

const DEFAULT_CONFIG: ModlitwaConfig = {
  heroTitle: "Sanktuarium modlitwy",
  heroSubtitle: "Dołącz do wspólnej modlitwy Kościoła",
  heroDescription:
    "Każda Msza Święta jest źródłem łaski. Każda modlitwa jest światłem. Każda ofiara pomaga życiu parafii i dziełom miłosierdzia.",
  accountNumber: "XX XXXX XXXX XXXX XXXX XXXX XXXX",
  bankOwner: "Parafia św. Jana Chrzciciela",
  thankYouTitle: "Dziękujemy za dar modlitwy i ofiary",
  thankYouText:
    "Wasza modlitwa i ofiary pomagają życiu naszej parafii oraz dziełom miłosierdzia.",
};

const STAR_COLORS = [
  "#FFD700",
  "#4FC3F7",
  "#4DB6AC",
  "#F5F5F5",
  "#81C784",
  "#CE93D8",
  "#FF8A65",
  "#80DEEA",
];

const SERVICE_TYPE_COLORS: Record<string, string> = {
  adoracja: "#A78BFA",
  rozaniec: "#F472B6",
  droga_krzyzowa: "#FB923C",
  gorzkie_zale: "#818CF8",
  majowe: "#34D399",
  czerwcowe: "#FBBF24",
  inne: "#60A5FA",
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
  adoracja: "Adoracja",
  rozaniec: "Różaniec",
  droga_krzyzowa: "Droga Krzyżowa",
  gorzkie_zale: "Gorzkie Żale",
  majowe: "Nab. majowe",
  czerwcowe: "Nab. czerwcowe",
  inne: "Nabożeństwo",
};

// ============================================================
// STORAGE HELPERS
// ============================================================

export function loadConfig(): ModlitwaConfig {
  try {
    const raw = localStorage.getItem("modlitwa_config");
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_CONFIG;
}

export function saveConfig(cfg: ModlitwaConfig) {
  localStorage.setItem("modlitwa_config", JSON.stringify(cfg));
}

export function loadPrayers(): PrayerStar[] {
  try {
    const raw = localStorage.getItem("modlitwa_prayers");
    if (raw) return JSON.parse(raw) as PrayerStar[];
  } catch {}
  return [];
}

export function savePrayers(prayers: PrayerStar[]) {
  localStorage.setItem("modlitwa_prayers", JSON.stringify(prayers));
}

const INTENTION_EXPIRY_DAYS = 9;

export function loadMassIntentions(): MassIntention[] {
  try {
    const raw = localStorage.getItem("modlitwa_mass_intentions");
    if (raw) {
      const all = JSON.parse(raw) as MassIntention[];
      const now = Date.now();
      const expiryMs = INTENTION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      const valid = all.filter((i) => {
        const age = now - new Date(i.createdAt).getTime();
        return age < expiryMs;
      });
      // Persist cleaned list if any were removed
      if (valid.length !== all.length) {
        localStorage.setItem("modlitwa_mass_intentions", JSON.stringify(valid));
      }
      return valid;
    }
  } catch {}
  return [];
}

export function saveMassIntentions(intentions: MassIntention[]) {
  localStorage.setItem("modlitwa_mass_intentions", JSON.stringify(intentions));
}

// ============================================================
// BACKEND TYPE CONVERSION
// ============================================================

import type { backendInterface } from "../backend";
type BackendPrayerStar = Parameters<backendInterface["savePrayerStar"]>[0];
type BackendMassIntention = Parameters<
  backendInterface["saveMassIntention"]
>[0];

export function prayerFromBackend(b: BackendPrayerStar): PrayerStar {
  return {
    id: b.id,
    name: b.name,
    city: b.city,
    intention: b.intention,
    isPublic: b.isPublic,
    isApproved: b.isApproved,
    joinedAt: b.joinedAt,
    color: b.color,
    prayCount: Number(b.prayCount),
    isHidden: b.isHidden,
  };
}

export function prayerToBackend(p: PrayerStar): BackendPrayerStar {
  return {
    id: p.id,
    name: p.name,
    city: p.city,
    intention: p.intention,
    isPublic: p.isPublic,
    isApproved: p.isApproved,
    joinedAt: p.joinedAt,
    color: p.color,
    prayCount: BigInt(p.prayCount),
    isHidden: p.isHidden ?? false,
  };
}

export function intentionFromBackend(b: BackendMassIntention): MassIntention {
  return {
    id: b.id,
    name: b.name,
    phone: b.phone,
    email: b.email,
    intention: b.intention,
    status: (b.status as MassIntention["status"]) || "pending",
    offeringStatus:
      (b.offeringStatus as MassIntention["offeringStatus"]) || "none",
    assignedWeekId: b.assignedWeekId,
    assignedDayIndex:
      b.assignedDayIndex !== undefined ? Number(b.assignedDayIndex) : undefined,
    assignedEntryId: b.assignedEntryId,
    assignedMassTime: b.assignedMassTime,
    assignedMassDate: b.assignedMassDate,
    createdAt: b.createdAt,
    color: b.color,
  };
}

export function intentionToBackend(i: MassIntention): BackendMassIntention {
  return {
    id: i.id,
    name: i.name,
    phone: i.phone,
    email: i.email,
    intention: i.intention,
    status: i.status,
    offeringStatus: i.offeringStatus,
    assignedWeekId: i.assignedWeekId,
    assignedDayIndex:
      i.assignedDayIndex !== undefined ? BigInt(i.assignedDayIndex) : undefined,
    assignedEntryId: i.assignedEntryId,
    assignedMassTime: i.assignedMassTime,
    assignedMassDate: i.assignedMassDate,
    createdAt: i.createdAt,
    color: i.color,
  };
}

// ============================================================
// HELPERS
// ============================================================

function starPolygon(cx: number, cy: number, r: number): string {
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.4;
    points.push(
      `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`,
    );
  }
  return points.join(" ");
}

// ============================================================
// MAP COMPONENT
// ============================================================

const VW = 800;
const VH = 500;
const CX = VW / 2;
const CY = VH / 2;

const SanctuaryMap = React.memo(function SanctuaryMap({
  prayers,
  massIntentions,
  services,
  onPrayerClick,
  onIntentionClick,
  onServiceClick,
}: {
  prayers: PrayerStar[];
  massIntentions: MassIntention[];
  services: LiturgyService[];
  onPrayerClick: (star: PrayerStar) => void;
  onIntentionClick: (intention: MassIntention) => void;
  onServiceClick: (service: LiturgyService) => void;
}) {
  const approvedPrayers = prayers.filter((p) => p.isApproved && !p.isHidden);
  const approvedIntentions = massIntentions.filter(
    (i) => i.status === "approved",
  );

  const [hoveredPrayer, setHoveredPrayer] = useState<string | null>(null);
  const [hoveredIntention, setHoveredIntention] = useState<string | null>(null);
  const [hoveredService, setHoveredService] = useState<string | null>(null);

  // Three rings: intentions (inner), prayers (outer), services (outermost)
  const innerRadius = 110;
  const outerRadius = 175;
  const serviceRadius = 220; // safe: CY=250, 250-220=30 > 0

  const intentionPositions = approvedIntentions.map((intention, i) => {
    const angle =
      (i / Math.max(approvedIntentions.length, 1)) * 2 * Math.PI - Math.PI / 2;
    return {
      id: intention.id,
      sx: CX + innerRadius * Math.cos(angle),
      sy: CY + innerRadius * Math.sin(angle),
      intention,
    };
  });

  const prayerPositions = approvedPrayers.map((prayer, i) => {
    const count = Math.max(approvedPrayers.length, 1);
    const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
    const r = outerRadius + ((i * 31 + 17) % 30) - 15;
    return {
      id: prayer.id,
      sx: CX + r * Math.cos(angle),
      sy: CY + r * Math.sin(angle),
      prayer,
    };
  });

  const servicePositions = services.map((service, i) => {
    const angle =
      (i / Math.max(services.length, 1)) * 2 * Math.PI - Math.PI / 2;
    return {
      id: service.id,
      sx: CX + serviceRadius * Math.cos(angle),
      sy: CY + serviceRadius * Math.sin(angle),
      service,
    };
  });

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden"
      style={{ background: "#060614" }}
      data-ocid="modlitwa.map.canvas_target"
    >
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="w-full"
        style={{ display: "block", maxHeight: "520px" }}
        role="img"
        aria-label="Mapa Sanktuarium Modlitwy"
      >
        <defs>
          <radialGradient id="sunGradient2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="25%" stopColor="#fffde7" stopOpacity="1" />
            <stop offset="55%" stopColor="#FFD700" stopOpacity="1" />
            <stop offset="80%" stopColor="#FF8C00" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FF4500" stopOpacity="0.2" />
          </radialGradient>
          <filter id="sunGlow2">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="starGlow2">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="intentionGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background stars */}
        {Array.from({ length: 80 }).map((_, i) => (
          <circle
            key={`bg-${(i * 137 + i * 97) % 9999}`}
            cx={(((i * 137.5) % 100) / 100) * VW}
            cy={(((i * 97.3) % 100) / 100) * VH}
            r={0.4 + (i % 3) * 0.35}
            fill="white"
            opacity={0.04 + (i % 6) * 0.025}
          />
        ))}

        {/* Orbit rings */}
        <circle
          cx={CX}
          cy={CY}
          r={innerRadius}
          fill="none"
          stroke="#FFD700"
          strokeWidth="0.5"
          opacity="0.1"
          strokeDasharray="4 8"
        />
        <circle
          cx={CX}
          cy={CY}
          r={outerRadius}
          fill="none"
          stroke="#4FC3F7"
          strokeWidth="0.5"
          opacity="0.07"
          strokeDasharray="4 12"
        />
        {/* Third ring for services */}
        <circle
          cx={CX}
          cy={CY}
          r={serviceRadius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="0.5"
          strokeDasharray="3 10"
        />

        {/* Lines to intention stars (inner ring) */}
        {intentionPositions.map(({ id, sx, sy, intention }) => (
          <line
            key={`line-i-${id}`}
            x1={CX}
            y1={CY}
            x2={sx}
            y2={sy}
            stroke={intention.offeringStatus === "paid" ? "#FFD700" : "#FF8C00"}
            strokeWidth={hoveredIntention === id ? 1.5 : 0.8}
            opacity={hoveredIntention === id ? 0.6 : 0.25}
            style={{ transition: "opacity 0.3s" }}
          />
        ))}

        {/* Lines to prayer stars (outer ring) */}
        {prayerPositions.map(({ id, sx, sy, prayer }) => (
          <line
            key={`line-p-${id}`}
            x1={CX}
            y1={CY}
            x2={sx}
            y2={sy}
            stroke={prayer.color}
            strokeWidth={hoveredPrayer === id ? 1.2 : 0.5}
            opacity={hoveredPrayer === id ? 0.4 : 0.15}
            style={{ transition: "opacity 0.3s" }}
          />
        ))}

        {/* Lines to service stars (third ring) */}
        {servicePositions.map(({ id, sx, sy, service }) => (
          <line
            key={`line-s-${id}`}
            x1={CX}
            y1={CY}
            x2={sx}
            y2={sy}
            stroke={service.color}
            strokeWidth={hoveredService === id ? 1.2 : 0.5}
            opacity={hoveredService === id ? 0.4 : 0.2}
            style={{ transition: "opacity 0.3s" }}
          />
        ))}

        {/* Sun aureoles */}
        {[95, 78, 62, 48].map((r, i) => (
          <circle
            key={`au-${r}`}
            cx={CX}
            cy={CY}
            r={r}
            fill="none"
            stroke="#FFD700"
            strokeWidth="1"
            opacity={[0.06, 0.1, 0.16, 0.22][i]}
          />
        ))}

        {/* Sun */}
        <circle
          cx={CX}
          cy={CY}
          r={52}
          fill="url(#sunGradient2)"
          filter="url(#sunGlow2)"
          className="animate-pulse"
        />
        <text
          x={CX}
          y={CY + 72}
          textAnchor="middle"
          fontSize="10.5"
          fill="#FFD700"
          fontFamily="serif"
          opacity="0.85"
          letterSpacing="1"
        >
          Msza Święta
        </text>

        {/* Legend */}
        {approvedIntentions.length > 0 && (
          <text
            x={VW - 10}
            y={20}
            textAnchor="end"
            fontSize="9"
            fill="#FFD700"
            opacity="0.4"
          >
            ◆ intencje mszalne
          </text>
        )}
        {approvedPrayers.length > 0 && (
          <text
            x={VW - 10}
            y={34}
            textAnchor="end"
            fontSize="9"
            fill="#4FC3F7"
            opacity="0.4"
          >
            ● modlące się osoby
          </text>
        )}
        {services.length > 0 && (
          <text
            x={VW - 10}
            y={48}
            textAnchor="end"
            fontSize="9"
            fill="white"
            opacity="0.35"
          >
            ✦ nabożeństwa
          </text>
        )}

        {/* Mass intention stars (inner ring) - diamond shape */}
        {intentionPositions.map(({ id, sx, sy, intention }) => {
          const isHov = hoveredIntention === id;
          const isPaid = intention.offeringStatus === "paid";
          const s = isHov ? 10 : 7;
          const color = isPaid ? "#FFD700" : "#FF8C00";
          return (
            <g
              key={id}
              onMouseEnter={() => setHoveredIntention(id)}
              onMouseLeave={() => setHoveredIntention(null)}
              onClick={() => onIntentionClick(intention)}
              style={{ cursor: "pointer" }}
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" && onIntentionClick(intention)
              }
            >
              <circle
                cx={sx}
                cy={sy}
                r={s + 8}
                fill={color}
                opacity={isHov ? 0.18 : 0.06}
                style={{ transition: "all 0.3s" }}
              />
              <polygon
                points={`${sx},${sy - s} ${sx + s},${sy} ${sx},${sy + s} ${sx - s},${sy}`}
                fill={color}
                filter="url(#intentionGlow)"
                style={{ transition: "all 0.3s" }}
              />
            </g>
          );
        })}

        {/* Prayer stars (outer ring) - circle shape */}
        {prayerPositions.map(({ id, sx, sy, prayer }) => {
          const isHov = hoveredPrayer === id;
          const r = isHov ? 8 : 5;
          return (
            <g
              key={id}
              onMouseEnter={() => setHoveredPrayer(id)}
              onMouseLeave={() => setHoveredPrayer(null)}
              onClick={() => onPrayerClick(prayer)}
              style={{ cursor: "pointer" }}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onPrayerClick(prayer)}
            >
              <circle
                cx={sx}
                cy={sy}
                r={r + 7}
                fill={prayer.color}
                opacity={isHov ? 0.18 : 0.06}
                style={{ transition: "all 0.3s" }}
              />
              <circle
                cx={sx}
                cy={sy}
                r={r}
                fill={prayer.color}
                filter="url(#starGlow2)"
                style={{ transition: "r 0.3s" }}
              />
            </g>
          );
        })}

        {/* Service stars (third ring) - 5-pointed star shape */}
        {servicePositions.map(({ id, sx, sy, service }) => {
          const isHov = hoveredService === id;
          const r = isHov ? 10 : 8;
          return (
            <g
              key={id}
              onMouseEnter={() => setHoveredService(id)}
              onMouseLeave={() => setHoveredService(null)}
              onClick={() => onServiceClick(service)}
              style={{ cursor: "pointer" }}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onServiceClick(service)}
            >
              <circle
                cx={sx}
                cy={sy}
                r={r + 8}
                fill={service.color}
                opacity={isHov ? 0.2 : 0.07}
                style={{ transition: "all 0.3s" }}
              />
              <polygon
                points={starPolygon(sx, sy, r)}
                fill={service.color}
                filter="url(#intentionGlow)"
                style={{ transition: "all 0.3s" }}
              />
            </g>
          );
        })}

        {approvedPrayers.length === 0 &&
          approvedIntentions.length === 0 &&
          services.length === 0 && (
            <text
              x={CX}
              y={CY + 120}
              textAnchor="middle"
              fontSize="11"
              fill="white"
              opacity="0.3"
            >
              Bądź pierwszą gwiazdą modlitwy
            </text>
          )}
      </svg>
    </div>
  );
});

// ============================================================
// MAIN PAGE
// ============================================================

export function ModlitwaPage() {
  const { identity } = useInternetIdentity();
  const isAdmin = !!identity;

  const [config, setConfig] = useState<ModlitwaConfig>(loadConfig);
  const [editingHero, setEditingHero] = useState(false);
  const [heroDraft, setHeroDraft] = useState<ModlitwaConfig>(DEFAULT_CONFIG);

  const [prayers, setPrayers] = useState<PrayerStar[]>(loadPrayers);
  const [massIntentions, setMassIntentions] =
    useState<MassIntention[]>(loadMassIntentions);

  const { actor, isFetching } = useActor();

  const [liturgyIntentions, setLiturgyIntentions] = useState<MassIntention[]>(
    [],
  );
  const [liturgyServices, setLiturgyServices] = useState<LiturgyService[]>([]);
  const [selectedService, setSelectedService] = useState<LiturgyService | null>(
    null,
  );

  const [liturgyRefreshToken, setLiturgyRefreshToken] = useState(0);
  const showSkeleton =
    isFetching && prayers.length === 0 && massIntentions.length === 0;

  // Listen for liturgy changes from other tabs/admin panel
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "liturgy_weeks") {
        setLiturgyRefreshToken((t) => t + 1);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Load prayers, intentions, config from backend (localStorage is immediate cache)
  useEffect(() => {
    if (!actor) return;
    void (async () => {
      try {
        const [backendPrayers, backendIntentions, backendConfig] =
          await Promise.all([
            actor.getPrayerStars(),
            actor.getMassIntentions(),
            actor.getModlitwaConfig(),
          ]);

        // Prayers migration: if backend empty but localStorage has data, migrate
        const lsPrayers = loadPrayers();
        if (backendPrayers.length === 0 && lsPrayers.length > 0) {
          for (const star of lsPrayers) {
            try {
              await actor.savePrayerStar(prayerToBackend(star));
            } catch {
              /* silent */
            }
          }
          setPrayers(lsPrayers);
        } else {
          const convertedPrayers = backendPrayers.map(prayerFromBackend);
          savePrayers(convertedPrayers);
          setPrayers(convertedPrayers);
        }

        // Intentions migration: if backend empty but localStorage has data, migrate
        const lsIntentions = loadMassIntentions();
        if (backendIntentions.length === 0 && lsIntentions.length > 0) {
          for (const intention of lsIntentions) {
            try {
              await actor.saveMassIntention(intentionToBackend(intention));
            } catch {
              /* silent */
            }
          }
          setMassIntentions(lsIntentions);
        } else {
          // Expire old intentions (same logic as loadMassIntentions)
          const now = Date.now();
          const expiryMs = INTENTION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
          const convertedIntentions =
            backendIntentions.map(intentionFromBackend);
          const valid = convertedIntentions.filter(
            (i) => now - new Date(i.createdAt).getTime() < expiryMs,
          );
          saveMassIntentions(valid);
          setMassIntentions(valid);
        }

        // Config
        if (backendConfig) {
          saveConfig(backendConfig);
          setConfig(backendConfig);
        }
      } catch {
        // Backend unavailable -- localStorage data already loaded
      }
    })();
  }, [actor]);

  // Load liturgy intentions AND services for current week
  useEffect(() => {
    const currentWeekId = getWeekId(new Date());
    void liturgyRefreshToken; // trigger re-fetch when admin saves liturgy data

    // Helper to process a week's data (both from LS and backend)
    const processWeekData = (
      weekId: string,
      weekStart: string,
      days: Array<{
        dayIndex: bigint | number;
        entries: Array<{
          id: string;
          time: string;
          entryType?: string;
          serviceType?: string;
          description?: string;
          intention?: string;
        }>;
      }>,
    ) => {
      const newIntentions: MassIntention[] = [];
      const newServices: LiturgyService[] = [];

      for (const day of days) {
        const dayIndex = Number(day.dayIndex);
        const weekStartDate = new Date(weekStart);
        if (!weekStart || Number.isNaN(weekStartDate.getTime())) continue;
        const dayDate = new Date(weekStartDate.getTime() + dayIndex * 86400000);
        const dateStr = dayDate.toLocaleDateString("pl-PL", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        for (const entry of day.entries) {
          const isService =
            entry.entryType === "nabozenstwo" ||
            (entry.entryType !== "msza" && !!entry.serviceType);

          // For services, use serviceType if present, else 'inne' as fallback
          const effectiveServiceType = entry.serviceType || "inne";

          if (isService) {
            const serviceColor =
              SERVICE_TYPE_COLORS[effectiveServiceType] ||
              SERVICE_TYPE_COLORS.inne;
            newServices.push({
              id: `service-${entry.id}`,
              serviceType: effectiveServiceType,
              description: entry.description || entry.intention || "",
              time: entry.time,
              date: dateStr,
              color: serviceColor,
            });
          } else if (entry.intention?.trim()) {
            newIntentions.push({
              id: `liturgy-${entry.id}`,
              name: "Intencja liturgiczna",
              intention: entry.intention.trim(),
              status: "approved",
              offeringStatus: "paid",
              assignedWeekId: weekId,
              assignedDayIndex: dayIndex,
              assignedEntryId: entry.id,
              assignedMassTime: entry.time,
              assignedMassDate: dateStr,
              createdAt: weekStart,
              color: "#FFD700",
            });
          }
        }
      }

      return { newIntentions, newServices };
    };

    // Read from localStorage first (fast)
    try {
      const raw = localStorage.getItem("liturgy_weeks");
      if (raw) {
        const all = JSON.parse(raw) as Record<string, unknown>;
        const weekRaw = all[currentWeekId] as
          | Record<string, unknown>
          | undefined;
        if (weekRaw) {
          const weekStart = (weekRaw.weekStart as string) || "";
          const days = ((weekRaw.days as unknown[]) || []).map((d) => {
            const day = d as Record<string, unknown>;
            return {
              dayIndex: Number((day.dayIndex as string | number) ?? 0),
              entries: ((day.entries as unknown[]) || []).map((e) => {
                const entry = e as Record<string, unknown>;
                return {
                  id: (entry.id as string) || "",
                  time: (entry.time as string) || "",
                  entryType: (entry.entryType as string) || "",
                  serviceType: (entry.serviceType as string) || "",
                  description: (entry.description as string) || "",
                  intention: (entry.intention as string) || "",
                };
              }),
            };
          });

          const { newIntentions, newServices } = processWeekData(
            currentWeekId,
            weekStart,
            days,
          );
          setLiturgyIntentions(newIntentions);
          setLiturgyServices(newServices);
        }
      }
    } catch {
      // ignore localStorage errors
    }

    // Also try backend for authoritative data.
    // Always use getLiturgyWeek(currentWeekId) — never getCurrentLiturgyWeek()
    // which returned whatever week was last saved, causing cross-week contamination.
    actor
      ?.getLiturgyWeek(currentWeekId)
      .then((week) => {
        if (!week) return;
        // Safety check: only display intentions if the backend returned
        // exactly the current calendar week — not a stale or historical week.
        if (week.id !== currentWeekId) return;
        const days = week.days.map((d) => ({
          dayIndex: Number(d.dayIndex),
          entries: d.entries.map((e) => ({
            id: e.id,
            time: e.time,
            entryType: e.entryType || "",
            serviceType: e.serviceType || "",
            description: e.description || "",
            intention: e.intention || "",
          })),
        }));
        const { newIntentions, newServices } = processWeekData(
          week.id,
          week.weekStart,
          days,
        );
        // Backend data is authoritative - replace localStorage data
        setLiturgyIntentions(newIntentions);
        setLiturgyServices(newServices);
      })
      .catch(() => {
        // silently fail
      });
  }, [actor, liturgyRefreshToken]);

  // Prayer form state
  const [prayerName, setPrayerName] = useState("");
  const [prayerCity, setPrayerCity] = useState("");
  const [prayerIntention, setPrayerIntention] = useState("");
  const [prayerSubmitted, setPrayerSubmitted] = useState(false);
  const [prayerError, setPrayerError] = useState("");

  // Mass intention form state
  const [intName, setIntName] = useState("");
  const [intPhone, setIntPhone] = useState("");
  const [intEmail, setIntEmail] = useState("");
  const [intIntention, setIntIntention] = useState("");
  const [intSubmitted, setIntSubmitted] = useState(false);
  const [intError, setIntError] = useState("");

  // Dialog state
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerStar | null>(null);
  const [selectedIntention, setSelectedIntention] =
    useState<MassIntention | null>(null);
  const [prayedIds, setPrayedIds] = useState<Set<string>>(new Set());

  const [copied, setCopied] = useState(false);

  const handleSubmitPrayer = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const last = localStorage.getItem("modlitwa_last_prayer");
      if (last && new Date(last).toDateString() === new Date().toDateString()) {
        setPrayerError("Możesz dołączyć do modlitwy raz dziennie. Wróć jutro.");
        return;
      }
      setPrayerError("");
      const colorIdx = prayers.length % STAR_COLORS.length;
      const newStar: PrayerStar = {
        id: `prayer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: prayerName.trim() || undefined,
        city: prayerCity.trim() || undefined,
        intention: prayerIntention.trim() || undefined,
        isPublic: true,
        isApproved: false,
        joinedAt: new Date().toISOString(),
        color: STAR_COLORS[colorIdx],
        prayCount: 0,
      };
      const updated = [...prayers, newStar];
      savePrayers(updated);
      setPrayers(updated);
      localStorage.setItem("modlitwa_last_prayer", new Date().toISOString());
      // Async backend save
      void (async () => {
        try {
          if (actor) await actor.savePrayerStar(prayerToBackend(newStar));
        } catch {
          /* silent */
        }
      })();
      setPrayerName("");
      setPrayerCity("");
      setPrayerIntention("");
      setPrayerSubmitted(true);
    },
    [prayers, prayerName, prayerCity, prayerIntention, actor],
  );

  const handleSubmitIntention = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!intIntention.trim()) {
        setIntError("Proszę wpisać treść intencji.");
        return;
      }
      if (!intName.trim()) {
        setIntError("Proszę podać imię i nazwisko.");
        return;
      }
      setIntError("");
      const colorIdx = massIntentions.length % STAR_COLORS.length;
      const newIntention: MassIntention = {
        id: `intention-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: intName.trim(),
        phone: intPhone.trim() || undefined,
        email: intEmail.trim() || undefined,
        intention: intIntention.trim(),
        status: "pending",
        offeringStatus: "none",
        createdAt: new Date().toISOString(),
        color: STAR_COLORS[colorIdx],
      };
      const updated = [...massIntentions, newIntention];
      saveMassIntentions(updated);
      setMassIntentions(updated);
      // Async backend save
      void (async () => {
        try {
          if (actor)
            await actor.saveMassIntention(intentionToBackend(newIntention));
        } catch {
          /* silent */
        }
      })();
      setIntName("");
      setIntPhone("");
      setIntEmail("");
      setIntIntention("");
      setIntSubmitted(true);
    },
    [massIntentions, intName, intPhone, intEmail, intIntention, actor],
  );

  const handlePrayTogether = useCallback(
    (prayerId: string) => {
      const updated = prayers.map((p) =>
        p.id === prayerId ? { ...p, prayCount: p.prayCount + 1 } : p,
      );
      savePrayers(updated);
      setPrayers(updated);
      setPrayedIds((prev) => new Set(prev).add(prayerId));
      setSelectedPrayer((prev) =>
        prev?.id === prayerId
          ? { ...prev, prayCount: prev.prayCount + 1 }
          : prev,
      );
      toast.success("Twoja modlitwa dołączyła do wspólnoty!");
    },
    [prayers],
  );

  const handleCopyAccount = useCallback(() => {
    navigator.clipboard
      .writeText(config.accountNumber)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Numer konta skopiowany!");
      })
      .catch(() => toast.error("Nie udało się skopiować."));
  }, [config.accountNumber]);

  const saveHero = useCallback(() => {
    setConfig(heroDraft);
    saveConfig(heroDraft);
    setEditingHero(false);
    toast.success("Zapisano.");
  }, [heroDraft]);

  const approvedPrayers = prayers.filter((p) => p.isApproved && !p.isHidden);
  const allMassIntentions = [
    ...massIntentions.filter((mi) => !mi.assignedMassDate),
    ...liturgyIntentions
      .filter((li) => !massIntentions.some((mi) => mi.id === li.id))
      .map((li) => {
        // If this liturgy entry was created from a form intention (via admin assignment),
        // use the actual offeringStatus from the original form intention.
        // If not found (admin entered directly into Liturgia), keep as "paid" (already paid).
        const sourceIntention = massIntentions.find(
          (mi) =>
            mi.assignedEntryId !== undefined &&
            li.assignedEntryId !== undefined &&
            mi.assignedEntryId === li.assignedEntryId,
        );
        if (sourceIntention) {
          return { ...li, offeringStatus: sourceIntention.offeringStatus };
        }
        return li;
      }),
  ];
  const approvedIntentions = allMassIntentions.filter(
    (i) => i.status === "approved",
  );
  const totalPrays = prayers.reduce((sum, p) => sum + p.prayCount, 0);

  if (showSkeleton) {
    return <ModlitwaSkeleton />;
  }

  return (
    <main className="min-h-screen">
      {/* HERO */}
      <section
        className="relative min-h-[60vh] flex items-center justify-center overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #060614 0%, #0d0520 40%, #060e1e 100%)",
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 90 }).map((_, i) => (
            <div
              key={`hs-${(i * 137 + 17) % 9999}`}
              className="absolute rounded-full bg-white"
              style={{
                width: `${1 + (i % 3)}px`,
                height: `${1 + (i % 3)}px`,
                left: `${(i * 137.5) % 100}%`,
                top: `${(i * 79.3) % 100}%`,
                opacity: 0.04 + (i % 6) * 0.03,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto py-20">
          {isAdmin && !editingHero && (
            <button
              onClick={() => {
                setHeroDraft(config);
                setEditingHero(true);
              }}
              type="button"
              className="absolute top-16 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
              title="Edytuj hero"
              data-ocid="modlitwa.hero.edit_button"
            >
              <Pencil className="w-4 h-4 text-white/60" />
            </button>
          )}
          {editingHero ? (
            <div className="space-y-4 text-left">
              <Input
                value={heroDraft.heroTitle}
                onChange={(e) =>
                  setHeroDraft((d) => ({ ...d, heroTitle: e.target.value }))
                }
                className="bg-white/10 border-white/20 text-white"
                placeholder="Nagłówek"
              />
              <Input
                value={heroDraft.heroSubtitle}
                onChange={(e) =>
                  setHeroDraft((d) => ({ ...d, heroSubtitle: e.target.value }))
                }
                className="bg-white/10 border-white/20 text-white"
                placeholder="Podtytuł"
              />
              <Textarea
                value={heroDraft.heroDescription}
                onChange={(e) =>
                  setHeroDraft((d) => ({
                    ...d,
                    heroDescription: e.target.value,
                  }))
                }
                className="bg-white/10 border-white/20 text-white"
                placeholder="Opis"
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={saveHero}
                  className="bg-primary/80 hover:bg-primary text-primary-foreground"
                  data-ocid="modlitwa.hero.save_button"
                >
                  <Save className="w-4 h-4 mr-1" /> Zapisz
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingHero(false)}
                  className="text-white/70"
                  data-ocid="modlitwa.hero.cancel_button"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Star className="w-8 h-8 text-amber-400 mx-auto mb-6 opacity-70" />
              <h1
                className="font-display text-5xl sm:text-6xl lg:text-7xl font-extralight text-white tracking-tight leading-none mb-4"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  textShadow: "0 0 50px rgba(255,215,0,0.25)",
                }}
              >
                {config.heroTitle}
              </h1>
              <p className="font-editorial text-lg sm:text-xl font-light text-amber-200/70 leading-relaxed mb-4">
                {config.heroSubtitle}
              </p>
              <p className="font-sans text-sm font-light text-white/50 leading-relaxed max-w-xl mx-auto">
                {config.heroDescription}
              </p>
            </>
          )}
        </div>
      </section>

      {/* MASS INTENTION ORDER + OFFERING */}
      <section className="py-16 px-4 bg-background" id="zamow-intencje">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-2xl md:text-3xl font-light text-foreground mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Zamów intencję Mszy Świętej
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Każda intencja zostanie przekazana do duszpasterza i pojawi się w
              grafiku liturgicznym.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Form */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-base font-medium text-foreground mb-5">
                Formularz intencji
              </h3>
              {intSubmitted ? (
                <div
                  className="text-center py-8 space-y-3"
                  data-ocid="modlitwa.intention.success_state"
                >
                  <div className="text-3xl">🙏</div>
                  <p className="text-foreground font-light">
                    Dziękujemy! Intencja została złożona.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Po złożeniu ofiary administrator potwierdzi intencję i
                    wpisze ją do grafiku Mszy Świętej.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIntSubmitted(false)}
                    className="mt-2"
                    data-ocid="modlitwa.intention.back_button"
                  >
                    Złóż kolejną intencję
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmitIntention} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">
                      Imię i nazwisko{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={intName}
                      onChange={(e) => setIntName(e.target.value)}
                      placeholder="Jan Kowalski"
                      data-ocid="modlitwa.intention.name.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">
                      Telefon (opcjonalnie)
                    </Label>
                    <Input
                      value={intPhone}
                      onChange={(e) => setIntPhone(e.target.value)}
                      placeholder="123 456 789"
                      type="tel"
                      data-ocid="modlitwa.intention.phone.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">
                      Email (opcjonalnie)
                    </Label>
                    <Input
                      value={intEmail}
                      onChange={(e) => setIntEmail(e.target.value)}
                      placeholder="email@przykład.pl"
                      type="email"
                      data-ocid="modlitwa.intention.email.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">
                      Treść intencji <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      value={intIntention}
                      onChange={(e) => setIntIntention(e.target.value)}
                      placeholder="np. W intencji zdrowia rodziny…"
                      rows={3}
                      data-ocid="modlitwa.intention.text.textarea"
                    />
                  </div>
                  {intError && (
                    <p
                      className="text-sm text-destructive"
                      data-ocid="modlitwa.intention.error_state"
                    >
                      {intError}
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    data-ocid="modlitwa.intention.submit_button"
                  >
                    Zamów intencję
                  </Button>
                </form>
              )}
            </div>

            {/* Offering */}
            <div className="rounded-2xl p-6 border border-primary/30 bg-card">
              <h3
                className="text-lg font-light mb-4 text-primary"
                style={{
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Ofiara za Mszę Świętą
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Ofiary przeznaczane są na:
              </p>
              <ul className="space-y-1.5 mb-6">
                {[
                  "utrzymanie Parafii",
                  "dzieła charytatywne",
                  "pomoc potrzebującym",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-foreground/70"
                  >
                    <span className="text-primary/70">✦</span> {item}
                  </li>
                ))}
              </ul>

              <div className="rounded-xl p-4 mb-4 bg-muted/50 border border-border/50">
                <p className="text-muted-foreground text-xs mb-1">
                  {config.bankOwner}
                </p>
                <p className="text-foreground font-mono text-sm leading-relaxed tracking-wide">
                  {config.accountNumber}
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full mb-4"
                onClick={handleCopyAccount}
                data-ocid="modlitwa.offering.copy_button"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" /> Skopiowano!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" /> Kopiuj numer konta
                  </>
                )}
              </Button>

              <div className="rounded-lg p-3 bg-muted/30">
                <p className="text-muted-foreground text-xs leading-relaxed">
                  <span className="text-foreground/60">Tytuł przelewu:</span>{" "}
                  Intencja mszalna + nazwisko
                </p>
                <p className="text-muted-foreground/60 text-xs mt-2 leading-relaxed">
                  Po złożeniu ofiary administrator oznaczy status intencji.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAP */}
      <section
        className="py-16 px-4"
        style={{
          background: "linear-gradient(180deg, #060614 0%, #08091e 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2
              className="text-2xl md:text-3xl font-light text-white mb-3"
              style={{
                fontFamily: "'Playfair Display', serif",
                textShadow: "0 0 20px rgba(255,215,0,0.15)",
              }}
            >
              Sanktuarium modlitwy
            </h2>
            <p className="text-white/35 text-sm max-w-md mx-auto">
              Słońce w centrum to Msza Święta. Krąg 1 – intencje mszalne. Krąg 2
              – modlące się osoby. Krąg 3 – nabożeństwa.
            </p>
          </div>
          <SanctuaryMap
            prayers={prayers}
            massIntentions={allMassIntentions}
            services={liturgyServices}
            onPrayerClick={setSelectedPrayer}
            onIntentionClick={setSelectedIntention}
            onServiceClick={setSelectedService}
          />
        </div>
      </section>

      {/* JOIN PRAYER FORM */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <h2
              className="text-2xl font-light text-foreground mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Dołącz do modlitwy
            </h2>
            <p className="text-sm text-muted-foreground">
              Twoja gwiazda pojawi się w Sanktuarium po zatwierdzeniu
            </p>
          </div>
          {prayerSubmitted ? (
            <div
              className="text-center py-10 space-y-4"
              data-ocid="modlitwa.prayer.success_state"
            >
              <div className="text-4xl">🙏</div>
              <p className="text-foreground font-light text-lg">
                Dziękujemy! Twoja modlitwa czeka na zatwierdzenie.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrayerSubmitted(false)}
                data-ocid="modlitwa.prayer.back_button"
              >
                Powróć do formularza
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmitPrayer} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-muted-foreground font-light text-sm">
                  Imię (lub pozostań anonimowy)
                </Label>
                <Input
                  value={prayerName}
                  onChange={(e) => setPrayerName(e.target.value)}
                  placeholder="Twoje imię…"
                  data-ocid="modlitwa.prayer.name.input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground font-light text-sm">
                  Miasto
                </Label>
                <Input
                  value={prayerCity}
                  onChange={(e) => setPrayerCity(e.target.value)}
                  placeholder="Skąd jesteś…"
                  data-ocid="modlitwa.prayer.city.input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground font-light text-sm">
                  Intencja modlitwy
                </Label>
                <Textarea
                  value={prayerIntention}
                  onChange={(e) => setPrayerIntention(e.target.value)}
                  placeholder="Powierz Bogu swoje intencje…"
                  rows={3}
                  data-ocid="modlitwa.prayer.intention.textarea"
                />
              </div>
              {prayerError && (
                <p
                  className="text-sm text-destructive"
                  data-ocid="modlitwa.prayer.error_state"
                >
                  {prayerError}
                </p>
              )}
              <Button
                type="submit"
                className="w-full"
                data-ocid="modlitwa.prayer.submit_button"
              >
                <span className="mr-2">⭐</span>Dołącz do modlitwy
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* STATS + INTENTIONS LIST */}
      <section
        className="py-16 px-4"
        style={{ background: "var(--background)" }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2
              className="text-2xl font-light text-foreground mb-8"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Wspólnota modlitwy
            </h2>
            <div className="grid grid-cols-3 gap-6 mb-10">
              <div className="space-y-1">
                <div
                  className="text-3xl font-extralight text-foreground"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {approvedPrayers.length}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest">
                  Modlących się
                </div>
              </div>
              <div className="space-y-1">
                <div
                  className="text-3xl font-extralight text-foreground"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {approvedIntentions.length}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest">
                  Intencji mszalnych
                </div>
              </div>
              <div className="space-y-1">
                <div
                  className="text-3xl font-extralight text-foreground"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {totalPrays}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest">
                  Modlitw razem
                </div>
              </div>
            </div>
          </div>

          {approvedIntentions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4 text-center">
                Zatwierdzone intencje mszalne
              </h3>
              <div className="space-y-2">
                {approvedIntentions.map((intention) => (
                  <div
                    key={intention.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card"
                  >
                    <div className="flex-shrink-0">
                      <Badge
                        className="text-xs px-2 py-0.5"
                        style={{
                          background:
                            intention.offeringStatus === "paid"
                              ? "oklch(var(--primary) / 0.12)"
                              : "oklch(var(--muted))",
                          color:
                            intention.offeringStatus === "paid"
                              ? "oklch(var(--primary))"
                              : "oklch(var(--muted-foreground))",
                          border: "none",
                        }}
                      >
                        {intention.offeringStatus === "paid"
                          ? "✔ ofiara złożona"
                          : "⏳ oczekuje"}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">
                        {intention.intention}
                      </p>
                      {intention.assignedMassDate &&
                        intention.assignedMassTime && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {intention.assignedMassDate}{" "}
                            {intention.assignedMassTime}
                          </p>
                        )}
                    </div>
                    <div className="text-xs text-muted-foreground flex-shrink-0">
                      {new Date(intention.createdAt).toLocaleDateString(
                        "pl-PL",
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CLOSING */}
      <section
        className="py-16 px-4 text-center"
        style={{
          background:
            "linear-gradient(135deg, #060614 0%, #0d0520 50%, #060614 100%)",
        }}
      >
        <div className="max-w-xl mx-auto">
          <Star className="w-6 h-6 text-amber-400 mx-auto mb-6 opacity-50" />
          <h2
            className="text-xl md:text-2xl font-light text-white mb-4"
            style={{
              fontFamily: "'Playfair Display', serif",
              textShadow: "0 0 30px rgba(255,215,0,0.15)",
            }}
          >
            {config.thankYouTitle}
          </h2>
          <p className="text-white/40 text-sm leading-relaxed">
            {config.thankYouText}
          </p>
        </div>
      </section>

      {/* Prayer Star Modal */}
      <Dialog
        open={!!selectedPrayer}
        onOpenChange={(open) => !open && setSelectedPrayer(null)}
      >
        <DialogContent
          className="max-w-sm"
          style={{
            background: "linear-gradient(135deg, #060614, #0d0520)",
            border: "1px solid rgba(255,215,0,0.15)",
          }}
          data-ocid="modlitwa.prayer.modal"
        >
          <DialogHeader>
            <DialogTitle
              className="text-white font-light"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {selectedPrayer?.name || "Anonim"}
            </DialogTitle>
          </DialogHeader>
          {selectedPrayer && (
            <div className="space-y-4">
              {selectedPrayer.city && (
                <p className="text-amber-200/60 text-sm">
                  {selectedPrayer.city}
                </p>
              )}
              {selectedPrayer.isPublic && selectedPrayer.intention ? (
                <p className="text-white/65 text-sm leading-relaxed italic">
                  {selectedPrayer.intention}
                </p>
              ) : (
                <p className="text-white/35 text-sm italic">
                  Intencja prywatna
                </p>
              )}
              <p className="text-white/30 text-xs">
                {new Date(selectedPrayer.joinedAt).toLocaleDateString("pl-PL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              {selectedPrayer.prayCount > 0 && (
                <p className="text-amber-400/70 text-xs">
                  🙏 {selectedPrayer.prayCount} osób modli się razem
                </p>
              )}
              <Button
                className="w-full"
                style={{
                  background: "linear-gradient(135deg, #1a0a2e, #0d1a2e)",
                }}
                disabled={prayedIds.has(selectedPrayer.id)}
                onClick={() => handlePrayTogether(selectedPrayer.id)}
                data-ocid="modlitwa.prayer.modal.pray_button"
              >
                {prayedIds.has(selectedPrayer.id)
                  ? "✓ Modlisz się razem"
                  : "🙏 Modlę się razem"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-white/35 hover:text-white/60"
                onClick={() => setSelectedPrayer(null)}
                data-ocid="modlitwa.prayer.modal.close_button"
              >
                Zamknij
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Intention Modal */}
      <Dialog
        open={!!selectedIntention}
        onOpenChange={(open) => !open && setSelectedIntention(null)}
      >
        <DialogContent
          className="max-w-sm"
          style={{
            background: "linear-gradient(135deg, #1a1206, #2a1e08)",
            border: "1px solid rgba(255,215,0,0.2)",
          }}
          data-ocid="modlitwa.intention.modal"
        >
          <DialogHeader>
            <DialogTitle
              className="font-light"
              style={{
                color: "#FFD700",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Intencja mszalna
            </DialogTitle>
          </DialogHeader>
          {selectedIntention && (
            <div className="space-y-3">
              <p className="text-amber-100/80 text-sm leading-relaxed italic">
                {selectedIntention.intention}
              </p>
              {selectedIntention.assignedMassDate &&
                selectedIntention.assignedMassTime && (
                  <div
                    className="rounded-lg p-3 text-sm"
                    style={{ background: "rgba(255,215,0,0.08)" }}
                  >
                    <p className="text-amber-200/70">
                      📅 {selectedIntention.assignedMassDate}{" "}
                      {selectedIntention.assignedMassTime}
                    </p>
                  </div>
                )}
              <Badge
                style={{
                  background:
                    selectedIntention.offeringStatus === "paid"
                      ? "oklch(var(--primary) / 0.12)"
                      : "oklch(var(--muted))",
                  color:
                    selectedIntention.offeringStatus === "paid"
                      ? "oklch(var(--primary))"
                      : "oklch(var(--muted-foreground))",
                  border: "none",
                }}
              >
                {selectedIntention.offeringStatus === "paid"
                  ? "✔ Ofiara złożona"
                  : "⏳ Oczekuje na ofiarę"}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-amber-200/40 hover:text-amber-200/70"
                onClick={() => setSelectedIntention(null)}
                data-ocid="modlitwa.intention.modal.close_button"
              >
                Zamknij
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Service Modal */}
      <Dialog
        open={!!selectedService}
        onOpenChange={(open) => !open && setSelectedService(null)}
      >
        <DialogContent
          className="max-w-sm"
          style={{
            background: "linear-gradient(135deg, #060614, #0d0520)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
          data-ocid="modlitwa.service.modal"
        >
          <DialogHeader>
            <DialogTitle
              className="text-white font-light"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {selectedService
                ? SERVICE_TYPE_LABELS[selectedService.serviceType] ||
                  "Nabożeństwo"
                : ""}
            </DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-3">
              {selectedService.description && (
                <p className="text-white/70 text-sm leading-relaxed italic">
                  {selectedService.description}
                </p>
              )}
              <div
                className="rounded-lg p-3 text-sm"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                <p style={{ color: selectedService.color }}>
                  📅 {selectedService.date} · {selectedService.time}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-white/35 hover:text-white/60"
                onClick={() => setSelectedService(null)}
                data-ocid="modlitwa.service.modal.close_button"
              >
                Zamknij
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
