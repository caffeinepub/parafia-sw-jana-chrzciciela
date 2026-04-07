import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock,
  Copy,
  Facebook,
  FileText,
  Globe,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Twitter,
  X,
  Youtube,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useState } from "react";
import { PaymentMethodsGrid } from "../components/PaymentCards";
import { KancelariaSkeleton } from "../components/parish/PageSkeleton";
import { SectionReveal } from "../components/parish/SectionReveal";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSiteSettings } from "../hooks/useQueries";
import { Link } from "../router";

// ============================================================
// TYPES
// ============================================================

export interface OfficeHour {
  id: string;
  day: string;
  hours: string;
  visible: boolean;
}

export interface Matter {
  id: string;
  name: string;
  shortDesc: string;
  description: string;
  documents: string[];
  whenToRegister: string;
  contactInfo: string;
  order: number;
}

export interface KancelariaMeta {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImageUrl: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  contactNote: string;
  commonDocuments: string[];
  announcement: string;
  announcementVisible: boolean;
  closingTitle: string;
  closingText: string;
}

// ============================================================
// KEYS
// ============================================================

export const KANCELARIA_META_KEY = "kancelaria_meta";
export const KANCELARIA_HOURS_KEY = "kancelaria_hours";
export const KANCELARIA_MATTERS_KEY = "kancelaria_matters";

// ============================================================
// DEFAULTS
// ============================================================

export const DEFAULT_KANCELARIA_META: KancelariaMeta = {
  heroTitle: "Kancelaria parafialna",
  heroSubtitle:
    "Jesteśmy do dyspozycji parafian w sprawach duszpasterskich i administracyjnych.",
  heroDescription:
    "W kancelarii można załatwić sprawy związane z sakramentami, dokumentami oraz życiem parafii.",
  heroImageUrl: "",
  contactPhone: "123 456 789",
  contactEmail: "parafia@email.pl",
  contactAddress: "ul. Kościelna 1, 00-000 Miasto",
  contactNote: "",
  commonDocuments: [
    "Świadectwo chrztu",
    "Dowód osobisty",
    "Zaświadczenie z parafii",
    "Akt małżeństwa",
  ],
  announcement: "",
  announcementVisible: false,
  closingTitle: "Zapraszamy do kancelarii parafialnej",
  closingText:
    "Jeśli masz pytania lub potrzebujesz pomocy – zapraszamy. Postaramy się pomóc.",
};

export const DEFAULT_HOURS: OfficeHour[] = [
  { id: "1", day: "Poniedziałek", hours: "16:00 – 17:30", visible: true },
  { id: "2", day: "Środa", hours: "16:00 – 17:30", visible: true },
  { id: "3", day: "Piątek", hours: "16:00 – 17:30", visible: true },
];

