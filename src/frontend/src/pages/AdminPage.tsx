import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GripVertical,
  Lock,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import type { HomeSection } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllContentBlocks,
  useGetCallerUserProfile,
  useHomeSections,
  useUpdateContentBlock,
  useUpdateHomeSections,
} from "../hooks/useQueries";

// All tabs are now lazy-loaded -- panel admina otwiera się szybciej
const AdminAktualnosciTab = React.lazy(() =>
  import("./AdminAktualnosciTab").then((m) => ({
    default: m.AdminAktualnosciTab,
  })),
);
const AdminGaleriaTab = React.lazy(() =>
  import("./AdminGaleriaTab").then((m) => ({ default: m.AdminGaleriaTab })),
);
const AdminNavigationTab = React.lazy(() =>
  import("./AdminNavigationTab").then((m) => ({
    default: m.AdminNavigationTab,
  })),
);
const AdminUstawieniaTab = React.lazy(() =>
  import("./AdminUstawieniaTab").then((m) => ({
    default: m.AdminUstawieniaTab,
  })),
);
const AdminLiturgiaTab = React.lazy(() =>
  import("./AdminLiturgiaTab").then((m) => ({ default: m.AdminLiturgiaTab })),
);
const KancelariaTab = React.lazy(() =>
  import("./AdminKancelariaTab").then((m) => ({ default: m.KancelariaTab })),
);
const ModlitwaTab = React.lazy(() =>
  import("./AdminModlitwaTab").then((m) => ({ default: m.ModlitwaTab })),
);
const AdminSklepTab = React.lazy(() =>
  import("./AdminSklepTab").then((m) => ({ default: m.AdminSklepTab })),
);
const WspolnotyTab = React.lazy(() =>
  import("./AdminWspolnotyTab").then((m) => ({ default: m.WspolnotyTab })),
);
const AdminZycieTab = React.lazy(() =>
  import("./AdminZycieTab").then((m) => ({ default: m.AdminZycieTab })),
);

const LAZY_FALLBACK = (
  <div className="p-8 text-center text-muted-foreground font-sans text-sm">
    Ładowanie...
  </div>
);

// ============================================================
// ACCESS GUARD
// ============================================================

function AccessDenied() {
  return (
    <div className="min-h-screen pt-nav flex items-center justify-center">
      <div
        className="text-center space-y-6 max-w-sm mx-auto px-4"
        data-ocid="admin.access_denied.panel"
      >
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7 text-muted-foreground" />
        </div>
        <h1 className="font-display text-3xl font-extralight text-foreground">
          Wymagane logowanie
        </h1>
        <p className="font-sans text-sm text-muted-foreground leading-relaxed">
          Kliknij ikonę kłódki w prawym dolnym rogu, aby się zalogować przez
          Internet Identity.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// CONTENT BLOCKS TAB
// ============================================================

const CONTENT_BLOCK_LABELS: Record<
  string,
  { label: string; hint: string; multiline?: boolean }
> = {
  "hero-title": {
    label: "Hero – Tytuł",
    hint: "Główny nagłówek sekcji Hero na stronie głównej",
  },
  "hero-subtitle": {
    label: "Hero – Podtytuł",
    hint: "Krótki podtytuł pod nagłówkiem",
    multiline: true,
  },
  "hero-quote": {
    label: "Hero – Cytat",
    hint: "Cytat wyświetlany w sekcji Hero",
  },
  "pastor-word-title": {
    label: "Słowo Proboszcza – Tytuł",
    hint: "Tytuł sekcji Słowa Proboszcza",
  },
  "pastor-word-text": {
    label: "Słowo Proboszcza – Treść",
    hint: "Treść słowa proboszcza / myśl tygodnia",
    multiline: true,
  },
  "pastor-name": {
    label: "Proboszcz – Imię i nazwisko",
    hint: "Imię i tytuł proboszcza",
  },
  "spiritual-quote-text": {
    label: "Cytat Duchowy – Treść",
    hint: "Główny cytat duchowy na stronie",
    multiline: true,
  },
  "spiritual-quote-author": {
    label: "Cytat Duchowy – Autor",
    hint: "Autor cytatu duchowego",
  },
  "footer-text": {
    label: "Stopka – Tekst",
    hint: "Dodatkowy tekst w stopce strony",
  },
};

function ContentBlocksTab() {
  const { data: blocks, isLoading } = useAllContentBlocks();
  const updateBlock = useUpdateContentBlock();

  const [drafts, setDrafts] = React.useState<Record<string, string>>({});
  const [saved, setSaved] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (blocks && blocks.length > 0) {
      const map: Record<string, string> = {};
      for (const b of blocks) {
        map[b.id] = b.content;
      }
      setDrafts((prev) => ({ ...map, ...prev }));
    }
  }, [blocks]);

  const handleSave = async (key: string) => {
    try {
      await updateBlock.mutateAsync({ key, content: drafts[key] ?? "" });
      setSaved((p) => ({ ...p, [key]: true }));
      toast.success("Treść zapisana");
      setTimeout(() => setSaved((p) => ({ ...p, [key]: false })), 2000);
    } catch {
      toast.error("Błąd zapisu");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4" data-ocid="admin.content.loading_state">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-light text-foreground">
          Treści
        </h2>
      </div>
      <p className="font-sans text-sm text-muted-foreground">
        Edytuj treści blokowe wyświetlane na stronie głównej.
      </p>

      <div className="space-y-6">
        {Object.entries(CONTENT_BLOCK_LABELS).map(
          ([key, { label, hint, multiline }]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-sans font-light text-sm">
                    {label}
                  </Label>
                  <p className="font-sans text-xs text-muted-foreground">
                    {hint}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={saved[key] ? "secondary" : "default"}
                  onClick={() => handleSave(key)}
                  disabled={updateBlock.isPending}
                  className="font-sans font-light shrink-0"
                  data-ocid="admin.content.save_button"
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  {saved[key] ? "Zapisano" : "Zapisz"}
                </Button>
              </div>
              {multiline ? (
                <Textarea
                  value={drafts[key] ?? ""}
                  onChange={(e) =>
                    setDrafts((p) => ({ ...p, [key]: e.target.value }))
                  }
                  placeholder={`Wprowadź: ${label}`}
                  rows={4}
                  className="font-sans resize-none"
                  data-ocid={`admin.content.${key.replace(/-/g, "")}.textarea`}
                />
              ) : (
                <Input
                  value={drafts[key] ?? ""}
                  onChange={(e) =>
                    setDrafts((p) => ({ ...p, [key]: e.target.value }))
                  }
                  placeholder={`Wprowadź: ${label}`}
                  className="font-sans"
                  data-ocid={`admin.content.${key.replace(/-/g, "")}.input`}
                />
              )}
            </div>
          ),
        )}
      </div>
    </div>
  );
}

// ============================================================
// HOME SECTIONS TAB
// ============================================================

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero – Źródło",
  slowo_proboszcza: "Słowo Proboszcza",
  aktualnosci: "Aktualności",
  wspolnoty: "Wspólnoty",
  galeria: "Galeria",
  cytat_duchowy: "Cytat Duchowy",
  kontakt: "Kontakt",
};

