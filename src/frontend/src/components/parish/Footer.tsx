import { Heart } from "lucide-react";
import React from "react";
import { Link } from "../../router";

export function Footer() {
  const year = new Date().getFullYear();
  const hostname = window.location.hostname;
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer className="border-t border-border bg-card/40 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Parish info */}
          <div className="space-y-3">
            <div className="font-display text-base font-light text-foreground">
              Parafia św. Jana Chrzciciela
            </div>
            <p className="text-xs text-muted-foreground font-sans leading-relaxed">
              Strona parafialna
            </p>
          </div>

          {/* Navigation links */}
          <div className="space-y-3">
            <div className="font-display text-sm font-light text-foreground/60 uppercase tracking-widest text-xs">
              Nawigacja
            </div>
            <div className="grid grid-cols-2 gap-1">
              {[
                { name: "Aktualności", path: "/aktualnosci" },
                { name: "Liturgia", path: "/liturgia" },
                { name: "Galeria", path: "/galeria" },
                { name: "Kontakt", path: "/kontakt" },
                { name: "Kancelaria", path: "/kancelaria" },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-xs text-muted-foreground hover:text-foreground font-sans transition-colors duration-200"
                  data-ocid={`footer.${item.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.link`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact placeholder */}
          <div className="space-y-3">
            <div className="font-display text-sm font-light text-foreground/60 uppercase tracking-widest text-xs">
              Kontakt
            </div>
            <p className="text-xs text-muted-foreground font-sans">
              Dane kontaktowe dostępne w zakładce Kontakt
            </p>
          </div>
        </div>

        <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground font-sans">
            © {year}. Wszelkie prawa zastrzeżone.
          </p>
          <a
            href={caffeineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-sans"
          >
            Zbudowane z{" "}
            <Heart className="w-3 h-3 text-destructive fill-current" /> przy
            użyciu <span className="font-medium">caffeine.ai</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