export const DEFAULT_MATTERS: Matter[] = [
  {
    id: "1",
    name: "Chrzest",
    shortDesc: "Zgłoszenie chrztu dziecka, dokumenty, terminy.",
    description:
      "Chrzest należy zgłosić w kancelarii parafialnej odpowiednio wcześniej – co najmniej 2 tygodnie przed planowaną datą.",
    documents: [
      "Akt urodzenia dziecka",
      "Dane rodziców chrzestnych",
      "Zaświadczenia dla chrzestnych z ich parafii",
    ],
    whenToRegister: "Co najmniej 2 tygodnie wcześniej.",
    contactInfo: "Prosimy zgłosić się osobiście w godzinach kancelarii.",
    order: 0,
  },
  {
    id: "2",
    name: "Bierzmowanie",
    shortDesc: "Dokumenty i przygotowanie do sakramentu bierzmowania.",
    description:
      "Informacje o przygotowaniu do bierzmowania i wymaganych dokumentach.",
    documents: [
      "Świadectwo chrztu",
      "Świadectwo I Komunii Świętej",
      "Zaświadczenie o uczęszczaniu na lekcje religii",
    ],
    whenToRegister: "Zgodnie z harmonogramem przygotowań w parafii.",
    contactInfo: "Prosimy kontaktować się z katechetą lub proboszczem.",
    order: 1,
  },
  {
    id: "3",
    name: "Małżeństwo",
    shortDesc: "Formalności przedślubne, dokumenty do ślubu kościelnego.",
    description:
      "Narzeczeni powinni zgłosić się do kancelarii co najmniej 3 miesiące przed planowanym ślubem.",
    documents: [
      "Dowód osobisty",
      "Świadectwo chrztu (wystawione nie wcześniej niż 6 miesięcy)",
      "Świadectwo bierzmowania",
      "Zaświadczenie z USC lub akt ślubu cywilnego",
    ],
    whenToRegister: "Co najmniej 3 miesiące przed ślubem.",
    contactInfo: "Prosimy umówić się na rozmowę z duszpasterzem.",
    order: 2,
  },
  {
    id: "4",
    name: "Pogrzeb",
    shortDesc: "Procedura zgłoszenia pogrzebu katolickiego.",
    description:
      "Pogrzeb należy zgłosić jak najszybciej po śmierci bliskiej osoby.",
    documents: ["Akt zgonu", "Dowód osobisty osoby zgłaszającej"],
    whenToRegister: "Możliwie jak najszybciej po śmierci.",
    contactInfo:
      "Prosimy kontaktować się telefonicznie lub zgłosić się osobiście.",
    order: 3,
  },
  {
    id: "5",
    name: "Zaświadczenia",
    shortDesc: "Metryki chrzcielne i inne dokumenty kościelne.",
    description:
      "Wydajemy zaświadczenia i odpisy metryk kościelnych (chrzest, bierzmowanie, małżeństwo).",
    documents: ["Dowód osobisty"],
    whenToRegister: "W godzinach urzędowania kancelarii.",
    contactInfo:
      "Dokumenty wydawane są na miejscu lub przesyłane pocztą na życzenie.",
    order: 4,
  },
  {
    id: "6",
    name: "Sprawy parafialne",
    shortDesc: "Ogólne sprawy kancelaryjne i duszpasterskie.",
    description:
      "W kancelarii można załatwić wszelkie inne sprawy związane z życiem parafialnym.",
    documents: [],
    whenToRegister: "W godzinach urzędowania kancelarii.",
    contactInfo: "Zapraszamy do bezpośredniego kontaktu.",
    order: 5,
  },
];

// ============================================================
// HOOKS
// ============================================================

const LS_KEY_KANCELARIA_META = "parish_kancelaria_meta_cache";

