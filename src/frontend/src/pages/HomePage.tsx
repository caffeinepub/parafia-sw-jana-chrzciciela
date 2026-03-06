import { Calendar, ChevronRight, Image } from "lucide-react";
import React from "react";
import type { Event, GalleryAlbum, NewsArticle } from "../backend";
import { ImageWithFallback } from "../components/parish/ImagePlaceholder";
import { SectionReveal } from "../components/parish/SectionReveal";
import { useGalleryAlbums, useHomePageData } from "../hooks/useQueries";
import { Link } from "../router";

// Default sections when backend has no data
const DEFAULT_SECTIONS = [
  {
    id: "hero",
    order: 1n,
    sectionType: "hero",
    enabled: true,
    customTitle: "",
    customContent: "",
  },
  {
    id: "slowo",
    order: 2n,
    sectionType: "slowo_proboszcza",
    enabled: true,
    customTitle: "",
    customContent: "",
  },
  {
    id: "aktualnosci",
    order: 3n,
    sectionType: "aktualnosci",
    enabled: true,
    customTitle: "",
    customContent: "",
  },
  {
    id: "wydarzenia",
    order: 4n,
    sectionType: "wydarzenia",
    enabled: true,
    customTitle: "",
    customContent: "",
  },
  {
    id: "wspolnoty",
    order: 5n,
    sectionType: "wspolnoty",
    enabled: true,
    customTitle: "",
    customContent: "",
  },
  {
    id: "galeria",
    order: 6n,
    sectionType: "galeria",
    enabled: true,
    customTitle: "",
    customContent: "",
  },
  {
    id: "cytat",
    order: 7n,
    sectionType: "cytat_duchowy",
    enabled: true,
    customTitle: "",
    customContent: "",
  },
  {
    id: "kontakt",
    order: 8n,
    sectionType: "kontakt",
    enabled: true,
    customTitle: "",
    customContent: "",
  },
];

