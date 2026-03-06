import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useRef, useState } from "react";
import { ImageWithFallback } from "../components/parish/ImagePlaceholder";
import { SectionReveal } from "../components/parish/SectionReveal";
import { usePublicNewsPaginated } from "../hooks/useQueries";
import { Link } from "../router";

const PAGE_SIZE = 10;

export function AktualnosociPage() {
  const [page, setPage] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = usePublicNewsPaginated(page, PAGE_SIZE);
  const news = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasPrev = page > 0;
  const hasNext = page < totalPages - 1;

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen pt-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16" ref={topRef}>
        <SectionReveal>
          <div className="mb-16">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Parafia św. Jana Chrzciciela
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-extralight text-foreground">
              Aktualności
            </h1>
            <div className="w-12 h-px bg-border mt-6" />
          </div>
        </SectionReveal>

        {isLoading ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            data-ocid="news.loading_state"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-card rounded-xl overflow-hidden border border-border"
              >
                <Skeleton className="aspect-video w-full" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : !news || news.length === 0 ? (
          <SectionReveal>
            <div
              className="text-center py-24 border border-dashed border-border rounded-xl"
              data-ocid="news.empty_state"
            >
              <p className="font-display text-xl font-light text-muted-foreground">
                Brak aktualności
              </p>
              <p className="font-sans text-sm text-muted-foreground mt-2">
                Dodaj pierwsze aktualności przez panel administracyjny.
              </p>
            </div>
          </SectionReveal>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((article, i) => (
                <SectionReveal key={article.id} delay={i * 80}>
                  <Link
                    to={`/aktualnosci/${article.id}`}
                    className="group block bg-card rounded-xl overflow-hidden border border-border hover:shadow-md transition-all duration-300 h-full flex flex-col"
                    data-ocid={`news.item.${i + 1}`}
                  >
                    <div className="overflow-hidden">
                      <ImageWithFallback
                        blob={article.image}
                        alt={article.title}
                        className="w-full group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6 space-y-3 flex-1 flex flex-col">
                      <time className="font-sans text-xs text-muted-foreground">
                        {new Date(article.date).toLocaleDateString("pl-PL", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </time>
                      <h2 className="font-display text-xl font-light text-foreground leading-tight line-clamp-3 flex-1">
                        {article.title}
                      </h2>
                      <p className="font-sans text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {article.content}
                      </p>
                      <span className="font-sans text-sm text-primary group-hover:text-primary/80 transition-colors pt-1">
                        Czytaj więcej →
                      </span>
                    </div>
                  </Link>
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
                  data-ocid="news.pagination_prev"
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
                  data-ocid="news.pagination_next"
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
