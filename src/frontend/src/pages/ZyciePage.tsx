import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from "lucide-react";
import { motion } from "motion/react";
import React, { useState } from "react";
import { ZycieSkeleton } from "../components/parish/PageSkeleton";
import { useZycieData } from "../hooks/useZycieData";

// ============================================================
// TYPES
// ============================================================

export interface ZycieTile {
  id: string;
  title: string;
  content: string;
  image: string;
  youtubeUrl: string;
  audioUrl: string;
}

export interface ZycieYearData {
  heroImage: string;
  heroDescription: string;
  tiles: ZycieTile[];
}

export interface ZycieData {
  heroTexts: {
    title: string;
    subtitle: string;
    description: string;
  };
  years: {
    [year: string]: ZycieYearData;
  };
}

// ============================================================
// YOUTUBE EMBED
// ============================================================

function getYoutubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube\.com\/live\/|youtu\.be\/)([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
  }
  return null;
}

// ============================================================
// TILE COMPONENT
// ============================================================

const PREVIEW_LENGTH = 200;

function ZycieTileCard({ tile, index }: { tile: ZycieTile; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const embedUrl = getYoutubeEmbedUrl(tile.youtubeUrl);
  const isLong = tile.content.length > PREVIEW_LENGTH;
  const displayContent =
    isLong && !expanded
      ? `${tile.content.slice(0, PREVIEW_LENGTH)}…`
      : tile.content;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -3, boxShadow: "0 12px 40px 0 rgba(0,0,0,0.10)" }}
      className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm transition-shadow"
      data-ocid={`zycie.tile.card.${index + 1}`}
    >
      {tile.image && (
        <div className="aspect-video overflow-hidden">
          <img
            src={tile.image}
            alt={tile.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {embedUrl && (
        <div className="aspect-video">
          <iframe
            src={embedUrl}
            title={tile.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )}
      <div className="p-5 space-y-3">
        {tile.title && (
          <h3 className="font-display text-lg font-semibold text-foreground tracking-tight">
            {tile.title}
          </h3>
        )}
        {tile.content && (
          <div>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
              {displayContent}
            </p>
            {isLong && (
              <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="mt-2 flex items-center gap-1 text-xs font-sans text-primary/70 hover:text-primary transition-colors"
                data-ocid={`zycie.tile.toggle.${index + 1}`}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    Zwiń
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    Czytaj więcej
                  </>
                )}
              </button>
            )}
          </div>
        )}
        {tile.audioUrl && (
          <div className="pt-1">
            <audio
              controls
              src={tile.audioUrl}
              className="w-full h-9"
              style={{ accentColor: "var(--color-primary)" }}
            >
              <track kind="captions" />
            </audio>
          </div>
        )}
      </div>
    </motion.article>
  );
}

// ============================================================
// CENTRAL YEAR IMAGE
// ============================================================