function HeroSection({ title, content }: { title?: string; content?: string }) {
  return (
    <section className="relative min-h-screen hero-gradient flex flex-col items-center justify-center text-center px-4">
      {/* Subtle geometric decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06] bg-primary"
          style={{ filter: "blur(80px)" }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <p className="font-sans text-xs uppercase tracking-[0.25em] text-muted-foreground mb-6">
            Parafia św. Jana Chrzciciela
          </p>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-extralight text-foreground leading-[1.05]">
            {title || (
              <>
                Witaj
                <span className="block italic font-light opacity-70">
                  w naszej parafii
                </span>
              </>
            )}
          </h1>
        </div>

        {content && (
          <p
            className="font-editorial text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in"
            style={{ animationDelay: "0.5s" }}
          >
            {content}
          </p>
        )}

        <div
          className="flex flex-wrap items-center justify-center gap-4 pt-4 animate-fade-in"
          style={{ animationDelay: "0.8s" }}
        >
          <Link
            to="/aktualnosci"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary/90 text-primary-foreground rounded-full font-sans text-sm font-light hover:bg-primary transition-colors duration-300"
            data-ocid="hero.aktualnosci.primary_button"
          >
            Aktualności
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            to="/kontakt"
            className="inline-flex items-center gap-2 px-8 py-3 border border-border bg-card/40 text-foreground rounded-full font-sans text-sm font-light hover:bg-accent/40 transition-colors duration-300"
            data-ocid="hero.kontakt.secondary_button"
          >
            Kontakt
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in"
        style={{ animationDelay: "1.2s" }}
      >
        <span className="font-sans text-xs text-muted-foreground tracking-widest uppercase">
          Odkryj
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-border to-transparent" />
      </div>
    </section>
  );
}

function SlowoSection({
  title,
  content,
}: { title?: string; content?: string }) {
  return (
    <SectionReveal>
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {title || "Słowo Proboszcza"}
          </p>
          <div className="w-12 h-px bg-border mx-auto" />
          <blockquote className="font-editorial text-2xl sm:text-3xl font-light text-foreground leading-relaxed">
            {content ? (
              `"${content}"`
            ) : (
              <>
                <span className="opacity-30 text-5xl font-display leading-none">
                  "
                </span>
                <span className="block text-muted-foreground italic text-lg">
                  Treść zostanie dodana przez proboszcza
                </span>
              </>
            )}
          </blockquote>
          <p className="font-sans text-xs text-muted-foreground tracking-wide">
            — Proboszcz Parafii
          </p>
        </div>
      </section>
    </SectionReveal>
  );
}

function AktualnosociSection({
  news,
  isLoading,
}: {
  news?: NewsArticle[];
  isLoading?: boolean;
}) {
  const latest = news?.slice(0, 3) || [];

  return (
    <SectionReveal>
      <section className="py-24 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                Aktualności
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-extralight text-foreground">
                Co nowego
              </h2>
            </div>
            <Link
              to="/aktualnosci"
              className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-sans transition-colors"
              data-ocid="home.aktualnosci.link"
            >
              Wszystkie aktualności <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-card rounded-xl overflow-hidden animate-pulse"
                >
                  <div className="aspect-video bg-muted" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : latest.length === 0 ? (
            <div
              className="text-center py-16 border border-dashed border-border rounded-xl"
              data-ocid="home.aktualnosci.empty_state"
            >
              <p className="font-sans text-sm text-muted-foreground">
                Brak aktualności. Dodaj pierwsze przez panel administracyjny.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latest.map((article, i) => (
                <Link
                  key={article.id}
                  to={`/aktualnosci/${article.id}`}
                  className="group block bg-card rounded-xl overflow-hidden border border-border hover:shadow-md transition-all duration-300"
                  data-ocid={`home.news.item.${i + 1}`}
                >
                  <ImageWithFallback
                    blob={article.image}
                    alt={article.title}
                    className="w-full group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  <div className="p-6 space-y-3">
                    <time className="font-sans text-xs text-muted-foreground">
                      {new Date(article.date).toLocaleDateString("pl-PL", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </time>
                    <h3 className="font-display text-lg font-light text-foreground leading-tight line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="font-sans text-sm text-muted-foreground line-clamp-2">
                      {article.content.substring(0, 120)}...
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              to="/aktualnosci"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-sans"
              data-ocid="home.aktualnosci.mobile.link"
            >
              Wszystkie aktualności <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </SectionReveal>
  );
}

function WydarzeniaSection({
  events,
  isLoading,
}: {
  events?: Event[];
  isLoading?: boolean;
}) {
  const upcoming = events?.filter((e) => e.published).slice(0, 3) || [];

  return (
    <SectionReveal>
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                Kalendarz parafialny
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-extralight text-foreground">
                Nadchodzące wydarzenia
              </h2>
            </div>
            <Link
              to="/wydarzenia"
              className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-sans transition-colors"
              data-ocid="home.wydarzenia.link"
            >
              Wszystkie wydarzenia <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-card rounded-xl animate-pulse border border-border"
                />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div
              className="text-center py-16 border border-dashed border-border rounded-xl"
              data-ocid="home.wydarzenia.empty_state"
            >
              <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="font-sans text-sm text-muted-foreground">
                Brak zaplanowanych wydarzeń.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcoming.map((event, i) => (
                <div
                  key={event.id}
                  className={`group flex items-center gap-6 bg-card rounded-xl p-6 border transition-all duration-300 hover:shadow-sm ${
                    event.featured
                      ? "border-primary/30 bg-primary/5"
                      : "border-border"
                  }`}
                  data-ocid={`home.event.item.${i + 1}`}
                >
                  <div className="flex-shrink-0 w-14 h-14 bg-muted rounded-lg flex flex-col items-center justify-center">
                    <span className="font-display text-xl font-light text-foreground leading-none">
                      {new Date(event.date).getDate()}
                    </span>
                    <span className="font-sans text-xs text-muted-foreground uppercase tracking-wide">
                      {new Date(event.date).toLocaleString("pl-PL", {
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-base font-light text-foreground leading-tight truncate">
                        {event.title}
                      </h3>
                      {event.featured && (
                        <span className="flex-shrink-0 text-xs font-sans bg-primary/15 text-primary px-2 py-0.5 rounded-full">
                          Wyróżnione
                        </span>
                      )}
                    </div>
                    <p className="font-sans text-sm text-muted-foreground mt-1 line-clamp-1">
                      {event.description}
                    </p>
                  </div>
                  {event.liturgicalColor && (
                    <div
                      className="flex-shrink-0 w-2 h-10 rounded-full opacity-60"
                      style={{ backgroundColor: event.liturgicalColor }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </SectionReveal>
  );
}

function WspolnotySection() {
  return (
    <SectionReveal>
      <section className="py-24 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto text-center">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Wspólnoty
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-extralight text-foreground mb-6">
            Nasze wspólnoty parafialne
          </h2>
          <p className="font-sans text-muted-foreground max-w-xl mx-auto">
            Sekcja w przygotowaniu. Wkrótce znajdziesz tu informacje o
            wszystkich wspólnotach działających w naszej parafii.
          </p>
        </div>
      </section>
    </SectionReveal>
  );
}

function GaleriaSection({
  albums,
  isLoading,
}: {
  albums?: GalleryAlbum[];
  isLoading?: boolean;
}) {
  const latest = albums?.[0];

  return (
    <SectionReveal>
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                Pamięć Światła
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-extralight text-foreground">
                Galeria
              </h2>
            </div>
            <Link
              to="/galeria"
              className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-sans transition-colors"
              data-ocid="home.galeria.link"
            >
              Cała galeria <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-card rounded-xl animate-pulse border border-border"
                />
              ))}
            </div>
          ) : !latest || latest.photos.length === 0 ? (
            <div
              className="text-center py-16 border border-dashed border-border rounded-xl"
              data-ocid="home.galeria.empty_state"
            >
              <Image className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="font-sans text-sm text-muted-foreground">
                Brak zdjęć w galerii.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {latest.photos.slice(0, 4).map((photo, i) => (
                <Link
                  key={photo.id}
                  to="/galeria"
                  className="group relative aspect-square rounded-xl overflow-hidden bg-muted"
                  data-ocid={`home.gallery.item.${i + 1}`}
                >
                  <img
                    src={photo.blob.getDirectURL()}
                    alt={photo.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </SectionReveal>
  );
}

function CytatSection({ content }: { content?: string }) {
  return (
    <SectionReveal>
      <section className="py-24 px-4 bg-muted/20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="font-display text-6xl font-light text-primary/20 leading-none mb-4">
            "
          </div>
          <blockquote className="font-editorial text-2xl sm:text-3xl font-light text-foreground leading-relaxed">
            {content || (
              <span className="text-muted-foreground italic text-xl">
                Cytat duchowy — do wypełnienia przez administratora
              </span>
            )}
          </blockquote>
          <div className="font-display text-6xl font-light text-primary/20 leading-none mt-4 rotate-180 inline-block">
            "
          </div>
        </div>
      </section>
    </SectionReveal>
  );
}

function KontaktSection() {
  return (
    <SectionReveal>
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
              Jesteśmy dla Ciebie
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-extralight text-foreground">
              Kontakt
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                label: "Adres",
                placeholder: "ul. Parafialna 1\n00-000 Miasto",
              },
              { label: "Telefon", placeholder: "+48 000 000 000" },
              { label: "E-mail", placeholder: "parafia@example.pl" },
              {
                label: "Kancelaria",
                placeholder: "Pn–Pt: 9:00–12:00\nSr: 16:00–18:00",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-card rounded-xl p-6 border border-border space-y-2"
              >
                <p className="font-sans text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  {item.label}
                </p>
                <p className="font-display text-sm font-light text-muted-foreground/60 whitespace-pre-line italic">
                  {item.placeholder}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              to="/kontakt"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-sans transition-colors"
              data-ocid="home.kontakt.link"
            >
              Pełne dane kontaktowe <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </SectionReveal>
  );
}

export function HomePage() {
  const { data: homeData, isLoading } = useHomePageData();
  // Gallery albums still come from their own hook (not in homePageData)
  const { data: albums, isLoading: albumsLoading } = useGalleryAlbums();

  const activeSections = React.useMemo(() => {
    const sections = homeData?.homeSections;
    const base = sections && sections.length > 0 ? sections : DEFAULT_SECTIONS;
    return [...base]
      .filter((s) => s.enabled)
      .sort((a, b) => Number(a.order) - Number(b.order));
  }, [homeData]);

  const renderSection = (section: (typeof DEFAULT_SECTIONS)[0]) => {
    switch (section.sectionType) {
      case "hero":
        return (
          <HeroSection
            key={section.id}
            title={section.customTitle}
            content={section.customContent}
          />
        );
      case "slowo_proboszcza":
        return (
          <SlowoSection
            key={section.id}
            title={section.customTitle}
            content={section.customContent}
          />
        );
      case "aktualnosci":
        return (
          <AktualnosociSection
            key={section.id}
            news={homeData?.latestNews}
            isLoading={isLoading}
          />
        );
      case "wydarzenia":
        return (
          <WydarzeniaSection
            key={section.id}
            events={homeData?.upcomingEvents}
            isLoading={isLoading}
          />
        );
      case "wspolnoty":
        return <WspolnotySection key={section.id} />;
      case "galeria":
        return (
          <GaleriaSection
            key={section.id}
            albums={albums}
            isLoading={albumsLoading}
          />
        );
      case "cytat_duchowy":
        return (
          <CytatSection key={section.id} content={section.customContent} />
        );
      case "kontakt":
        return <KontaktSection key={section.id} />;
      default:
        return null;
    }
  };

  return (
    <main>
      {activeSections.map((section) =>
        renderSection(section as (typeof DEFAULT_SECTIONS)[0]),
      )}
    </main>
  );
}
