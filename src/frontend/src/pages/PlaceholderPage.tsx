import type React from "react";
import { SectionReveal } from "../components/parish/SectionReveal";

interface PlaceholderPageProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function PlaceholderPage({
  title,
  subtitle,
  icon,
}: PlaceholderPageProps) {
  return (
    <main className="min-h-screen pt-nav flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center">
        <SectionReveal>
          <div className="space-y-8">
            {icon && (
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground/40">
                  {icon}
                </div>
              </div>
            )}
            <div>
              <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Parafia św. Jana Chrzciciela
              </p>
              <h1 className="font-display text-4xl sm:text-5xl font-extralight text-foreground mb-4">
                {title}
              </h1>
              <div className="w-12 h-px bg-border mx-auto mb-8" />
            </div>

            <div className="bg-muted/30 rounded-xl p-8 border border-dashed border-border">
              <p className="font-editorial text-xl font-light text-muted-foreground italic">
                Ta sekcja jest w przygotowaniu
              </p>
              {subtitle && (
                <p className="font-sans text-sm text-muted-foreground mt-3">
                  {subtitle}
                </p>
              )}
            </div>

            <p className="font-sans text-sm text-muted-foreground">
              Treść tej sekcji zostanie wkrótce uzupełniona.
              <br />
              Zapraszamy do regularnego odwiedzania naszej strony.
            </p>
          </div>
        </SectionReveal>
      </div>
    </main>
  );
}
