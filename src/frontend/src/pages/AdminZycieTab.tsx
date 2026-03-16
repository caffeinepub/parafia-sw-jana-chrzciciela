import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Check, Edit2, Plus, Trash2, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import {
  CATEGORY_META,
  type ZycieCategory,
  type ZycieData,
  type ZycieEntry,
} from "./ZyciePage";

const CATEGORIES = Object.keys(CATEGORY_META) as ZycieCategory[];

function loadZycie(): ZycieData {
  try {
    const raw = localStorage.getItem("zycieData");
    if (raw) return JSON.parse(raw) as ZycieData;
  } catch {
    /* */
  }
  return {
    heroTitle: "Życie parafii",
    heroSubtitle: "Wzrastamy razem w wierze",
    heroDesc: "Parafia to nie tylko miejsce. To wspólnota życia.",
    entries: [],
  };
}

function saveZycie(d: ZycieData) {
  localStorage.setItem("zycieData", JSON.stringify(d));
  window.dispatchEvent(new Event("storage"));
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─── Entry Form ───────────────────────────────────────────────────────────────

interface EntryFormProps {
  category: ZycieCategory;
  initial?: Partial<ZycieEntry>;
  onSave: (e: Omit<ZycieEntry, "id">) => void;
  onCancel: () => void;
}

function EntryForm({ category, initial, onSave, onCancel }: EntryFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [date, setDate] = useState(initial?.date ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [year, setYear] = useState(
    String(initial?.year ?? new Date().getFullYear()),
  );

  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs font-sans text-white/50 mb-1">
          Imię / Tytuł *
        </div>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={
            category === "wydarzenia" ? "Tytuł wydarzenia" : "Imię i nazwisko"
          }
          className="bg-white/5 border-white/10 text-white"
          data-ocid="zycie.entry.input"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs font-sans text-white/50 mb-1">Data</div>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-white/5 border-white/10 text-white"
            data-ocid="zycie.entry.date.input"
          />
        </div>
        <div>
          <div className="text-xs font-sans text-white/50 mb-1">Rok</div>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger
              className="bg-white/5 border-white/10 text-white"
              data-ocid="zycie.entry.year.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026, 2027].map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <div className="text-xs font-sans text-white/50 mb-1">
          Notatki (opcjonalne)
        </div>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={
            category === "bierzmowanie"
              ? 'Hasło np. "Miłość"'
              : "Dodatkowe informacje"
          }
          className="bg-white/5 border-white/10 text-white resize-none"
          rows={2}
          data-ocid="zycie.entry.notes.textarea"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-white/40"
          data-ocid="zycie.entry.cancel_button"
        >
          <X className="w-3 h-3 mr-1" /> Anuluj
        </Button>
        <Button
          size="sm"
          onClick={() =>
            onSave({
              category,
              name: name.trim(),
              date,
              year: Number(year),
              notes: notes.trim() || undefined,
            })
          }
          disabled={!name.trim()}
          className="bg-amber-500/90 hover:bg-amber-500 text-black"
          data-ocid="zycie.entry.save_button"
        >
          <Check className="w-3 h-3 mr-1" /> Zapisz
        </Button>
      </div>
    </div>
  );
}

// ─── Category Panel ───────────────────────────────────────────────────────────

function CategoryPanel({
  category,
  data,
  onUpdate,
}: {
  category: ZycieCategory;
  data: ZycieData;
  onUpdate: (d: ZycieData) => void;
}) {
  const meta = CATEGORY_META[category];
  const [filterYear, setFilterYear] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = data.entries.filter((e) => e.category === category);
    if (filterYear !== "all")
      list = list.filter((e) => e.year === Number(filterYear));
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [data.entries, category, filterYear]);

  const handleAdd = (entry: Omit<ZycieEntry, "id">) => {
    const next: ZycieData = {
      ...data,
      entries: [...data.entries, { ...entry, id: uid() }],
    };
    onUpdate(next);
    setAddOpen(false);
  };

  const handleEdit = (id: string, entry: Omit<ZycieEntry, "id">) => {
    const next: ZycieData = {
      ...data,
      entries: data.entries.map((e) => (e.id === id ? { ...entry, id } : e)),
    };
    onUpdate(next);
    setEditId(null);
  };

  const handleDelete = (id: string) => {
    const next: ZycieData = {
      ...data,
      entries: data.entries.filter((e) => e.id !== id),
    };
    onUpdate(next);
  };

  const fmt = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return d;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: meta.color }}
          />
          <span
            className="font-sans text-sm font-medium"
            style={{ color: meta.color }}
          >
            {meta.label}
          </span>
          <Badge variant="secondary" className="text-xs">
            {filtered.length} wpisów
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger
              className="h-8 w-28 text-xs bg-white/5 border-white/10"
              data-ocid="zycie.year-filter.select"
            >
              <SelectValue placeholder="Rok" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              {[2024, 2025, 2026, 2027].map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-amber-500/90 hover:bg-amber-500 text-black h-8"
                data-ocid="zycie.add.open_modal_button"
              >
                <Plus className="w-3 h-3 mr-1" /> Dodaj
              </Button>
            </DialogTrigger>
            <DialogContent
              className="bg-card border-white/10"
              data-ocid="zycie.add.dialog"
            >
              <DialogHeader>
                <DialogTitle
                  className="font-display"
                  style={{ color: meta.color }}
                >
                  Dodaj wpis – {meta.label}
                </DialogTitle>
              </DialogHeader>
              <EntryForm
                category={category}
                onSave={handleAdd}
                onCancel={() => setAddOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          className="text-center py-8 text-muted-foreground text-sm"
          data-ocid="zycie.entries.empty_state"
        >
          Brak wpisów. Kliknij "Dodaj" aby dodać pierwszy.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry, idx) => (
            <div key={entry.id} data-ocid={`zycie.entry.row.${idx + 1}`}>
              {editId === entry.id ? (
                <div className="rounded-lg p-4 bg-white/5 border border-white/10">
                  <EntryForm
                    category={category}
                    initial={entry}
                    onSave={(e) => handleEdit(entry.id, e)}
                    onCancel={() => setEditId(null)}
                  />
                </div>
              ) : (
                <div
                  className="flex items-center justify-between rounded-lg px-4 py-3 group"
                  style={{
                    background: `${meta.color}0d`,
                    borderLeft: `3px solid ${meta.color}44`,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-sans text-sm font-medium text-foreground truncate block">
                      {entry.name}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-sans text-xs text-muted-foreground">
                        {fmt(entry.date)}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-xs px-1.5 py-0"
                        style={{
                          borderColor: `${meta.color}44`,
                          color: meta.color,
                        }}
                      >
                        {entry.year}
                      </Badge>
                      {entry.notes && (
                        <span className="font-sans text-xs text-muted-foreground truncate">
                          {entry.notes}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => setEditId(entry.id)}
                      data-ocid={`zycie.entry.edit_button.${idx + 1}`}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(entry.id)}
                      data-ocid={`zycie.entry.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Config Tab ───────────────────────────────────────────────────────────────

function ConfigPanel({
  data,
  onUpdate,
}: { data: ZycieData; onUpdate: (d: ZycieData) => void }) {
  const [title, setTitle] = useState(data.heroTitle);
  const [subtitle, setSubtitle] = useState(data.heroSubtitle);
  const [desc, setDesc] = useState(data.heroDesc);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdate({
      ...data,
      heroTitle: title,
      heroSubtitle: subtitle,
      heroDesc: desc,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-lg">
      <div>
        <div className="text-xs font-sans text-muted-foreground mb-1">
          Tytuł hero
        </div>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-white/5 border-white/10"
          data-ocid="zycie.hero.title.input"
        />
      </div>
      <div>
        <div className="text-xs font-sans text-muted-foreground mb-1">
          Podtytuł
        </div>
        <Input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="bg-white/5 border-white/10"
          data-ocid="zycie.hero.subtitle.input"
        />
      </div>
      <div>
        <div className="text-xs font-sans text-muted-foreground mb-1">Opis</div>
        <Textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={3}
          className="bg-white/5 border-white/10 resize-none"
          data-ocid="zycie.hero.desc.textarea"
        />
      </div>
      <Button
        onClick={handleSave}
        className="bg-amber-500/90 hover:bg-amber-500 text-black"
        data-ocid="zycie.config.save_button"
      >
        {saved ? (
          <>
            <Check className="w-4 h-4 mr-2" /> Zapisano
          </>
        ) : (
          "Zapisz teksty hero"
        )}
      </Button>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function AdminZycieTab() {
  const [data, setData] = useState<ZycieData>(loadZycie);

  useEffect(() => {
    const onStorage = () => setData(loadZycie());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleUpdate = (next: ZycieData) => {
    saveZycie(next);
    setData(next);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold text-foreground">
          Zakładka Życie
        </h2>
        <p className="text-sm text-muted-foreground font-sans mt-1">
          Zarządzaj wpisami rozety życia parafii i tekstami hero.
        </p>
      </div>

      <Tabs defaultValue="chrzty">
        <TabsList className="flex flex-wrap gap-1 h-auto bg-white/5 p-1 rounded-xl">
          {CATEGORIES.map((cat) => (
            <TabsTrigger
              key={cat}
              value={cat}
              className="font-sans text-xs data-[state=active]:bg-card rounded-lg"
              data-ocid={`zycie.${cat}.tab`}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-1.5"
                style={{ background: CATEGORY_META[cat].color }}
              />
              {CATEGORY_META[cat].label}
            </TabsTrigger>
          ))}
          <TabsTrigger
            value="konfiguracja"
            className="font-sans text-xs data-[state=active]:bg-card rounded-lg"
            data-ocid="zycie.konfiguracja.tab"
          >
            Konfiguracja
          </TabsTrigger>
        </TabsList>

        {CATEGORIES.map((cat) => (
          <TabsContent key={cat} value={cat} className="mt-4">
            <CategoryPanel category={cat} data={data} onUpdate={handleUpdate} />
          </TabsContent>
        ))}
        <TabsContent value="konfiguracja" className="mt-4">
          <ConfigPanel data={data} onUpdate={handleUpdate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
