import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  GripVertical,
  Image as ImageIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import React, { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useZycieData } from "../hooks/useZycieData";
import { useZycieImageUpload } from "../hooks/useZycieImageUpload";
import type { ZycieData, ZycieTile } from "./ZyciePage";

function generateId() {
  return `tile_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ============================================================
// IMAGE FIELD COMPONENT (blob-storage upload, returns URL)
// ============================================================

function ImageField({
  value,
  onChange,
  label,
  aspectRatio = "4/3",
}: {
  value: string;
  onChange: (url: string) => void;
  label: string;
  aspectRatio?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const { upload } = useZycieImageUpload();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgressVal] = useState(0);

  const handleFile = async (file: File) => {
    setUploading(true);
    setProgressVal(0);
    try {
      const url = await upload(file);
      onChange(url);
    } catch (e) {
      console.error("Image upload failed:", e);
      toast.error("Nie udało się wgrać zdjęcia");
    } finally {
      setUploading(false);
      setProgressVal(0);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="font-sans text-sm font-light">{label}</Label>
      <button
        type="button"
        className="relative w-full rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors overflow-hidden cursor-pointer text-left"
        style={{ aspectRatio }}
        onClick={() => ref.current?.click()}
        aria-label="Dodaj zdjęcie"
      >
        {value ? (
          <img
            src={value}
            alt="Podgląd"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
            <span className="font-sans text-sm text-muted-foreground/60">
              Kliknij, aby dodać zdjęcie
            </span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-background/70 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <span className="text-xs font-sans text-muted-foreground">
              {progress > 0 ? `${progress}%` : "Wgrywanie…"}
            </span>
          </div>
        )}
        <div className="absolute bottom-2 right-2">
          <button
            type="button"
            className="bg-card/80 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-xs font-sans hover:bg-card transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              ref.current?.click();
            }}
          >
            <Upload className="w-3.5 h-3.5" />
            {value ? "Zmień" : "Dodaj"}
          </button>
        </div>
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ============================================================
// HERO TEXTS TAB
// ============================================================

function HeroTextsSubTab({
  data,
  saveData,
}: {
  data: ZycieData;
  saveData: (data: ZycieData) => Promise<void>;
}) {
  const [draft, setDraft] = useState(data.heroTexts);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await saveData({ ...data, heroTexts: draft });
      toast.success("Zapisano teksty hero");
    } catch {
      toast.error("Błąd zapisu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="font-display text-lg font-semibold text-foreground">
          Teksty sekcji Hero
        </h3>
        <p className="text-sm text-muted-foreground font-sans">
          Edytuj nagłówek i opis sekcji &quot;Życie&quot;
        </p>
      </div>
      <Separator />
      <div className="space-y-5 max-w-xl">
        <div className="space-y-2">
          <Label htmlFor="zycie-title">Tytuł</Label>
          <Input
            id="zycie-title"
            value={draft.title}
            onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
            data-ocid="zycie.hero.title.input"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zycie-subtitle">Podtytuł</Label>
          <Input
            id="zycie-subtitle"
            value={draft.subtitle}
            onChange={(e) =>
              setDraft((p) => ({ ...p, subtitle: e.target.value }))
            }
            data-ocid="zycie.hero.subtitle.input"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zycie-desc">Opis</Label>
          <Textarea
            id="zycie-desc"
            rows={3}
            value={draft.description}
            onChange={(e) =>
              setDraft((p) => ({ ...p, description: e.target.value }))
            }
            data-ocid="zycie.hero.description.textarea"
          />
        </div>
        <Button
          onClick={save}
          disabled={saving}
          data-ocid="zycie.hero.save_button"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Zapisz
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// TILE EDITOR
// ============================================================

function TileEditor({
  tile,
  index,
  onChange,
  onDelete,
}: {
  tile: ZycieTile;
  index: number;
  onChange: (tile: ZycieTile) => void;
  onDelete: () => void;
}) {
  const update = (fields: Partial<ZycieTile>) =>
    onChange({ ...tile, ...fields });

  return (
    <div
      className="border border-border/60 rounded-xl p-5 space-y-4 bg-muted/20"
      data-ocid={`zycie.tile.card.${index + 1}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground/50" />
          <span className="text-sm font-sans font-medium text-muted-foreground">
            Kafelek #{index + 1}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          data-ocid={`zycie.tile.delete_button.${index + 1}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tytuł kafelka</Label>
          <Input
            value={tile.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="np. I Komunia, Rekolekcje…"
            data-ocid={`zycie.tile.title.input.${index + 1}`}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <ImageField
            value={tile.image}
            onChange={(url) => update({ image: url })}
            label="Zdjęcie kafelka (16:9)"
            aspectRatio="16/9"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Treść</Label>
          <Textarea
            rows={3}
            value={tile.content}
            onChange={(e) => update({ content: e.target.value })}
            placeholder="Opis, ogłoszenie, cytat…"
            data-ocid={`zycie.tile.content.textarea.${index + 1}`}
          />
        </div>
        <div className="space-y-2">
          <Label>Link YouTube</Label>
          <Input
            value={tile.youtubeUrl}
            onChange={(e) => update({ youtubeUrl: e.target.value })}
            placeholder="https://youtube.com/watch?v=…"
            data-ocid={`zycie.tile.youtube.input.${index + 1}`}
          />
        </div>
        <div className="space-y-2">
          <Label>URL audio (zewnętrzny)</Label>
          <Input
            value={tile.audioUrl}
            onChange={(e) => update({ audioUrl: e.target.value })}
            placeholder="https://…/kazanie.mp3"
            data-ocid={`zycie.tile.audio.input.${index + 1}`}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// YEARS & TILES TAB
// ============================================================

function YearsTilesSubTab({
  data,
  saveData,
}: {
  data: ZycieData;
  saveData: (data: ZycieData) => Promise<void>;
}) {
  const [draft, setDraft] = useState<ZycieData>(data);
  const [selectedYear, setSelectedYear] = useState("2026");
  const [newYear, setNewYear] = useState("");
  const [saving, setSaving] = useState(false);

  // Sync draft when data prop changes (e.g. after backend fetch)
  React.useEffect(() => {
    setDraft(data);
  }, [data]);

  const availableYears = Object.keys(draft.years).sort(
    (a, b) => Number(b) - Number(a),
  );

  const yearData = draft.years[selectedYear] ?? {
    heroImage: "",
    heroDescription: "",
    tiles: [],
  };

  const updateYearField = useCallback(
    (fields: Partial<{ heroImage: string; heroDescription: string }>) => {
      setDraft((prev) => ({
        ...prev,
        years: {
          ...prev.years,
          [selectedYear]: { ...prev.years[selectedYear], ...fields },
        },
      }));
    },
    [selectedYear],
  );

  const updateTiles = useCallback(
    (tiles: ZycieTile[]) => {
      setDraft((prev) => ({
        ...prev,
        years: {
          ...prev.years,
          [selectedYear]: { ...prev.years[selectedYear], tiles },
        },
      }));
    },
    [selectedYear],
  );

  const addTile = () => {
    const newTile: ZycieTile = {
      id: generateId(),
      title: "",
      content: "",
      image: "",
      youtubeUrl: "",
      audioUrl: "",
    };
    updateTiles([...yearData.tiles, newTile]);
  };

  const updateTile = (index: number, tile: ZycieTile) => {
    const updated = yearData.tiles.map((t, i) => (i === index ? tile : t));
    updateTiles(updated);
  };

  const deleteTile = (index: number) => {
    updateTiles(yearData.tiles.filter((_, i) => i !== index));
  };

  const addYear = () => {
    const y = newYear.trim();
    if (!y || draft.years[y]) {
      toast.error("Rok już istnieje lub jest pusty");
      return;
    }
    setDraft((prev) => ({
      ...prev,
      years: {
        ...prev.years,
        [y]: { heroImage: "", heroDescription: "", tiles: [] },
      },
    }));
    setSelectedYear(y);
    setNewYear("");
  };

  const deleteYear = (y: string) => {
    if (Object.keys(draft.years).length <= 1) {
      toast.error("Musi pozostać przynajmniej jeden rok");
      return;
    }
    setDraft((prev) => {
      const updated = { ...prev.years };
      delete updated[y];
      return { ...prev, years: updated };
    });
    const remaining = Object.keys(draft.years).filter((k) => k !== y);
    setSelectedYear(remaining[0] ?? "2026");
  };

  const save = async () => {
    setSaving(true);
    try {
      await saveData(draft);
      toast.success(`Zapisano rok ${selectedYear}`);
    } catch {
      toast.error("Błąd zapisu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Year management */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-semibold text-foreground">
          Wybór roku
        </h3>
        <div className="flex flex-wrap gap-2">
          {availableYears.map((y) => (
            <div key={y} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectedYear(y)}
                data-ocid="zycie.year.tab"
                className={`px-4 py-1.5 rounded-full text-sm font-sans font-medium border transition-all ${
                  selectedYear === y
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {y}
              </button>
              <button
                type="button"
                onClick={() => deleteYear(y)}
                className="p-1 rounded-full hover:bg-destructive/10 text-muted-foreground/50 hover:text-destructive transition-colors"
                data-ocid="zycie.year.delete_button"
                title={`Usuń rok ${y}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 items-center max-w-xs">
          <Input
            value={newYear}
            onChange={(e) => setNewYear(e.target.value)}
            placeholder="np. 2027"
            maxLength={4}
            data-ocid="zycie.year.input"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={addYear}
            data-ocid="zycie.year.add_button"
          >
            <Plus className="w-4 h-4 mr-1" />
            Dodaj rok
          </Button>
        </div>
      </div>

      <Separator />

      {/* Central year image */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-semibold text-foreground">
          Centralny obraz roku {selectedYear}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
          <ImageField
            value={yearData.heroImage}
            onChange={(url) => updateYearField({ heroImage: url })}
            label={`Centralny obraz roku ${selectedYear}`}
            aspectRatio="4/3"
          />
          <div className="space-y-2">
            <Label>Opis pod zdjęciem</Label>
            <Textarea
              rows={3}
              value={yearData.heroDescription}
              onChange={(e) =>
                updateYearField({ heroDescription: e.target.value })
              }
              placeholder="Rok wspólnoty i nadziei…"
              data-ocid="zycie.year.hero_description.input"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Tiles */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-foreground">
            Kafelki ({yearData.tiles.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={addTile}
            data-ocid="zycie.tile.add_button"
          >
            <Plus className="w-4 h-4 mr-1" />
            Dodaj kafelek
          </Button>
        </div>

        {yearData.tiles.length === 0 ? (
          <div
            className="text-center py-10 border border-dashed border-border/50 rounded-xl text-muted-foreground text-sm font-sans"
            data-ocid="zycie.tiles.empty_state"
          >
            Brak kafelków. Kliknij &quot;Dodaj kafelek&quot; żeby dodać
            pierwszy.
          </div>
        ) : (
          <div className="space-y-4">
            {yearData.tiles.map((tile, i) => (
              <TileEditor
                key={tile.id}
                tile={tile}
                index={i}
                onChange={(updated) => updateTile(i, updated)}
                onDelete={() => deleteTile(i)}
              />
            ))}
          </div>
        )}
      </div>

      <Button onClick={save} disabled={saving} data-ocid="zycie.save_button">
        {saving ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        Zapisz rok {selectedYear}
      </Button>
    </div>
  );
}

// ============================================================
// MAIN EXPORT
// ============================================================

export function AdminZycieTab() {
  const { data, saveData } = useZycieData();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight">
          Życie parafii
        </h2>
        <p className="text-sm text-muted-foreground font-sans">
          Zarządzaj kroniką życia parafii rok po roku
        </p>
      </div>

      <Tabs defaultValue="lata" className="space-y-6">
        <TabsList className="bg-muted/40 p-1 rounded-xl">
          <TabsTrigger
            value="hero"
            className="rounded-lg text-sm font-sans font-light"
            data-ocid="zycie.admin.hero.tab"
          >
            Treści hero
          </TabsTrigger>
          <TabsTrigger
            value="lata"
            className="rounded-lg text-sm font-sans font-light"
            data-ocid="zycie.admin.years.tab"
          >
            Lata i kafelki
          </TabsTrigger>
        </TabsList>
        <TabsContent value="hero">
          <HeroTextsSubTab data={data} saveData={saveData} />
        </TabsContent>
        <TabsContent value="lata">
          <YearsTilesSubTab data={data} saveData={saveData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
