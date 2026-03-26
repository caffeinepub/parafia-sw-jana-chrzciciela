import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, Save, Upload } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useSiteSettings, useUpdateSiteSettings } from "../hooks/useQueries";
import { useZycieImageUpload } from "../hooks/useZycieImageUpload";

const DEFAULT_NAV = [
  { name: "Aktualności", path: "/aktualnosci", visible: true },
  { name: "Liturgia", path: "/liturgia", visible: true },
  { name: "Wspólnoty", path: "/wspolnoty", visible: true },
  { name: "Galeria", path: "/galeria", visible: true },
  { name: "Kancelaria", path: "/kancelaria", visible: true },
  { name: "Kontakt", path: "/kontakt", visible: true },
  { name: "Modlitwa", path: "/modlitwa", visible: true },
  { name: "Życie", path: "/zycie", visible: true },
  { name: "Sklep", path: "/sklep", visible: true },
];

function QrImageField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  label: string;
}) {
  const ref = React.useRef<HTMLInputElement>(null);
  const { upload } = useZycieImageUpload();
  const [uploading, setUploading] = React.useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const url = await upload(file);
      onChange(url);
    } catch {
      toast.error("Nie udało się wgrać kodu QR");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2 sm:col-span-2">
      <Label className="font-sans font-light">{label}</Label>
      <button
        type="button"
        className="relative w-32 h-32 rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors overflow-hidden cursor-pointer text-left"
        onClick={() => ref.current?.click()}
      >
        {value ? (
          <img
            src={value}
            alt="QR pogląd"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
            <span className="font-sans text-xs text-muted-foreground/60 text-center px-2">
              Kliknij, aby wgrać QR
            </span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <Upload className="w-4 h-4 animate-bounce text-primary" />
          </div>
        )}
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}

