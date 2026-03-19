import {
  Check,
  Clock,
  Copy,
  Facebook,
  Globe,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";
import { motion } from "motion/react";
import React, { useState } from "react";
import { KontaktSkeleton } from "../components/parish/PageSkeleton";
import { SectionReveal } from "../components/parish/SectionReveal";
import { useSiteSettings } from "../hooks/useQueries";

interface ContactData {
  address: string;
  phone: string;
  email: string;
  hours: string;
  bankAccount: string;
  facebook: string;
  youtube: string;
  twitter: string;
  cmentarzUrl: string;
}

const DEFAULT_CONTACT: ContactData = {
  address: "",
  phone: "",
  email: "",
  hours: "",
  bankAccount: "",
  facebook: "",
  youtube: "",
  twitter: "",
  cmentarzUrl: "",
};

export function KontaktPage() {
  const { data: settings, isLoading } = useSiteSettings();
  const [copied, setCopied] = useState(false);

  const contact: ContactData = React.useMemo(() => {
    if (settings?.contactData) {
      try {
        return { ...DEFAULT_CONTACT, ...JSON.parse(settings.contactData) };
      } catch {
        return DEFAULT_CONTACT;
      }
    }
    return DEFAULT_CONTACT;
  }, [settings]);

  if (isLoading && !settings) {
    return <KontaktSkeleton />;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contact.bankAccount);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const items = [
    {
      icon: MapPin,
      label: "Adres",
      value: contact.address,
      placeholder: "Adres kościoła zostanie uzupełniony przez administratora",
    },
    {
      icon: Phone,
      label: "Telefon",
      value: contact.phone,
      placeholder: "Numer telefonu do parafii",
    },
    {
      icon: Mail,
      label: "E-mail",
      value: contact.email,
      placeholder: "Adres e-mail parafii",
    },
    {
      icon: Clock,
      label: "Godziny urzędowania kancelarii",
      value: contact.hours,
      placeholder: "Godziny pracy kancelarii parafialnej",
    },
  ];

  const socialLinks = [
    { icon: Globe, label: "Cmentarz Parafii", url: contact.cmentarzUrl },
    { icon: Facebook, label: "Facebook", url: contact.facebook },
    { icon: Youtube, label: "YouTube", url: contact.youtube },
    { icon: Twitter, label: "X / Twitter", url: contact.twitter },
  ].filter((s) => !!s.url);

  return (
    <main className="min-h-screen pt-nav">
      <section
        className="relative flex items-center justify-center min-h-[40vh] overflow-hidden"
        data-ocid="kontakt.hero.section"
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
            Kontakt
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="font-sans text-lg font-light text-foreground/70 leading-relaxed"
          >
            Jesteśmy dla Ciebie
          </motion.p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map(({ icon: Icon, label, value, placeholder }, i) => (
            <SectionReveal key={label} delay={i * 100}>
              <div
                className="bg-card rounded-xl p-8 border border-border space-y-4"
                data-ocid={`contact.${label.toLowerCase().replace(/[^a-z0-9]/g, "")}.card`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <h2 className="font-sans text-xs uppercase tracking-[0.15em] text-muted-foreground">
                    {label}
                  </h2>
                </div>
                {value ? (
                  <p className="font-display text-lg font-light text-foreground whitespace-pre-line">
                    {value}
                  </p>
                ) : (
                  <p className="font-editorial text-base font-light text-muted-foreground/50 italic">
                    {placeholder}
                  </p>
                )}
              </div>
            </SectionReveal>
          ))}
        </div>

        {/* Bank Account */}
        {contact.bankAccount && (
          <SectionReveal delay={450}>
            <div
              className="mt-8 bg-card rounded-xl p-8 border border-border"
              data-ocid="kontakt.bankaccount.card"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-green-600" />
                </div>
                <h2 className="font-sans text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  Numer konta bankowego
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <p className="font-mono text-lg text-foreground tracking-wide flex-1">
                  {contact.bankAccount}
                </p>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-700 hover:bg-green-500/20 transition-colors font-sans text-sm font-light"
                  data-ocid="kontakt.bankaccount.button"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" /> Skopiowano!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Kopiuj numer konta
                    </>
                  )}
                </button>
              </div>
            </div>
          </SectionReveal>
        )}

        {/* Social Media */}
        {socialLinks.length > 0 && (
          <SectionReveal delay={500}>
            <div className="mt-8" data-ocid="kontakt.social.section">
              <h2 className="font-sans text-xs uppercase tracking-[0.15em] text-muted-foreground text-center mb-6">
                Media Społecznościowe
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                {socialLinks.map(({ icon: Icon, label, url }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-5 py-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-accent/30 transition-all group"
                    data-ocid={`kontakt.social.${label.toLowerCase().replace(/[^a-z0-9]/g, "")}.link`}
                  >
                    <Icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="font-sans text-sm font-light text-muted-foreground group-hover:text-foreground transition-colors">
                      {label}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </SectionReveal>
        )}

        <SectionReveal delay={550}>
          <div className="mt-12 bg-muted/30 rounded-xl p-8 border border-dashed border-border text-center">
            <p className="font-editorial text-xl font-light text-muted-foreground italic">
              "Przyjdźcie do mnie wszyscy..."
            </p>
          </div>
        </SectionReveal>
      </div>
    </main>
  );
}
