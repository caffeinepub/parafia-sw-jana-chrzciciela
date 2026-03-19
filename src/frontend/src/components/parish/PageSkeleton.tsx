import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

// Hero skeleton -- gradient bar + title
function HeroSkeleton() {
  return (
    <div
      className="relative min-h-[40vh] flex flex-col items-center justify-center text-center px-4 py-20"
      style={{
        background:
          "linear-gradient(165deg, oklch(var(--theme-hero-from)) 0%, oklch(var(--card)) 55%, oklch(var(--accent) / 0.35) 100%)",
      }}
    >
      <div className="max-w-3xl mx-auto w-full space-y-4">
        <Skeleton className="h-3 w-32 mx-auto opacity-50" />
        <Skeleton className="h-10 w-2/3 mx-auto opacity-50" />
        <Skeleton className="h-4 w-1/2 mx-auto opacity-40" />
      </div>
    </div>
  );
}

// Card grid (e.g. Aktualności)
function CardGridSkeleton({
  cols = 3,
  rows = 2,
}: {
  cols?: number;
  rows?: number;
}) {
  return (
    <div
      className={`grid grid-cols-1 ${
        cols === 2
          ? "sm:grid-cols-2"
          : cols === 3
            ? "sm:grid-cols-3"
            : "grid-cols-1"
      } gap-6`}
    >
      {Array.from({ length: cols * rows }).map((_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
          key={i}
          className="bg-card rounded-xl overflow-hidden border border-border"
        >
          <Skeleton className="aspect-video w-full" />
          <div className="p-5 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

// List (e.g. Kancelaria, Kontakt)
function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
          key={i}
          className="bg-card rounded-xl p-6 border border-border space-y-2"
        >
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

// Map/SVG placeholder (e.g. Modlitwa, Wspólnoty)
function MapSkeleton() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-64 h-64 sm:w-96 sm:h-96">
        <Skeleton className="w-full h-full rounded-full" />
        <div className="absolute inset-[20%]">
          <Skeleton className="w-full h-full rounded-full" />
        </div>
        <div className="absolute inset-[40%]">
          <Skeleton className="w-full h-full rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Gallery grid
function GalleryGridSkeleton() {
  return (
    <div className="columns-2 sm:columns-3 md:columns-4 gap-3 space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
          key={i}
          className={`w-full rounded-xl ${
            i % 3 === 0
              ? "aspect-square"
              : i % 3 === 1
                ? "aspect-video"
                : "aspect-[4/3]"
          }`}
        />
      ))}
    </div>
  );
}

// Exported page-level skeletons

export function AktualnosociSkeleton() {
  return (
    <div className="min-h-screen pt-nav">
      <HeroSkeleton />
      <div className="max-w-7xl mx-auto px-4 py-16">
        <CardGridSkeleton cols={3} rows={2} />
      </div>
    </div>
  );
}

export function LiturgiaSkeleton() {
  return (
    <div className="min-h-screen pt-nav">
      <HeroSkeleton />
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
        <ListSkeleton rows={6} />
      </div>
    </div>
  );
}

export function WspolnotySkeleton() {
  return (
    <div className="min-h-screen pt-nav">
      <HeroSkeleton />
      <div className="max-w-7xl mx-auto px-4 py-16">
        <MapSkeleton />
        <div className="mt-12">
          <CardGridSkeleton cols={3} rows={1} />
        </div>
      </div>
    </div>
  );
}

export function KancelariaSkeleton() {
  return (
    <div className="min-h-screen pt-nav">
      <HeroSkeleton />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ListSkeleton rows={5} />
      </div>
    </div>
  );
}

export function KontaktSkeleton() {
  return (
    <div className="min-h-screen pt-nav">
      <HeroSkeleton />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
              key={i}
              className="bg-card rounded-xl p-6 border border-border space-y-2"
            >
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ModlitwaSkeleton() {
  return (
    <div className="min-h-screen pt-nav">
      <HeroSkeleton />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <MapSkeleton />
      </div>
    </div>
  );
}

export function ZycieSkeleton() {
  return (
    <div className="min-h-screen pt-nav">
      <HeroSkeleton />
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <CardGridSkeleton cols={1} rows={2} />
          <Skeleton className="aspect-[4/3] rounded-2xl md:col-span-1" />
          <CardGridSkeleton cols={1} rows={2} />
        </div>
      </div>
    </div>
  );
}

export function GaleriaSkeleton() {
  return (
    <div className="min-h-screen pt-nav">
      <HeroSkeleton />
      <div className="max-w-7xl mx-auto px-4 py-16">
        <GalleryGridSkeleton />
      </div>
    </div>
  );
}
