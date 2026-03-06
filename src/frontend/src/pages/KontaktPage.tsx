import { Clock, Mail, MapPin, Phone } from "lucide-react";
import React from "react";
import { SectionReveal } from "../components/parish/SectionReveal";
import { useSiteSettings } from "../hooks/useQueries";

interface ContactData {
  address: string;
  phone: string;
  email: string;
  hours: string;
}

const DEFAULT_CONTACT: ContactData = {
  address: "",
  phone: "",
  email: "",
  hours: "",
};

export function KontaktPage() {
  const { data: settings } = useSiteSettings();

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

  return (
    <main className="min-h-screen pt-nav">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <SectionReveal>
          <div className="mb-16">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Jesteśmy dla Ciebie
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-extralight text-foreground">
              Kontakt
            </h1>
            <div className="w-12 h-px bg-border mt-6" />
          </div>
        </SectionReveal>

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

        <SectionReveal delay={400}>
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