export function useKancelariaMeta() {
  const { actor, isFetching } = useActor();

  const getLocalData = () => {
    try {
      const raw = localStorage.getItem(LS_KEY_KANCELARIA_META);
      return raw ? (JSON.parse(raw) as KancelariaMeta) : undefined;
    } catch {
      return undefined;
    }
  };

  return useQuery<KancelariaMeta>({
    queryKey: [KANCELARIA_META_KEY],
    queryFn: async () => {
      if (!actor) return DEFAULT_KANCELARIA_META;
      try {
        const block = await (actor as any).getContentBlock(KANCELARIA_META_KEY);
        const raw =
          typeof block === "string" ? block : ((block as any)?.content ?? "");
        if (!raw) return DEFAULT_KANCELARIA_META;
        const result = { ...DEFAULT_KANCELARIA_META, ...JSON.parse(raw) };
        try {
          localStorage.setItem(LS_KEY_KANCELARIA_META, JSON.stringify(result));
        } catch {}
        return result;
      } catch {
        return DEFAULT_KANCELARIA_META;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 300_000,
    placeholderData: getLocalData,
  });
}

const LS_KEY_KANCELARIA_HOURS = "parish_kancelaria_hours_cache";

export function useKancelariaHours() {
  const { actor, isFetching } = useActor();

  const getLocalData = () => {
    try {
      const raw = localStorage.getItem(LS_KEY_KANCELARIA_HOURS);
      return raw ? (JSON.parse(raw) as OfficeHour[]) : undefined;
    } catch {
      return undefined;
    }
  };

  return useQuery<OfficeHour[]>({
    queryKey: [KANCELARIA_HOURS_KEY],
    queryFn: async () => {
      if (!actor) return DEFAULT_HOURS;
      try {
        const block = await (actor as any).getContentBlock(
          KANCELARIA_HOURS_KEY,
        );
        const raw =
          typeof block === "string" ? block : ((block as any)?.content ?? "");
        if (!raw) return DEFAULT_HOURS;
        const result = JSON.parse(raw);
        try {
          localStorage.setItem(LS_KEY_KANCELARIA_HOURS, JSON.stringify(result));
        } catch {}
        return result;
      } catch {
        return DEFAULT_HOURS;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 300_000,
    placeholderData: getLocalData,
  });
}

const LS_KEY_KANCELARIA_MATTERS = "parish_kancelaria_matters_cache";

export function useKancelariaMatters() {
  const { actor, isFetching } = useActor();

  const getLocalData = () => {
    try {
      const raw = localStorage.getItem(LS_KEY_KANCELARIA_MATTERS);
      return raw ? (JSON.parse(raw) as Matter[]) : undefined;
    } catch {
      return undefined;
    }
  };

  return useQuery<Matter[]>({
    queryKey: [KANCELARIA_MATTERS_KEY],
    queryFn: async () => {
      if (!actor) return DEFAULT_MATTERS;
      try {
        const block = await (actor as any).getContentBlock(
          KANCELARIA_MATTERS_KEY,
        );
        const raw =
          typeof block === "string" ? block : ((block as any)?.content ?? "");
        if (!raw) return DEFAULT_MATTERS;
        const parsed = JSON.parse(raw) as Matter[];
        const result = parsed.sort((a, b) => a.order - b.order);
        try {
          localStorage.setItem(
            LS_KEY_KANCELARIA_MATTERS,
            JSON.stringify(result),
          );
        } catch {}
        return result;
      } catch {
        return DEFAULT_MATTERS;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 300_000,
    placeholderData: getLocalData,
  });
}

// ============================================================
// MATTER DETAIL PANEL
// ============================================================

function MatterDetailPanel({
  matter,
  onClose,
}: {
  matter: Matter | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {matter && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 35 }}
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-background shadow-2xl z-50 overflow-y-auto"
            data-ocid="kancelaria.matter.panel"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display text-2xl font-light text-foreground">
                  {matter.name}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70 transition-colors"
                  data-ocid="kancelaria.matter.close_button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {matter.description && (
                <div className="mb-6">
                  <p className="font-sans text-base font-light text-foreground/80 leading-relaxed">
                    {matter.description}
                  </p>
                </div>
              )}

              {matter.documents.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-3">
                    Wymagane dokumenty
                  </h3>
                  <ul className="space-y-2">
                    {matter.documents.map((doc) => (
                      <li
                        key={doc}
                        className="flex items-start gap-2.5 font-sans text-sm font-light text-foreground/80"
                      >
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {matter.whenToRegister && (
                <div className="mb-6">
                  <h3 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Kiedy zgłosić
                  </h3>
                  <p className="font-sans text-sm font-light text-foreground/80">
                    {matter.whenToRegister}
                  </p>
                </div>
              )}

              {matter.contactInfo && (
                <div className="mb-6">
                  <h3 className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Kontakt
                  </h3>
                  <p className="font-sans text-sm font-light text-foreground/80">
                    {matter.contactInfo}
                  </p>
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
// PAGE
// ============================================================

export function KancelariaPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: meta, isLoading: metaLoading } = useKancelariaMeta();
  const { data: hours, isLoading: hoursLoading } = useKancelariaHours();
  const { data: matters, isLoading: mattersLoading } = useKancelariaMatters();
  const { data: siteSettings } = useSiteSettings();

  const isLoading = metaLoading && !meta && hoursLoading && !hours;

  const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);
  const siteContact = React.useMemo(() => {
    if (siteSettings?.contactData) {
      try {
        return JSON.parse(siteSettings.contactData) as {
          bankAccount?: string;
          phone?: string;
          facebook?: string;
          youtube?: string;
          twitter?: string;
          cmentarzUrl?: string;
          lightningAddress?: string;
          lightningQrUrl?: string;
          lightningDescription?: string;
          lightningEnabled?: boolean;
          usdcAddress?: string;
          usdcQrUrl?: string;
          usdcEnabled?: boolean;
        };
      } catch {}
    }
    return {};
  }, [siteSettings]);

  const socialLinks = [
    { icon: Globe, label: "Cmentarz Parafii", url: siteContact.cmentarzUrl },
    { icon: Facebook, label: "Facebook", url: siteContact.facebook },
    { icon: Youtube, label: "YouTube", url: siteContact.youtube },
    { icon: Twitter, label: "X / Twitter", url: siteContact.twitter },
  ].filter((s) => !!s.url);

  const m = meta ?? DEFAULT_KANCELARIA_META;
  const visibleHours = (hours ?? DEFAULT_HOURS).filter((h) => h.visible);

  if (isLoading) {
    return <KancelariaSkeleton />;
  }
  return (
    <main className="min-h-screen bg-background pt-nav">
      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        className="relative flex items-center justify-center min-h-[40vh] overflow-hidden"
        data-ocid="kancelaria.hero.section"
      >
        {m.heroImageUrl ? (
          <img
            src={m.heroImageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(165deg, oklch(var(--theme-hero-from)) 0%, oklch(var(--card)) 55%, oklch(var(--accent) / 0.35) 100%)",
            }}
          />
        )}
        <div className="absolute inset-0 bg-foreground/10" />
        <div className="relative z-10 text-center px-6 max-w-2xl mx-auto py-20">
          {metaLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-64 mx-auto" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
          ) : (
            <>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="font-display text-5xl sm:text-6xl lg:text-7xl font-extralight text-foreground tracking-tight leading-none mb-4"
              >
                {m.heroTitle}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="font-editorial text-lg sm:text-xl font-light text-foreground/70 leading-relaxed mb-3"
              >
                {m.heroSubtitle}
              </motion.p>
              {m.heroDescription && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                  className="font-sans text-sm font-light text-muted-foreground leading-relaxed"
                >
                  {m.heroDescription}
                </motion.p>
              )}
            </>
          )}
          {isAuthenticated && (
            <div className="mt-4">
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 text-xs font-sans font-light text-muted-foreground hover:text-foreground transition-colors"
                data-ocid="kancelaria.hero.edit_button"
              >
                <Pencil className="w-3 h-3" /> Edytuj w panelu
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── ANNOUNCEMENT BANNER ────────────────────────── */}
      {m.announcementVisible && m.announcement && (
        <SectionReveal>
          <section
            className="px-6 py-4"
            data-ocid="kancelaria.announcement.section"
          >
            <div className="max-w-3xl mx-auto">
              <div className="rounded-2xl border border-primary/30 bg-primary/5 px-6 py-4 font-sans text-sm font-light leading-relaxed text-foreground/80">
                {m.announcement}
              </div>
            </div>
          </section>
        </SectionReveal>
      )}

      {/* ── OFFICE HOURS ───────────────────────────────── */}
      <SectionReveal>
        <section
          className="px-6 py-16 max-w-3xl mx-auto"
          data-ocid="kancelaria.hours.section"
        >
          <h2 className="font-display text-2xl font-light text-foreground mb-2 text-center">
            Godziny kancelarii
          </h2>
          <div className="w-12 h-px bg-primary/40 mb-8 mx-auto" />

          {hoursLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : visibleHours.length === 0 ? (
            <p className="font-sans text-sm font-light text-muted-foreground text-center">
              Brak informacji o godzinach kancelarii.
            </p>
          ) : (
            <div className="space-y-3">
              {visibleHours.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-center gap-6 rounded-2xl border border-border bg-card px-6 py-4"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-primary/60 shrink-0" />
                    <span className="font-sans text-base font-light text-foreground">
                      {h.day}
                    </span>
                  </div>
                  <span className="font-display text-base font-light text-foreground/70">
                    {h.hours}
                  </span>
                </div>
              ))}
            </div>
          )}

          {m.contactNote && (
            <p className="font-sans text-sm font-light text-muted-foreground mt-5 italic text-center">
              {m.contactNote}
            </p>
          )}
        </section>
      </SectionReveal>

      {/* ── MATTERS ────────────────────────────────────── */}
      <SectionReveal>
        <section
          className="px-6 py-16 bg-muted/20"
          data-ocid="kancelaria.matters.section"
        >
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-2xl font-light text-foreground mb-2 text-center">
              Sprawy kancelaryjne
            </h2>
            <div className="w-12 h-px bg-primary/40 mb-10 mx-auto" />

            {mattersLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-40 rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(matters ?? DEFAULT_MATTERS).map((matter, idx) => (
                  <motion.div
                    key={matter.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.07 }}
                    className="bg-card rounded-2xl border border-border p-6 flex flex-col gap-3 hover:border-primary/40 transition-colors"
                    data-ocid={`kancelaria.matters.item.${idx + 1}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-lg font-light text-foreground">
                        {matter.name}
                      </h3>
                      <FileText className="w-4 h-4 text-primary/50 shrink-0 mt-0.5" />
                    </div>
                    <p className="font-sans text-sm font-light text-muted-foreground flex-1 leading-relaxed">
                      {matter.shortDesc}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedMatter(matter)}
                      className="inline-flex items-center gap-1.5 font-sans text-sm font-light text-primary hover:text-primary/70 transition-colors mt-auto"
                      data-ocid={`kancelaria.matters.secondary_button.${idx + 1}`}
                    >
                      Zobacz szczegóły
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </SectionReveal>

      {/* ── COMMON DOCUMENTS ───────────────────────────── */}
      <SectionReveal>
        <section
          className="px-6 py-16 max-w-3xl mx-auto"
          data-ocid="kancelaria.documents.section"
        >
          <h2 className="font-display text-2xl font-light text-foreground mb-2 text-center">
            Najczęściej wymagane dokumenty
          </h2>
          <div className="w-12 h-px bg-primary/40 mb-8 mx-auto" />
          <ul className="space-y-3">
            {(m.commonDocuments ?? []).map((doc) => (
              <li
                key={doc}
                className="flex items-center justify-center gap-3 font-sans text-base font-light text-foreground/80"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                {doc}
              </li>
            ))}
          </ul>
        </section>
      </SectionReveal>

      {/* ── CONTACT ────────────────────────────────────── */}
      <SectionReveal>
        <section
          className="px-6 py-16 bg-muted/20"
          data-ocid="kancelaria.contact.section"
        >
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl font-light text-foreground mb-2 text-center">
              Kontakt
            </h2>
            <div className="w-12 h-px bg-primary/40 mb-8 mx-auto" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
                <Phone className="w-5 h-5 text-primary/70 shrink-0 mt-0.5" />
                <div>
                  <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    Telefon
                  </p>
                  <p className="font-sans text-sm font-light text-foreground">
                    {m.contactPhone}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
                <Mail className="w-5 h-5 text-primary/70 shrink-0 mt-0.5" />
                <div>
                  <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    Email
                  </p>
                  <p className="font-sans text-sm font-light text-foreground break-all">
                    {m.contactEmail}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
                <MapPin className="w-5 h-5 text-primary/70 shrink-0 mt-0.5" />
                <div>
                  <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    Adres
                  </p>
                  <p className="font-sans text-sm font-light text-foreground">
                    {m.contactAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment methods */}
            {(siteContact.bankAccount ||
              siteContact.lightningEnabled ||
              siteContact.usdcEnabled) && (
              <div className="mt-6">
                <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground text-center mb-4">
                  Metody płatności
                </p>
                <PaymentMethodsGrid
                  bankAccount={siteContact.bankAccount}
                  blikPhone={siteContact.phone}
                  lightningAddress={siteContact.lightningAddress}
                  lightningQrUrl={siteContact.lightningQrUrl}
                  lightningDescription={siteContact.lightningDescription}
                  lightningEnabled={siteContact.lightningEnabled}
                  usdcAddress={siteContact.usdcAddress}
                  usdcQrUrl={siteContact.usdcQrUrl}
                  usdcEnabled={siteContact.usdcEnabled}
                  ocidPrefix="kancelaria"
                />
              </div>
            )}

            {/* Social media */}
            {socialLinks.length > 0 && (
              <div className="mt-6" data-ocid="kancelaria.social.section">
                <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground text-center mb-4">
                  Media Społecznościowe
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {socialLinks.map(({ icon: Icon, label, url }) => (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background hover:border-primary/40 hover:bg-accent/30 transition-all group"
                      data-ocid={`kancelaria.social.${label.toLowerCase().replace(/[^a-z0-9]/g, "")}.link`}
                    >
                      <Icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      <span className="font-sans text-sm font-light text-muted-foreground group-hover:text-foreground transition-colors">
                        {label}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </SectionReveal>

      {/* ── CLOSING CTA ────────────────────────────────── */}
      <SectionReveal>
        <section className="px-6 py-20" data-ocid="kancelaria.closing.section">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl font-extralight text-foreground mb-4">
              {m.closingTitle}
            </h2>
            <p className="font-sans text-base font-light text-muted-foreground mb-8 leading-relaxed">
              {m.closingText}
            </p>
            <Link to="/kontakt">
              <Button
                variant="outline"
                className="rounded-full px-8 font-sans font-light"
                data-ocid="kancelaria.closing.primary_button"
              >
                Skontaktuj się z nami
              </Button>
            </Link>
          </div>
        </section>
      </SectionReveal>

      {/* ── MATTER DETAIL SLIDE-IN ─────────────────────── */}
      <MatterDetailPanel
        matter={selectedMatter}
        onClose={() => setSelectedMatter(null)}
      />
    </main>
  );
}