export function AdminUstawieniaTab() {
  const { data: settings } = useSiteSettings();
  const update = useUpdateSiteSettings();

  const [contact, setContact] = useState({
    address: "",
    phone: "",
    email: "",
    hours: "",
    bankAccount: "",
    facebook: "",
    youtube: "",
    twitter: "",
    cmentarzUrl: "",
    navLogoUrl: "",
    parishName: "",
    parishMotto: "",
    parishIconUrl: "",
    footerNavLinks: "[]",
    lightningAddress: "",
    lightningQrUrl: "",
    lightningDescription: "",
    lightningEnabled: false,
    usdcAddress: "",
    usdcQrUrl: "",
    usdcEnabled: false,
  });
  const [lightningAddrInput, setLightningAddrInput] = React.useState("");
  const [lightningAddrConfirm, setLightningAddrConfirm] = React.useState("");
  const [usdcAddrInput, setUsdcAddrInput] = React.useState("");
  const [usdcAddrConfirm, setUsdcAddrConfirm] = React.useState("");
  const [aestheticMode, setAestheticMode] = useState("jordan");
  const [footerNavItems, setFooterNavItems] = useState<
    { name: string; path: string }[]
  >([]);
  const [newFooterLink, setNewFooterLink] = useState({ name: "", path: "" });

  React.useEffect(() => {
    if (settings) {
      try {
        const parsed = JSON.parse(settings.contactData || "{}");
        setContact({
          address: "",
          phone: "",
          email: "",
          hours: "",
          bankAccount: "",
          facebook: "",
          youtube: "",
          twitter: "",
          cmentarzUrl: "",
          navLogoUrl: "",
          parishName: "",
          parishMotto: "",
          parishIconUrl: "",
          footerNavLinks: "[]",
          lightningAddress: "",
          lightningQrUrl: "",
          lightningDescription: "",
          lightningEnabled: false,
          usdcAddress: "",
          usdcQrUrl: "",
          usdcEnabled: false,
          ...parsed,
        });
        setLightningAddrInput(parsed.lightningAddress || "");
        setLightningAddrConfirm(parsed.lightningAddress || "");
        setUsdcAddrInput(parsed.usdcAddress || "");
        setUsdcAddrConfirm(parsed.usdcAddress || "");
        try {
          const navItems = JSON.parse(parsed.footerNavLinks || "[]");
          setFooterNavItems(navItems);
        } catch {}
      } catch {}
      setAestheticMode(settings.aestheticMode || "jordan");
    }
  }, [settings]);

  const handleSave = async () => {
    const base = settings || {
      navigation: JSON.stringify(DEFAULT_NAV),
      typography: "{}",
    };
    try {
      await update.mutateAsync({
        ...base,
        contactData: JSON.stringify({
          ...contact,
          footerNavLinks: JSON.stringify(footerNavItems),
        }),
        aestheticMode,
      });
      toast.success("Ustawienia zapisane");
    } catch {
      toast.error("Błąd zapisu");
    }
  };

  const handleLogoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "navLogoUrl" | "parishIconUrl",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setContact((p) => ({ ...p, [field]: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const QUICK_NAV_LINKS = [
    { name: "Aktualności", path: "/aktualnosci" },
    { name: "Liturgia", path: "/liturgia" },
    { name: "Wspólnoty", path: "/wspolnoty" },
    { name: "Galeria", path: "/galeria" },
    { name: "Kancelaria", path: "/kancelaria" },
    { name: "Kontakt", path: "/kontakt" },
    { name: "Modlitwa", path: "/modlitwa" },
    { name: "Życie", path: "/zycie" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-light">Ustawienia</h2>
        <Button
          onClick={handleSave}
          disabled={update.isPending}
          size="sm"
          className="font-sans font-light"
          data-ocid="admin.settings.save.submit_button"
        >
          <Save className="w-4 h-4 mr-2" />
          {update.isPending ? "Zapisywanie..." : "Zapisz"}
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="font-display text-base font-light text-foreground/70">
          Tryb estetyczny (domyślny)
        </h3>
        <div className="flex flex-wrap gap-2">
          {["jordan", "pustynia", "ogien", "cisza", "noc"].map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => setAestheticMode(m)}
              className={`px-4 py-2 rounded-full font-sans text-sm capitalize transition-all ${
                aestheticMode === m
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
              data-ocid={`admin.settings.mode.${m}.button`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Logo parafii */}
      <div className="space-y-4">
        <h3 className="font-display text-base font-light text-foreground/70">
          Logo parafii (nawigacja)
        </h3>
        <p className="text-sm text-muted-foreground font-sans">
          Jeśli wgrasz logo, pojawi się obok nazwy parafii w górnym pasku
          nawigacji. Jeśli brak, wyświetla się sama nazwa tekstowa.
        </p>
        <div className="flex items-center gap-4">
          {contact.navLogoUrl ? (
            <img
              src={contact.navLogoUrl}
              alt="Logo pogląd"
              className="w-16 h-16 rounded-full object-cover border-2 border-border"
            />
          ) : (
            <label
              className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors"
              title="Kliknij, aby wgrać logo"
            >
              <span className="text-xs text-muted-foreground font-sans text-center leading-tight px-1">
                +<br />
                logo
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleLogoUpload(e, "navLogoUrl")}
                data-ocid="admin.settings.navlogo.upload_button"
              />
            </label>
          )}
          <div className="space-y-2">
            {contact.navLogoUrl && (
              <>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-dashed border-border cursor-pointer hover:bg-accent/30 transition-colors text-xs text-muted-foreground font-sans">
                  Zmień logo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleLogoUpload(e, "navLogoUrl")}
                    data-ocid="admin.settings.navlogo.change.upload_button"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setContact((p) => ({ ...p, navLogoUrl: "" }))}
                  className="block text-xs text-destructive hover:underline font-sans"
                  data-ocid="admin.settings.navlogo.delete_button"
                >
                  Usuń logo
                </button>
              </>
            )}
            {!contact.navLogoUrl && (
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-dashed border-border cursor-pointer hover:bg-accent/30 transition-colors text-xs text-muted-foreground font-sans">
                Wgraj logo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleLogoUpload(e, "navLogoUrl")}
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Parish info */}
      <div className="space-y-4">
        <h3 className="font-display text-base font-light text-foreground/70">
          Informacje w stopce (lewa kolumna)
        </h3>
        <p className="text-sm text-muted-foreground font-sans">
          Edytuj lewą kolumnę stopki – nazwa parafii, motto i mała ikona.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-sans font-light">Nazwa parafii</Label>
            <Input
              value={contact.parishName}
              onChange={(e) =>
                setContact((p) => ({ ...p, parishName: e.target.value }))
              }
              placeholder="Parafia św. Jana Chrzciciela"
              className="font-sans"
              data-ocid="admin.settings.parishname.input"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-sans font-light">Motto / krótki opis</Label>
            <Input
              value={contact.parishMotto}
              onChange={(e) =>
                setContact((p) => ({ ...p, parishMotto: e.target.value }))
              }
              placeholder="Strona parafialna"
              className="font-sans"
              data-ocid="admin.settings.parishmotto.input"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="font-sans font-light">
            Ikona / miniaturka parafii
          </Label>
          <div className="flex items-center gap-4">
            {contact.parishIconUrl ? (
              <img
                src={contact.parishIconUrl}
                alt="Ikona pogląd"
                className="w-12 h-12 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <label className="w-12 h-12 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors">
                <span className="text-xs text-muted-foreground font-sans">
                  +
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleLogoUpload(e, "parishIconUrl")}
                  data-ocid="admin.settings.parishicon.upload_button"
                />
              </label>
            )}
            {contact.parishIconUrl && (
              <div className="space-y-1">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-dashed border-border cursor-pointer hover:bg-accent/30 transition-colors text-xs text-muted-foreground font-sans">
                  Zmień ikonę
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleLogoUpload(e, "parishIconUrl")}
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setContact((p) => ({ ...p, parishIconUrl: "" }))
                  }
                  className="block text-xs text-destructive hover:underline font-sans"
                  data-ocid="admin.settings.parishicon.delete_button"
                >
                  Usuń ikonę
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer navigation */}
      <div className="space-y-4">
        <h3 className="font-display text-base font-light text-foreground/70">
          Nawigacja w stopce (środkowa kolumna)
        </h3>
        <p className="text-sm text-muted-foreground font-sans">
          Ustaw niezależną listę linków wyświetlanych w środkowej kolumnie
          stopki.
        </p>
        {footerNavItems.length > 0 && (
          <div className="space-y-2">
            {footerNavItems.map((item, idx) => (
              <div
                key={item.path}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/40"
                data-ocid={`admin.settings.footernav.item.${idx + 1}`}
              >
                <span className="text-sm font-sans text-foreground flex-1">
                  {item.name}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {item.path}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setFooterNavItems((prev) =>
                      prev.filter((_, i) => i !== idx),
                    )
                  }
                  className="text-xs text-destructive hover:underline font-sans shrink-0"
                  data-ocid={`admin.settings.footernav.delete_button.${idx + 1}`}
                >
                  Usuń
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {QUICK_NAV_LINKS.filter(
              (q) => !footerNavItems.find((f) => f.path === q.path),
            ).map((q) => (
              <button
                key={q.path}
                type="button"
                onClick={() => setFooterNavItems((prev) => [...prev, q])}
                className="px-2.5 py-1 rounded-full text-xs font-sans bg-muted text-muted-foreground hover:bg-accent hover:text-foreground transition-colors border border-border"
                data-ocid="admin.settings.footernav.quickadd.button"
              >
                + {q.name}
              </button>
            ))}
          </div>
          <div className="flex items-end gap-2">
            <div className="space-y-1 flex-1">
              <Label className="font-sans font-light text-xs">
                Własna nazwa
              </Label>
              <Input
                value={newFooterLink.name}
                onChange={(e) =>
                  setNewFooterLink((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="np. Rekolekcje"
                className="font-sans text-sm"
                data-ocid="admin.settings.footernav.name.input"
              />
            </div>
            <div className="space-y-1 flex-1">
              <Label className="font-sans font-light text-xs">Cieżka</Label>
              <Input
                value={newFooterLink.path}
                onChange={(e) =>
                  setNewFooterLink((p) => ({ ...p, path: e.target.value }))
                }
                placeholder="/liturgia"
                className="font-sans text-sm"
                data-ocid="admin.settings.footernav.path.input"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (!newFooterLink.name || !newFooterLink.path) return;
                setFooterNavItems((prev) => [...prev, newFooterLink]);
                setNewFooterLink({ name: "", path: "" });
              }}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-sans hover:bg-primary/90 transition-colors whitespace-nowrap"
              data-ocid="admin.settings.footernav.add.button"
            >
              Dodaj
            </button>
          </div>
        </div>
      </div>

      {/* Dane kontaktowe */}
      <div className="space-y-4">
        <h3 className="font-display text-base font-light text-foreground/70">
          Dane kontaktowe
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-sans font-light">Adres</Label>
            <Textarea
              value={contact.address}
              onChange={(e) =>
                setContact((p) => ({ ...p, address: e.target.value }))
              }
              placeholder="ul. Przykładowa 1, 00-000 Miasto"
              rows={3}
              className="font-sans resize-none"
              data-ocid="admin.settings.address.textarea"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-sans font-light">Godziny kancelarii</Label>
            <Textarea
              value={contact.hours}
              onChange={(e) =>
                setContact((p) => ({ ...p, hours: e.target.value }))
              }
              placeholder="Pn–Pt: 9:00–12:00"
              rows={3}
              className="font-sans resize-none"
              data-ocid="admin.settings.hours.textarea"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-sans font-light">Telefon</Label>
            <Input
              value={contact.phone}
              onChange={(e) =>
                setContact((p) => ({ ...p, phone: e.target.value }))
              }
              placeholder="+48 000 000 000"
              className="font-sans"
              data-ocid="admin.settings.phone.input"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-sans font-light">E-mail</Label>
            <Input
              type="email"
              value={contact.email}
              onChange={(e) =>
                setContact((p) => ({ ...p, email: e.target.value }))
              }
              placeholder="parafia@example.pl"
              className="font-sans"
              data-ocid="admin.settings.email.input"
            />
          </div>
        </div>
      </div>

      {/* Media społecznościowe */}
      <div className="space-y-4">
        <h3 className="font-display text-base font-light text-foreground/70">
          Media społecznościowe i konto bankowe
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label className="font-sans font-light">
              Numer konta bankowego
            </Label>
            <Input
              value={contact.bankAccount}
              onChange={(e) =>
                setContact((p) => ({ ...p, bankAccount: e.target.value }))
              }
              placeholder="XX XXXX XXXX XXXX XXXX XXXX XXXX"
              className="font-sans font-mono"
              data-ocid="admin.settings.bankaccount.input"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-sans font-light">Facebook (URL)</Label>
            <Input
              value={contact.facebook}
              onChange={(e) =>
                setContact((p) => ({ ...p, facebook: e.target.value }))
              }
              placeholder="https://facebook.com/..."
              className="font-sans"
              data-ocid="admin.settings.facebook.input"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-sans font-light">YouTube (URL)</Label>
            <Input
              value={contact.youtube}
              onChange={(e) =>
                setContact((p) => ({ ...p, youtube: e.target.value }))
              }
              placeholder="https://youtube.com/..."
              className="font-sans"
              data-ocid="admin.settings.youtube.input"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-sans font-light">X / Twitter (URL)</Label>
            <Input
              value={contact.twitter}
              onChange={(e) =>
                setContact((p) => ({ ...p, twitter: e.target.value }))
              }
              placeholder="https://x.com/..."
              className="font-sans"
              data-ocid="admin.settings.twitter.input"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-sans font-light">
              Strona Cmentarza (URL)
            </Label>
            <Input
              value={contact.cmentarzUrl}
              onChange={(e) =>
                setContact((p) => ({ ...p, cmentarzUrl: e.target.value }))
              }
              placeholder="https://cmentarz.pl/..."
              className="font-sans"
              data-ocid="admin.settings.cmentarz.input"
            />
          </div>
        </div>
      </div>

      {/* Bitcoin Lightning */}
      <div className="space-y-4 pt-4 border-t border-border/40">
        <h3 className="font-display text-base font-light text-foreground/70">
          Bitcoin Lightning
        </h3>
        <div className="flex items-center gap-3">
          <Switch
            checked={contact.lightningEnabled}
            onCheckedChange={(v) =>
              setContact((p) => ({ ...p, lightningEnabled: v }))
            }
            data-ocid="admin.settings.lightning.switch"
          />
          <Label className="font-sans font-light">
            Włącz metodę Bitcoin Lightning
          </Label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-sans font-light">Lightning Address</Label>
            <Input
              value={lightningAddrInput}
              onChange={(e) => {
                setLightningAddrInput(e.target.value);
                if (
                  !lightningAddrConfirm ||
                  e.target.value === lightningAddrConfirm
                ) {
                  setContact((p) => ({
                    ...p,
                    lightningAddress: e.target.value,
                  }));
                }
              }}
              placeholder="parafia@wallet.com lub lnbc..."
              className="font-sans font-mono"
              data-ocid="admin.settings.lightning.input"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-sans font-light">
              Powtórz Lightning Address
            </Label>
            <Input
              value={lightningAddrConfirm}
              onChange={(e) => {
                setLightningAddrConfirm(e.target.value);
                if (e.target.value === lightningAddrInput) {
                  setContact((p) => ({
                    ...p,
                    lightningAddress: lightningAddrInput,
                  }));
                }
              }}
              placeholder="Powtórz adres"
              className="font-sans font-mono"
              data-ocid="admin.settings.lightning_confirm.input"
            />
          </div>
          {lightningAddrInput &&
            lightningAddrConfirm &&
            lightningAddrInput !== lightningAddrConfirm && (
              <p className="text-sm text-destructive sm:col-span-2">
                Adresy nie są zgodne
              </p>
            )}
          <div className="space-y-2 sm:col-span-2">
            <Label className="font-sans font-light">Opis (opcjonalny)</Label>
            <Input
              value={contact.lightningDescription}
              onChange={(e) =>
                setContact((p) => ({
                  ...p,
                  lightningDescription: e.target.value,
                }))
              }
              placeholder="Możesz wesprzepał parafię przez sieć Bitcoin Lightning."
              className="font-sans"
              data-ocid="admin.settings.lightning_desc.input"
            />
          </div>
          <QrImageField
            label="Kod QR Bitcoin Lightning"
            value={contact.lightningQrUrl}
            onChange={(url) =>
              setContact((p) => ({ ...p, lightningQrUrl: url }))
            }
          />
        </div>
      </div>

      {/* USDC (Arbitrum) */}
      <div className="space-y-4 pt-4 border-t border-border/40">
        <h3 className="font-display text-base font-light text-foreground/70">
          USDC (Arbitrum)
        </h3>
        <div className="flex items-center gap-3">
          <Switch
            checked={contact.usdcEnabled}
            onCheckedChange={(v) =>
              setContact((p) => ({ ...p, usdcEnabled: v }))
            }
            data-ocid="admin.settings.usdc.switch"
          />
          <Label className="font-sans font-light">
            Włącz metodę USDC (Arbitrum)
          </Label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-sans font-light">Adres portfela USDC</Label>
            <Input
              value={usdcAddrInput}
              onChange={(e) => {
                setUsdcAddrInput(e.target.value);
                if (!usdcAddrConfirm || e.target.value === usdcAddrConfirm) {
                  setContact((p) => ({ ...p, usdcAddress: e.target.value }));
                }
              }}
              placeholder="0x..."
              className="font-sans font-mono"
              data-ocid="admin.settings.usdc.input"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-sans font-light">
              Powtórz adres portfela USDC
            </Label>
            <Input
              value={usdcAddrConfirm}
              onChange={(e) => {
                setUsdcAddrConfirm(e.target.value);
                if (e.target.value === usdcAddrInput) {
                  setContact((p) => ({ ...p, usdcAddress: usdcAddrInput }));
                }
              }}
              placeholder="Powtórz adres"
              className="font-sans font-mono"
              data-ocid="admin.settings.usdc_confirm.input"
            />
          </div>
          {usdcAddrInput &&
            usdcAddrConfirm &&
            usdcAddrInput !== usdcAddrConfirm && (
              <p className="text-sm text-destructive sm:col-span-2">
                Adresy nie są zgodne
              </p>
            )}
          <QrImageField
            label="Kod QR USDC (Arbitrum)"
            value={contact.usdcQrUrl}
            onChange={(url) => setContact((p) => ({ ...p, usdcQrUrl: url }))}
          />
          <p className="font-sans text-xs text-amber-600 font-medium sm:col-span-2">
            Wysyłaj tylko USDC przez sieć Arbitrum.
          </p>
        </div>
      </div>
    </div>
  );
}
