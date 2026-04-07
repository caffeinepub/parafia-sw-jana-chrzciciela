import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import React from "react";
import type { NewsArticle } from "../backend.d";
import { SectionReveal } from "../components/parish/SectionReveal";
import { useNewsArticle, usePublicNews } from "../hooks/useQueries";
import { Link, useParams } from "../router";

function NewsDetailContent({ article }: { article: NewsArticle }) {
  const imageUrl = article.image?.getDirectURL?.();
  const hasImage = imageUrl && imageUrl !== "";

  return (
    <main className="min-h-screen pt-nav">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <SectionReveal>
          <Link
            to="/aktualnosci"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-sans transition-colors mb-10"
            data-ocid="news.detail.back.link"
          >
            <ArrowLeft className="w-4 h-4" />
            Wszystkie aktualności
          </Link>
        </SectionReveal>

        <SectionReveal>
          <article>
            <header className="mb-10">
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Aktualności
              </p>
              <h1 className="font-display text-4xl sm:text-5xl font-extralight text-foreground leading-tight mb-4">
                {article.title}
              </h1>
              <div className="flex items-center gap-4">
                <time className="font-sans text-sm text-muted-foreground">
                  {new Date(article.date).toLocaleDateString("pl-PL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
              </div>
              <div className="w-12 h-px bg-border mt-6" />
            </header>

            {hasImage && (
              <div className="mb-10 rounded-xl overflow-hidden">
                <img
                  src={imageUrl}
                  alt={article.title}
                  className="w-full aspect-video object-cover"
                />
              </div>
            )}

            <div className="prose prose-neutral max-w-none font-sans font-light text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {article.content}
            </div>
          </article>
        </SectionReveal>
      </div>
    </main>
  );
}

function DetailSkeleton() {
  return (
    <main className="min-h-screen pt-nav">
      <div
        className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8"
        data-ocid="news.detail.loading_state"
      >
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="aspect-video w-full rounded-xl" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </main>
  );
}

export function AktualnosociDetailPage() {
  const { id } = useParams<{ id: string }>();

  // 1. Fetch full list (may already be in cache from preload)
  const { data: news, isLoading: listLoading } = usePublicNews();

  // 2. Fetch single article in parallel immediately – no waiting for list
  //    This is the fast path when accessing via direct URL with empty cache.
  const { data: singleArticle, isLoading: singleLoading } = useNewsArticle(id);

  // Try list first (cache hit), fall back to single-article fetch
  const article = React.useMemo(() => {
    const fromList = news?.find((a) => a.id === id) ?? null;
    return fromList ?? singleArticle ?? null;
  }, [news, singleArticle, id]);

  // Loading: show skeleton only while neither source has resolved yet
  const loading = (listLoading || singleLoading) && !article;

  if (loading) {
    return <DetailSkeleton />;
  }

  if (!article) {
    return (
      <main className="min-h-screen pt-nav">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
          <SectionReveal>
            <div data-ocid="news.detail.error_state">
              <p className="font-display text-2xl font-light text-muted-foreground mb-4">
                Artykuł nie został znaleziony
              </p>
              <Link
                to="/aktualnosci"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-sans"
              >
                <ArrowLeft className="w-4 h-4" />
                Wróć do aktualności
              </Link>
            </div>
          </SectionReveal>
        </div>
      </main>
    );
  }

  return <NewsDetailContent article={article} />;
}
