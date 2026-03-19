import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import type { GalleryAlbum } from "../backend.d";
import { ImageWithFallback } from "../components/parish/ImagePlaceholder";
import { GaleriaSkeleton } from "../components/parish/PageSkeleton";
import { SectionReveal } from "../components/parish/SectionReveal";
import { useGalleryAlbums } from "../hooks/useQueries";

function AlbumGrid({
  album,
  onBack,
}: { album: GalleryAlbum; onBack: () => void }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const photos = [...album.photos].sort(
    (a, b) => Number(a.order) - Number(b.order),
  );

  const prev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length);
  }, [lightboxIndex, photos.length]);

  const next = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % photos.length);
  }, [lightboxIndex, photos.length]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (lightboxIndex === null) return;
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") setLightboxIndex(null);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, prev, next]);

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-sans transition-colors mb-8"
        data-ocid="gallery.album.back.button"
      >
        <ArrowLeft className="w-4 h-4" /> Wróć do galerii
      </button>

      <div className="mb-10">
        <h2 className="font-display text-3xl font-extralight text-foreground">
          {album.name}
        </h2>
        {album.description && (
          <p className="font-sans text-sm text-muted-foreground mt-2">
            {album.description}
          </p>
        )}
        <p className="font-sans text-xs text-muted-foreground mt-1">
          {album.date}
        </p>
      </div>

      {photos.length === 0 ? (
        <div
          className="text-center py-24 border border-dashed border-border rounded-xl"
          data-ocid="gallery.photos.empty_state"
        >
          <p className="font-sans text-sm text-muted-foreground">
            Ten album jest pusty.
          </p>
        </div>
      ) : album.layout === "masonry" ? (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
          {photos.map((photo, i) => (
            <button
              type="button"
              key={photo.id}
              className="break-inside-avoid w-full rounded-xl overflow-hidden block"
              onClick={() => setLightboxIndex(i)}
              data-ocid={`gallery.photo.item.${i + 1}`}
            >
              <img
                src={photo.blob.getDirectURL()}
                alt={photo.caption}
                loading="lazy"
                decoding="async"
                className="w-full hover:scale-[1.02] transition-transform duration-500"
              />
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo, i) => (
            <button
              type="button"
              key={photo.id}
              className="aspect-square rounded-xl overflow-hidden block group"
              onClick={() => setLightboxIndex(i)}
              data-ocid={`gallery.photo.item.${i + 1}`}
            >
              <img
                src={photo.blob.getDirectURL()}
                alt={photo.caption}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </button>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center"
          data-ocid="gallery.lightbox.modal"
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-background/80 hover:text-background transition-colors p-2"
            onClick={() => setLightboxIndex(null)}
            data-ocid="gallery.lightbox.close_button"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            type="button"
            className="absolute left-4 text-background/80 hover:text-background transition-colors p-3"
            onClick={prev}
            data-ocid="gallery.lightbox.prev.button"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <div className="max-w-4xl max-h-[90vh] mx-16 flex flex-col items-center gap-4">
            <img
              src={photos[lightboxIndex].blob.getDirectURL()}
              alt={photos[lightboxIndex].caption}
              className="max-h-[80vh] max-w-full object-contain rounded-lg"
            />
            {photos[lightboxIndex].caption && (
              <p className="font-sans text-sm text-background/70">
                {photos[lightboxIndex].caption}
              </p>
            )}
            <p className="font-sans text-xs text-background/50">
              {lightboxIndex + 1} / {photos.length}
            </p>
          </div>

          <button
            type="button"
            className="absolute right-4 text-background/80 hover:text-background transition-colors p-3"
            onClick={next}
            data-ocid="gallery.lightbox.next.button"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      )}
    </div>
  );
}

export function GaleriaPage() {
  const { data: albums, isLoading } = useGalleryAlbums();
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null);

  if (isLoading && !albums) {
    return <GaleriaSkeleton />;
  }

  if (selectedAlbum) {
    return (
      <main className="min-h-screen pt-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <AlbumGrid
            album={selectedAlbum}
            onBack={() => setSelectedAlbum(null)}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-nav">
      <section
        className="relative flex items-center justify-center min-h-[40vh] overflow-hidden"
        data-ocid="gallery.hero.section"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(165deg, oklch(var(--theme-hero-from)) 0%, oklch(var(--card)) 55%, oklch(var(--accent) / 0.35) 100%)",
          }}
        />
        <div className="absolute inset-0 bg-foreground/5" />
        <div className="relative z-10 text-center px-6 max-w-2xl mx-auto py-20">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl md:text-5xl font-extralight text-foreground mb-4"
          >
            Galeria
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="font-sans text-lg font-light text-foreground/70 leading-relaxed"
          >
            Zdjęcia z życia parafii
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {isLoading ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            data-ocid="gallery.loading_state"
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card rounded-xl overflow-hidden border border-border"
              >
                <Skeleton className="aspect-video w-full" />
                <div className="p-5 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : !albums || albums.length === 0 ? (
          <SectionReveal>
            <div
              className="text-center py-24 border border-dashed border-border rounded-xl"
              data-ocid="gallery.empty_state"
            >
              <p className="font-display text-xl font-light text-muted-foreground">
                Brak albumów
              </p>
              <p className="font-sans text-sm text-muted-foreground mt-2">
                Dodaj pierwszy album przez panel administracyjny.
              </p>
            </div>
          </SectionReveal>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album, i) => (
              <SectionReveal key={album.id} delay={i * 80}>
                <button
                  type="button"
                  className="group w-full bg-card rounded-xl overflow-hidden border border-border hover:shadow-md transition-all duration-300 text-left"
                  onClick={() => setSelectedAlbum(album)}
                  data-ocid={`gallery.album.item.${i + 1}`}
                >
                  <div className="overflow-hidden">
                    <ImageWithFallback
                      blob={album.coverImage}
                      alt={album.name}
                      className="w-full group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 space-y-1.5">
                    <h2 className="font-display text-lg font-light text-foreground group-hover:text-primary transition-colors">
                      {album.name}
                    </h2>
                    {album.description && (
                      <p className="font-sans text-sm text-muted-foreground line-clamp-2">
                        {album.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-xs text-muted-foreground">
                        {album.date}
                      </span>
                      <span className="font-sans text-xs text-muted-foreground">
                        {album.photos.length}{" "}
                        {album.photos.length === 1 ? "zdjęcie" : "zdjęć"}
                      </span>
                    </div>
                  </div>
                </button>
              </SectionReveal>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
