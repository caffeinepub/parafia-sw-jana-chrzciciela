import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useRef, useState } from "react";
import { ImageWithFallback } from "../components/parish/ImagePlaceholder";
import { SectionReveal } from "../components/parish/SectionReveal";
import { usePublicEventsPaginated } from "../hooks/useQueries";

type FilterType = "all" | "featured";

const PAGE_SIZE = 10;

export function WydarzeniaPage() {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<FilterType>("all");
  const topRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = usePublicEventsPaginated(page, PAGE_SIZE);
  const allEvents = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasPrev = page > 0;
  const hasNext = page < totalPages - 1;

  // Client-side filter on the current page's data
  const filtered = React.useMemo(() => {
    const published = allEvents.filter((e) => e.published);
    if (filter === "featured") return published.filter((e) => e.featured);
    return published;
  }, [allEvents, filter]);

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setPage(0);
  };

  return (
    <main className="min-h-screen pt-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16" ref={topRef}>
        <SectionReveal>
          <div className="mb-16">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Rytm Życia
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-extralight text-foreground">
              Wydarzenia
            </h1>
            <div className="w-12 h-px bg-border mt-6" />
          </div>
        </SectionReveal>

        {/* Filter tabs */}
        <SectionReveal delay={100}>
          <div className="flex gap-2 mb-10">
            {(["all", "featured"] as FilterType[]).map((f) => (
              <button
                type="button"
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`px-4 py-2 rounded-full font-sans text-sm transition-all duration-200 ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                }`}
                data-ocid={`events.${f}.tab`}
              >
                {f === "all" ? "Wszystkie" : "Wyróżnione"}
              </button>
            ))}
          </div>
        </SectionReveal>

        {isLoading ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            data-ocid="events.loading_state"
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card rounded-xl overflow-hidden border border-border"
              >
                <Skeleton className="aspect-video w-full" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <SectionReveal>
            <div
              className="text-center py-24 border border-dashed border-border rounded-xl"
              data-ocid="events.empty_state"
            >
              <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <p className="font-display text-xl font-light text-muted-foreground">
                Brak wydarzeń
              </p>
              <p className="font-sans text-sm text-muted-foreground mt-2">
                Dodaj pierwsze wydarzenie przez panel administracyjny.
              </p>
            </div>
          </SectionReveal>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((event, i) => (
                <SectionReveal key={event.id} delay={i * 80}>
                  <article
                    className={`group bg-card rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-md h-full flex flex-col ${
                      event.featured ? "border-primary/30" : "border-border"
                    }`}
                    data-ocid={`events.item.${i + 1}`}
                  >
                    <div className="relative overflow-hidden">
                      <ImageWithFallback
                        blob={event.image}
                        alt={event.title}
                        className="w-full group-hover:scale-[1.02] transition-transform duration-500"
                      />
                      {event.featured && (
                        <span className="absolute top-3 right-3 bg-primary/90 text-primary-foreground text-xs font-sans px-2 py-1 rounded-full">
                          Wyróżnione
                        </span>
                      )}
                      {event.liturgicalColor && (
                        <div
                          className="absolute left-0 top-0 bottom-0 w-1 opacity-70"
                          style={{ backgroundColor: event.liturgicalColor }}
                        />
                      )}
                    </div>
                    <div className="p-6 space-y-3 flex-1 flex flex-col">
                      <div className="flex items-center gap-3">
                        <div className="bg-muted rounded-lg px-3 py-1.5 flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          <time className="font-sans text-xs text-muted-foreground">
                            {new Date(event.date).toLocaleDateString("pl-PL", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </time>
                        </div>
                      </div>
                      <h2 className="font-display text-xl font-light text-foreground leading-tight flex-1">
                        {event.title}
                      </h2>
                      <p className="font-sans text-sm text-muted-foreground line-clamp-3">
                        {event.description}
                      </p>
                      <button
                        type="button"
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-sans transition-colors mt-auto pt-2"
                        data-ocid={`events.readmore.button.${i + 1}`}
                      >
                        Czytaj więcej <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </article>
                </SectionReveal>
              ))}
            </div>

            {/* Pagination – show only when more than one page */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <button
                  type="button"
                  onClick={() => goToPage(page - 1)}
                  disabled={!hasPrev}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full font-sans text-sm border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
                  data-ocid="events.pagination_prev"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Poprzednia
                </button>

                <span className="font-sans text-xs text-muted-foreground tabular-nums">
                  {page + 1} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => goToPage(page + 1)}
                  disabled={!hasNext}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full font-sans text-sm border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
                  data-ocid="events.pagination_next"
                >
                  Następna
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