const DEFAULT_SECTIONS: HomeSection[] = [
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
    id: "wspolnoty",
    order: 4n,
    sectionType: "wspolnoty",
    enabled: true,
    customTitle: "",
    customContent: "",
  },
  {
    id: "galeria",
    order: 5n,
    sectionType: "galeria",
    enabled: true,
    customTitle: "",
    customContent: "",
  },
  {
    id: "cytat",
    order: 6n,
    sectionType: "cytat_duchowy",
    enabled: true,
    customTitle: "",
    customContent: "",
  },
  {
    id: "kontakt",
    order: 7n,
    sectionType: "kontakt",
    enabled: true,
    customTitle: "",
    customContent: "",
  },
];

function HomeSectionsTab() {
  const { data: serverSections } = useHomeSections();
  const updateSections = useUpdateHomeSections();

  const [sections, setSections] = useState<HomeSection[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  React.useEffect(() => {
    if (serverSections && serverSections.length > 0) {
      setSections(
        [...serverSections].sort((a, b) => Number(a.order) - Number(b.order)),
      );
    } else {
      setSections(DEFAULT_SECTIONS);
    }
  }, [serverSections]);

  const moveUp = (i: number) => {
    if (i === 0) return;
    setSections((prev) => {
      const arr = [...prev];
      [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
      return arr.map((s, idx) => ({ ...s, order: BigInt(idx + 1) }));
    });
  };

  const moveDown = (i: number) => {
    setSections((prev) => {
      if (i >= prev.length - 1) return prev;
      const arr = [...prev];
      [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
      return arr.map((s, idx) => ({ ...s, order: BigInt(idx + 1) }));
    });
  };

  const toggle = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    );
  };

  const updateField = (
    id: string,
    field: "customTitle" | "customContent",
    value: string,
  ) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  const handleSave = async () => {
    try {
      await updateSections.mutateAsync(sections);
      toast.success("Sekcje strony głównej zaktualizowane");
    } catch {
      toast.error("Błąd zapisu");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-light">Strona Główna</h2>
        <Button
          onClick={handleSave}
          disabled={updateSections.isPending}
          size="sm"
          className="font-sans font-light"
          data-ocid="admin.sections.save.submit_button"
        >
          <Save className="w-4 h-4 mr-2" />
          {updateSections.isPending ? "Zapisywanie..." : "Zapisz zmiany"}
        </Button>
      </div>

      <p className="font-sans text-sm text-muted-foreground">
        Zarządzaj kolejnością i widocznością sekcji na stronie głównej.
      </p>

      <div className="space-y-2">
        {sections.map((section, i) => (
          <div
            key={section.id}
            className={`bg-card rounded-xl border transition-all duration-200 ${
              section.enabled ? "border-border" : "border-border/50 opacity-60"
            }`}
            data-ocid={`admin.section.item.${i + 1}`}
          >
            <div className="flex items-center gap-3 p-4">
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-50 hover:opacity-100"
                  onClick={() => moveUp(i)}
                  disabled={i === 0}
                  data-ocid={`admin.section.up.button.${i + 1}`}
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-50 hover:opacity-100"
                  onClick={() => moveDown(i)}
                  disabled={i === sections.length - 1}
                  data-ocid={`admin.section.down.button.${i + 1}`}
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </Button>
              </div>

              <GripVertical className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />

              <div className="flex-1">
                <p className="font-display text-sm font-light text-foreground">
                  {SECTION_LABELS[section.sectionType] || section.sectionType}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(expandedId === section.id ? null : section.id)
                  }
                  className="font-sans text-xs text-muted-foreground hover:text-foreground transition-colors"
                  data-ocid={`admin.section.edit.edit_button.${i + 1}`}
                >
                  {expandedId === section.id ? "Zwiń" : "Edytuj"}
                </button>
                <Switch
                  checked={section.enabled}
                  onCheckedChange={() => toggle(section.id)}
                  data-ocid={`admin.section.enabled.switch.${i + 1}`}
                />
                {section.enabled ? (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>

            {expandedId === section.id && (
              <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
                <div className="space-y-1.5">
                  <Label className="font-sans text-xs font-light text-muted-foreground">
                    Tytuł sekcji (opcjonalnie)
                  </Label>
                  <Input
                    value={section.customTitle}
                    onChange={(e) =>
                      updateField(section.id, "customTitle", e.target.value)
                    }
                    placeholder="Zostaw puste aby użyć domyślnego"
                    className="font-sans text-sm"
                    data-ocid={`admin.section.title.input.${i + 1}`}
                  />
                </div>
                {["slowo_proboszcza", "cytat_duchowy", "hero"].includes(
                  section.sectionType,
                ) && (
                  <div className="space-y-1.5">
                    <Label className="font-sans text-xs font-light text-muted-foreground">
                      Treść
                    </Label>
                    <Textarea
                      value={section.customContent}
                      onChange={(e) =>
                        updateField(section.id, "customContent", e.target.value)
                      }
                      placeholder="Treść sekcji..."
                      rows={4}
                      className="font-sans text-sm resize-none"
                      data-ocid={`admin.section.content.textarea.${i + 1}`}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// MAIN ADMIN PAGE
// ============================================================

export function AdminPage() {
  const { identity } = useInternetIdentity();
  const { data: profile } = useGetCallerUserProfile();

  if (!identity) {
    return <AccessDenied />;
  }

  return (
    <main className="min-h-screen pt-nav bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Panel administratora
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-extralight text-foreground">
            Parafia św. Jana Chrzciciela
          </h1>
          {profile && (
            <p className="font-sans text-sm text-muted-foreground mt-2">
              Zalogowany jako:{" "}
              <span className="text-foreground">{profile.name}</span>
            </p>
          )}
          <div className="w-12 h-px bg-border mt-4" />
        </div>

        <Tabs defaultValue="strona" className="space-y-8">
          <TabsList
            className="flex flex-wrap gap-1 h-auto bg-muted/40 p-1 rounded-xl"
            data-ocid="admin.tabs.panel"
          >
            {[
              { value: "strona", label: "Strona Główna" },
              { value: "tresci", label: "Treści" },
              { value: "aktualnosci", label: "Aktualności" },
              { value: "liturgia", label: "Liturgia" },
              { value: "galeria", label: "Galeria" },
              { value: "nawigacja", label: "Nawigacja" },
              { value: "ustawienia", label: "Ustawienia" },
              { value: "wspolnoty", label: "Wspólnoty" },
              { value: "kancelaria", label: "Kancelaria" },
              { value: "modlitwa", label: "Modlitwa" },
              { value: "zycie", label: "Życie" },
              { value: "sklep", label: "Sklep" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="font-sans font-light text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg"
                data-ocid={`admin.${tab.value}.tab`}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <React.Suspense fallback={LAZY_FALLBACK}>
            <TabsContent value="strona">
              <HomeSectionsTab />
            </TabsContent>
            <TabsContent value="tresci">
              <ContentBlocksTab />
            </TabsContent>
            <TabsContent value="aktualnosci">
              <AdminAktualnosciTab />
            </TabsContent>
            <TabsContent value="liturgia">
              <AdminLiturgiaTab />
            </TabsContent>
            <TabsContent value="galeria">
              <AdminGaleriaTab />
            </TabsContent>
            <TabsContent value="nawigacja">
              <AdminNavigationTab />
            </TabsContent>
            <TabsContent value="ustawienia">
              <AdminUstawieniaTab />
            </TabsContent>
            <TabsContent value="wspolnoty">
              <WspolnotyTab />
            </TabsContent>
            <TabsContent value="kancelaria">
              <KancelariaTab />
            </TabsContent>
            <TabsContent value="modlitwa">
              <ModlitwaTab />
            </TabsContent>
            <TabsContent value="zycie">
              <AdminZycieTab />
            </TabsContent>
            <TabsContent value="sklep">
              <AdminSklepTab />
            </TabsContent>
          </React.Suspense>
        </Tabs>
      </div>
    </main>
  );
}