function CentralYearImage({
  yearData,
  year,
}: {
  yearData: ZycieYearData;
  year: string;
}) {
  return (
    <motion.div
      key={year}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-4"
    >
      <div
        className="w-full rounded-3xl overflow-hidden shadow-lg border border-border/40"
        style={{ aspectRatio: "4/3" }}
        data-ocid="zycie.year.card"
      >
        {yearData.heroImage ? (
          <img
            src={yearData.heroImage}
            alt={`Rok ${year}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted/60 to-muted/90 flex flex-col items-center justify-center gap-3">
            <ImageIcon className="w-12 h-12 text-muted-foreground/40" />
            <p className="text-muted-foreground/60 text-sm font-sans">
              Obraz roku {year}
            </p>
            <p className="text-muted-foreground/40 text-xs font-sans">
              Kliknij, aby dodać zdjęcie w panelu admina
            </p>
          </div>
        )}
      </div>
      {yearData.heroDescription && (
        <p className="text-center text-muted-foreground font-sans text-sm leading-relaxed max-w-xs italic">
          {yearData.heroDescription}
        </p>
      )}
    </motion.div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export function ZyciePage() {
  const { data, isLoading } = useZycieData();
  const [selectedYear, setSelectedYear] = useState("2026");

  if (isLoading && !data) {
    return <ZycieSkeleton />;
  }

  const { heroTexts } = data;
  const availableYears = Object.keys(data.years).sort(
    (a, b) => Number(b) - Number(a),
  );
  const yearData = data.years[selectedYear] ?? {
    heroImage: "",
    heroDescription: "",
    tiles: [],
  };

  const tiles = yearData.tiles ?? [];
  const leftTiles = tiles.filter((_, i) => i % 2 === 0);
  const rightTiles = tiles.filter((_, i) => i % 2 === 1);

  return (
    <main className="pt-nav">
      {/* HERO */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_0%,oklch(var(--primary)/0.07),transparent_70%)]" />
        <div className="relative z-10 text-center px-6 py-20 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="font-sans text-xs tracking-[0.25em] uppercase text-primary/70 mb-4">
              Parafia św. Jana Chrzciciela
            </p>
            <h1 className="font-display text-6xl md:text-7xl font-bold text-foreground mb-5 tracking-tight">
              {heroTexts.title}
            </h1>
            <div className="w-12 h-px bg-primary/40 mx-auto mb-6" />
            <p className="font-display text-xl md:text-2xl font-light text-foreground/80 mb-4 tracking-wide">
              {heroTexts.subtitle}
            </p>
            <p className="font-sans text-base text-muted-foreground leading-relaxed max-w-lg mx-auto">
              {heroTexts.description}
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
          <ChevronDown className="w-5 h-5 text-foreground" />
        </div>
      </section>

      {/* YEAR SELECTOR */}
      <section className="py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
          <div
            className="flex items-center gap-2 flex-wrap justify-center"
            data-ocid="zycie.year.toggle"
          >
            {availableYears.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setSelectedYear(y)}
                data-ocid="zycie.year.tab"
                className={`px-5 py-2 rounded-full text-sm font-sans font-medium transition-all duration-200 border ${
                  selectedYear === y
                    ? "bg-foreground text-background border-foreground shadow-sm"
                    : "bg-transparent text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {y}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground/50">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs font-sans tracking-wide">
              Kronika życia parafii
            </span>
          </div>
        </div>
      </section>

      {/* THREE-COLUMN LAYOUT */}
      <section className="pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {tiles.length === 0 ? (
            // NO TILES — still show center image
            <div className="flex flex-col items-center gap-8">
              <div className="w-full max-w-lg">
                <CentralYearImage yearData={yearData} year={selectedYear} />
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
                data-ocid="zycie.tiles.empty_state"
              >
                <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground font-sans text-sm">
                  Brak kafelków. Dodaj pierwszy w panelu admina.
                </p>
              </motion.div>
            </div>
          ) : (
            // THREE-COLUMN GRID
            <>
              {/* Desktop 3-col */}
              <div className="hidden md:grid md:grid-cols-[1fr_1.7fr_1fr] gap-8 items-start">
                {/* LEFT COLUMN */}
                <div className="flex flex-col gap-6">
                  {leftTiles.length === 0 ? (
                    <div className="h-24" />
                  ) : (
                    leftTiles.map((tile, i) => (
                      <ZycieTileCard key={tile.id} tile={tile} index={i * 2} />
                    ))
                  )}
                </div>

                {/* CENTER COLUMN */}
                <div className="flex flex-col gap-6 items-center">
                  <CentralYearImage yearData={yearData} year={selectedYear} />
                </div>

                {/* RIGHT COLUMN */}
                <div className="flex flex-col gap-6">
                  {rightTiles.length === 0 ? (
                    <div className="h-24" />
                  ) : (
                    rightTiles.map((tile, i) => (
                      <ZycieTileCard
                        key={tile.id}
                        tile={tile}
                        index={i * 2 + 1}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Mobile layout */}
              <div className="md:hidden flex flex-col gap-6">
                <CentralYearImage yearData={yearData} year={selectedYear} />
                {tiles.map((tile, i) => (
                  <ZycieTileCard key={tile.id} tile={tile} index={i} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ARCHIVE */}
      {availableYears.length > 1 && (
        <section className="py-16 border-t border-border/40 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-8 text-center tracking-tight">
              Archiwum
            </h2>
            <div
              className="flex flex-wrap gap-3 justify-center"
              data-ocid="zycie.archive.list"
            >
              {availableYears.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => {
                    setSelectedYear(y);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  data-ocid="zycie.archive.link"
                  className={`group flex items-center gap-2 px-6 py-3 rounded-xl border font-sans text-sm transition-all duration-200 ${
                    selectedYear === y
                      ? "bg-foreground/5 border-foreground/20 text-foreground font-medium"
                      : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 opacity-50" />
                  {y}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
