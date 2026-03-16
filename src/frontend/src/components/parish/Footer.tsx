import {
  Check,
  Copy,
  Facebook,
  Globe,
  Heart,
  Twitter,
  Youtube,
} from "lucide-react";
import React, { useState } from "react";
import { useSiteSettings } from "../../hooks/useQueries";
import { Link } from "../../router";

export function Footer() {
  const year = new Date().getFullYear();
  const hostname = window.location.hostname;
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;
  const { data: settings } = useSiteSettings();
  const [copied, setCopied] = useState(false);

  const contactData = React.useMemo(() => {
    if (settings?.contactData) {
      try {
        return JSON.parse(settings.contactData) as {
          bankAccount?: string;
          facebook?: string;
          youtube?: string;
          twitter?: string;
          cmentarzUrl?: string;
        };
      } catch {}
    }
    return {};
  }, [settings]);

  const handleCopy = async () => {
    if (!contactData.bankAccount) return;
    try {
      await navigator.clipboard.writeText(contactData.bankAccount);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const socialLinks = [
    { icon: Globe, label: "Cmentarz Parafii", url: contactData.cmentarzUrl },
    { icon: Facebook, label: "Facebook", url: contactData.facebook },
    { icon: Youtube, label: "YouTube", url: contactData.youtube },
    { icon: Twitter, label: "X / Twitter", url: contactData.twitter },
  ].filter((s) => !!s.url);

  const hasSocialOrBank = !!contactData.bankAccount || socialLinks.length > 0;

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
                { name: "Wspólnoty", path: "/wspolnoty" },
                { name: "Galeria", path: "/galeria" },
                { name: "Kancelaria", path: "/kancelaria" },
                { name: "Kontakt", path: "/kontakt" },
                { name: "Modlitwa", path: "/modlitwa" },
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

          {/* Contact & Social */}
          <div className="space-y-3">
            <div className="font-display text-sm font-light text-foreground/60 uppercase tracking-widest text-xs">
              Kontakt
            </div>

            {hasSocialOrBank ? (
              <div className="space-y-3">
                {/* Bank account */}
                {contactData.bankAccount && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-sans">
                      Konto bankowe:
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-foreground/80 break-all flex-1">
                        {contactData.bankAccount}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="shrink-0 w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
                        title="Kopiuj numer konta"
                        data-ocid="footer.bankaccount.button"
                      >
                        {copied ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Social links */}
                {socialLinks.length > 0 && (
                  <div className="space-y-1.5">
                    {socialLinks.map(({ icon: Icon, label, url }) => (
                      <a
                        key={label}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground font-sans transition-colors group"
                        data-ocid={`footer.social.${label.toLowerCase().replace(/[^a-z0-9]/g, "")}.link`}
                      >
                        <Icon className="w-3 h-3 shrink-0" />
                        {label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground font-sans">
                Dane kontaktowe dostępne w zakładce Kontakt
              </p>
            )}
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
