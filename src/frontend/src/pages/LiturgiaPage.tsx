import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Eraser,
  Pencil,
  Plus,
  Printer,
  Save,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

import type { LiturgyDay, LiturgyEntry, LiturgyWeek } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  adjacentWeekId,
  ensureAllDays,
  formatDate,
  getWeekDates,
  useLiturgy,
} from "../hooks/useLiturgy";
import {
  type MinisterRegistration,
  getRegistrations,
  parseMinistersFromDescription,
  saveRegistrations,
  serializeMinistersToDescription,
} from "../hooks/useMinisterRegistrations";

// ============================================================
// CONSTANTS
// ============================================================

const DAY_NAMES = [
  "Poniedziałek",
  "Wtorek",
  "Środa",
  "Czwartek",
  "Piątek",
  "Sobota",
  "Niedziela",
];

const MONTH_NAMES_SHORT = [
  "sty",
  "lut",
  "mar",
  "kwi",
  "maj",
  "cze",
  "lip",
  "sie",
  "wrz",
  "paź",
  "lis",
  "gru",
];

const SERVICE_TYPES = [
  { value: "adoracja", label: "Adoracja Najświętszego Sakramentu" },
  { value: "rozaniec", label: "Różaniec" },
  { value: "droga_krzyzowa", label: "Droga Krzyżowa" },
  { value: "gorzkie_zale", label: "Gorzkie Żale" },
  { value: "majowe", label: "Nabożeństwo majowe" },
  { value: "czerwcowe", label: "Nabożeństwo czerwcowe" },
  { value: "inne", label: "Inne" },
];

function getServiceLabel(serviceType: string): string {
  const found = SERVICE_TYPES.find((s) => s.value === serviceType);
  return found ? found.label : serviceType;
}

// ============================================================
// ADD MASS DIALOG
// ============================================================

interface AddMassDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (time: string, intention: string) => void;
}

function AddMassDialog({ open, onClose, onSave }: AddMassDialogProps) {
  const [time, setTime] = useState("08:00");
  const [intention, setIntention] = useState("");

  const handleSave = () => {
    if (!time.trim()) {
      toast.error("Podaj godzinę");
      return;
    }
    onSave(time.trim(), intention.trim());
    setTime("08:00");
    setIntention("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md" data-ocid="liturgia.mass.dialog">
        <DialogHeader>
          <DialogTitle className="font-display font-light text-xl">
            Dodaj Mszę Świętą
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="font-sans font-light text-sm">Godzina</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="font-sans text-lg font-light"
              data-ocid="liturgia.mass.time.input"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-sans font-light text-sm">
              Intencja Mszy
            </Label>
            <Textarea
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="Np. Za spokój duszy Jana Kowalskiego..."
              rows={3}
              className="font-sans font-light resize-none"
              data-ocid="liturgia.mass.intention.textarea"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleSave}
              className="font-sans font-light flex-1"
              data-ocid="liturgia.mass.submit_button"
            >
              <Save className="w-4 h-4 mr-2" />
              Zapisz
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="font-sans font-light"
              data-ocid="liturgia.mass.cancel_button"
            >
              Anuluj
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// ADD SERVICE DIALOG
// ============================================================

interface AddServiceDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (serviceType: string, time: string, description: string) => void;
}

function AddServiceDialog({ open, onClose, onSave }: AddServiceDialogProps) {
  const [serviceType, setServiceType] = useState("adoracja");
  const [customType, setCustomType] = useState("");
  const [time, setTime] = useState("18:00");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!time.trim()) {
      toast.error("Podaj godzinę");
      return;
    }
    const finalType = serviceType === "inne" ? customType.trim() : serviceType;
    if (serviceType === "inne" && !customType.trim()) {
      toast.error("Podaj nazwę nabożeństwa");
      return;
    }
    onSave(finalType, time.trim(), description.trim());
    setServiceType("adoracja");
    setCustomType("");
    setTime("18:00");
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md" data-ocid="liturgia.service.dialog">
        <DialogHeader>
          <DialogTitle className="font-display font-light text-xl">
            Dodaj Nabożeństwo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="font-sans font-light text-sm">
              Rodzaj nabożeństwa
            </Label>
            <Select value={serviceType} onValueChange={setServiceType}>
              <SelectTrigger
                className="font-sans font-light"
                data-ocid="liturgia.service.type.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_TYPES.map((s) => (
                  <SelectItem
                    key={s.value}
                    value={s.value}
                    className="font-sans font-light"
                  >
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {serviceType === "inne" && (
              <Input
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="Nazwa nabożeństwa..."
                className="font-sans font-light mt-2"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label className="font-sans font-light text-sm">Godzina</Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="font-sans text-lg font-light"
              data-ocid="liturgia.service.time.input"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-sans font-light text-sm">
              Opis (opcjonalnie)
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dodatkowy opis..."
              rows={2}
              className="font-sans font-light resize-none"
              data-ocid="liturgia.service.description.textarea"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleSave}
              className="font-sans font-light flex-1"
              data-ocid="liturgia.service.submit_button"
            >
              <Save className="w-4 h-4 mr-2" />
              Zapisz
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="font-sans font-light"
              data-ocid="liturgia.service.cancel_button"
            >
              Anuluj
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// SINGLE ENTRY ROW
// ============================================================

interface EntryRowProps {
  entry: LiturgyEntry;
  index: number;
  isAdmin: boolean;
  onDelete: () => void;
}

function EntryRow({ entry, index, isAdmin, onDelete }: EntryRowProps) {
  const isMass = entry.entryType === "msza";
  const typeLabel = isMass ? "Msza Święta" : getServiceLabel(entry.serviceType);
  const detail = isMass ? entry.intention : entry.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.25 }}
      className="flex items-start gap-5 py-4 group"
    >
      {/* Time column */}
      <div className="w-16 shrink-0 pt-0.5">
        <span className="font-sans text-sm lg:text-base font-semibold tracking-wider text-foreground/90 leading-none tabular-nums">
          {entry.time}
        </span>
      </div>

      {/* Content column */}
      <div className="flex-1 min-w-0">
        <p className="font-sans text-sm font-medium text-foreground/80 leading-snug">
          {typeLabel}
        </p>
        {detail && (
          <p className="font-sans text-base font-light text-muted-foreground leading-relaxed mt-1">
            {detail}
          </p>
        )}
        {isMass &&
          (() => {
            const ministers = parseMinistersFromDescription(entry.description);
            return (
              <>
                {ministers.lectors.length > 0 && (
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      LEKTOR
                    </span>
                    <span className="font-sans text-sm font-light text-muted-foreground/80">
                      {ministers.lectors.join(", ")}
                    </span>
                  </div>
                )}
                {ministers.psalmists.length > 0 && (
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                      PSALMISTA
                    </span>
                    <span className="font-sans text-sm font-light text-muted-foreground/80">
                      {ministers.psalmists.join(", ")}
                    </span>
                  </div>
                )}
              </>
            );
          })()}
      </div>

      {/* Admin delete */}
      {isAdmin && (
        <button
          type="button"
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0 mt-1 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          aria-label="Usuń wpis"
          data-ocid={`liturgia.entry.delete_button.${index + 1}`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </motion.div>
  );
}

// ============================================================
// DAY BLOCK
// ============================================================

interface DayBlockProps {
  day: LiturgyDay;
  dayIndex: number;
  date?: Date;
  isAdmin: boolean;
  onAddMass: () => void;
  onAddService: () => void;
  onDeleteEntry: (entryId: string) => void;
}

function DayBlock({
  day,
  dayIndex,
  date,
  isAdmin,
  onAddMass,
  onAddService,
  onDeleteEntry,
}: DayBlockProps) {
  const entries = [...day.entries].sort((a, b) => a.time.localeCompare(b.time));
  const isSunday = dayIndex === 6;

  return (
    <div
      className={`py-6 ${isSunday ? "rounded-lg px-4 -mx-4 bg-accent/30" : ""}`}
      data-ocid={`liturgia.day.item.${dayIndex + 1}`}
    >
      {/* Day header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-baseline gap-2.5">
          <h3 className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-foreground/70">
            {DAY_NAMES[dayIndex]}
          </h3>
          {date && (
            <span className="font-sans text-xs font-light text-muted-foreground/60">
              {date.getDate()} {MONTH_NAMES_SHORT[date.getMonth()]}
            </span>
          )}
        </div>

        {isAdmin && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddMass}
              className="font-sans font-light text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
              data-ocid="liturgia.add_mass.open_modal_button"
            >
              <Plus className="w-3 h-3 mr-1" />
              Msza
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddService}
              className="font-sans font-light text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
              data-ocid="liturgia.add_service.open_modal_button"
            >
              <Plus className="w-3 h-3 mr-1" />
              Nabożeństwo
            </Button>
          </div>
        )}
      </div>

      <Separator className="mb-0" />

      {/* Entries */}
      <AnimatePresence initial={false}>
        {entries.length === 0 ? (
          <p className="font-sans text-sm font-light text-muted-foreground/50 py-4 italic">
            (brak wpisów)
          </p>
        ) : (
          <div className="divide-y divide-border/40">
            {entries.map((entry, i) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                index={i}
                isAdmin={isAdmin}
                onDelete={() => onDeleteEntry(entry.id)}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// HERO SECTION
// ============================================================

interface HeroSectionProps {
  week: LiturgyWeek;
  isAdmin: boolean;
  onSave: (updated: LiturgyWeek) => Promise<void>;
  isSaving: boolean;
}

function HeroSection({ week, isAdmin, onSave, isSaving }: HeroSectionProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(week.heroTitle);
  const [subtitle, setSubtitle] = useState(week.heroSubtitle);
  const [description, setDescription] = useState(week.heroDescription);

  // Sync when week changes (e.g. week navigation)
  React.useEffect(() => {
    if (!editing) {
      setTitle(week.heroTitle);
      setSubtitle(week.heroSubtitle);
      setDescription(week.heroDescription);
    }
  }, [week, editing]);

  const handleSave = async () => {
    await onSave({
      ...week,
      heroTitle: title,
      heroSubtitle: subtitle,
      heroDescription: description,
    });
    setEditing(false);
    toast.success("Hero zaktualizowany");
  };

  const handleCancel = () => {
    setTitle(week.heroTitle);
    setSubtitle(week.heroSubtitle);
    setDescription(week.heroDescription);
    setEditing(false);
  };

  return (
    <section
      className="relative min-h-[40vh] flex flex-col items-center justify-center px-4 py-20 overflow-hidden"
      style={{
        background:
          "linear-gradient(165deg, oklch(var(--theme-hero-from)) 0%, oklch(var(--card)) 55%, oklch(var(--accent) / 0.35) 100%)",
      }}
      data-ocid="liturgia.hero.section"
    >
      {/* Soft radial light */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 30%, oklch(var(--theme-glow) / 0.10) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {editing ? (
          <div className="space-y-4 text-left w-full max-w-lg mx-auto">
            <div className="space-y-1">
              <Label className="font-sans text-xs text-muted-foreground">
                Nagłówek
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="font-display text-2xl font-light bg-card/60 backdrop-blur-sm border-border/60"
              />
            </div>
            <div className="space-y-1">
              <Label className="font-sans text-xs text-muted-foreground">
                Podtytuł
              </Label>
              <Textarea
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                rows={3}
                className="font-editorial font-light resize-none bg-card/60 backdrop-blur-sm border-border/60"
              />
            </div>
            <div className="space-y-1">
              <Label className="font-sans text-xs text-muted-foreground">
                Opis (opcjonalnie)
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="font-sans font-light resize-none bg-card/60 backdrop-blur-sm border-border/60"
                placeholder="Krótki opis..."
              />
            </div>
            <div className="flex gap-3 pt-1">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                className="font-sans font-light"
                data-ocid="liturgia.hero.save_button"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                {isSaving ? "Zapisywanie..." : "Zapisz"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="font-sans font-light"
                data-ocid="liturgia.hero.cancel_button"
              >
                Anuluj
              </Button>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-5"
          >
            <p className="font-sans text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Parafia św. Jana Chrzciciela
            </p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extralight text-foreground tracking-tight leading-none">
              {week.heroTitle || "Liturgia"}
            </h1>
            {week.heroSubtitle && (
              <p className="font-editorial text-lg sm:text-xl font-light text-foreground/70 leading-relaxed whitespace-pre-line max-w-md mx-auto">
                {week.heroSubtitle}
              </p>
            )}
            {week.heroDescription && (
              <p className="font-sans text-sm font-light text-muted-foreground leading-relaxed max-w-sm mx-auto">
                {week.heroDescription}
              </p>
            )}
          </motion.div>
        )}

        {/* Edit button */}
        {isAdmin && !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="mt-6 inline-flex items-center gap-1.5 font-sans text-xs text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="liturgia.hero.edit_button"
          >
            <Pencil className="w-3 h-3" />
            Edytuj tekst
          </button>
        )}
      </div>
    </section>
  );
}

// ============================================================
// SCHEDULE LOADING SKELETON
// ============================================================

function ScheduleSkeleton() {
  return (
    <div className="space-y-8 py-8" data-ocid="liturgia.schedule.loading_state">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-px w-full" />
          <div className="flex gap-4 py-4">
            <Skeleton className="h-8 w-16" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="flex gap-4 py-4">
            <Skeleton className="h-8 w-16" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// PDF EXPORT — browser print window
// ============================================================

function generatePDF(week: LiturgyWeek): void {
  const days = [...week.days].sort(
    (a, b) => Number(a.dayIndex) - Number(b.dayIndex),
  );

  const formatPDFDate = (dateStr: string) => {
    const d = new Date(`${dateStr}T00:00:00`);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}.${mm}.${d.getFullYear()}`;
  };

  const daysHtml = days
    .map((day) => {
      const entries = [...day.entries].sort((a, b) =>
        a.time.localeCompare(b.time),
      );
      if (entries.length === 0) return "";

      const entriesHtml = entries
        .map((entry) => {
          const isMass = entry.entryType === "msza";
          const typeLabel = isMass
            ? "Msza Święta"
            : getServiceLabel(entry.serviceType);
          const detail = isMass ? entry.intention : entry.description;
          const pdfMinisters = isMass
            ? parseMinistersFromDescription(entry.description)
            : { lectors: [], psalmists: [] };
          return `
          <div class="entry">
            <div class="entry-time">${entry.time}</div>
            <div class="entry-content">
              <div class="entry-type">${typeLabel}</div>
              ${detail ? `<div class="entry-detail">${detail}</div>` : ""}
              ${pdfMinisters.lectors.length > 0 ? `<div class="entry-ministers">Lektor: ${pdfMinisters.lectors.join(", ")}</div>` : ""}
              ${pdfMinisters.psalmists.length > 0 ? `<div class="entry-ministers">Psalmista: ${pdfMinisters.psalmists.join(", ")}</div>` : ""}
            </div>
          </div>`;
        })
        .join("");

      return `
      <div class="day-block">
        <div class="day-name">${DAY_NAMES[Number(day.dayIndex)].toUpperCase()}</div>
        <hr class="day-line" />
        <div class="entries">${entriesHtml}</div>
      </div>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <title>Intencje mszalne – ${week.id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'EB Garamond', Georgia, 'Times New Roman', serif;
      font-size: 11pt;
      color: #2a2520;
      background: #fff;
      line-height: 1.5;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 28mm 28mm 24mm;
      display: flex;
      flex-direction: column;
    }

    .header {
      text-align: center;
      margin-bottom: 18pt;
    }

    .parish-name {
      font-size: 9pt;
      letter-spacing: 0.22em;
      color: #8a7e72;
      text-transform: uppercase;
      margin-bottom: 8pt;
    }

    .header-rule {
      border: none;
      border-top: 0.4pt solid #c8bdb0;
      margin: 8pt 0;
    }

    .main-title {
      font-size: 24pt;
      font-weight: 600;
      letter-spacing: 0.05em;
      color: #2a2520;
      text-transform: uppercase;
      margin-bottom: 6pt;
    }

    .week-range {
      font-size: 10pt;
      font-style: italic;
      color: #8a7e72;
      margin-bottom: 4pt;
    }

    .title-rule {
      border: none;
      border-top: 0.7pt solid #b5a898;
      margin: 12pt 0 16pt;
    }

    .day-block {
      margin-bottom: 20pt;
      page-break-inside: avoid;
    }

    .day-name {
      font-size: 9pt;
      font-weight: 600;
      letter-spacing: 0.18em;
      color: #6b5e52;
      margin-bottom: 4pt;
    }

    .day-line {
      border: none;
      border-top: 0.3pt solid #d0c5ba;
      margin-bottom: 8pt;
    }

    .entry {
      display: flex;
      align-items: flex-start;
      gap: 14pt;
      margin-bottom: 10pt;
    }

    .entry-time {
      font-size: 14pt;
      font-weight: 600;
      color: #2a2520;
      min-width: 38pt;
      line-height: 1.2;
      font-variant-numeric: tabular-nums;
    }

    .entry-content {
      flex: 1;
    }

    .entry-type {
      font-size: 10pt;
      color: #4a413a;
      margin-bottom: 2pt;
    }

    .entry-ministers {
      font-size: 9pt;
      color: #7a6f65;
      font-style: italic;
      margin-top: 2pt;
    }

    .entry-detail {
      font-size: 9.5pt;
      font-style: italic;
      color: #7a6f65;
      line-height: 1.4;
    }

    .footer-content {
      margin-top: auto;
      padding-top: 14pt;
      border-top: 0.3pt solid #c8bdb0;
      text-align: center;
      font-size: 9pt;
      font-style: italic;
      color: #9a8f85;
    }

    @media print {
      body { background: white; }
      .page { padding: 28mm 28mm 24mm; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <p class="parish-name">Parafia św. Jana Chrzciciela</p>
      <hr class="header-rule" />
      <h1 class="main-title">Intencje mszalne</h1>
      <p class="week-range">Tydzień od ${formatPDFDate(week.weekStart)} do ${formatPDFDate(week.weekEnd)}</p>
      <hr class="title-rule" />
    </div>

    <div class="days">
      ${daysHtml}
    </div>

    <div class="footer-content">
      „Czyńcie to na moją pamiątkę." (Łk 22,19)
    </div>
  </div>
</body>
</html>`;

  const printWindow = window.open("", "_blank", "width=800,height=1000");
  if (!printWindow) {
    toast.error(
      "Nie można otworzyć okna drukowania. Sprawdź ustawienia przeglądarki.",
    );
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  // Slight delay to let fonts load
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
  }, 600);
}

// ============================================================
// MINISTER REGISTRATION FORM
// ============================================================

interface MinisterRegistrationFormProps {
  week: import("../backend").LiturgyWeek | null;
  weekId: string;
}

function MinisterRegistrationForm({
  week,
  weekId,
}: MinisterRegistrationFormProps) {
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState<"lektor" | "psalmista">("lektor");
  const [entryId, setEntryId] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  // Collect all mass entries from current week
  const massOptions = React.useMemo(() => {
    if (!week) return [];
    const opts: {
      id: string;
      label: string;
      dayIndex: number;
      time: string;
      date: string;
    }[] = [];
    const { start } = getWeekDates(weekId);
    const allDays = ensureAllDays(week).days.sort(
      (a, b) => Number(a.dayIndex) - Number(b.dayIndex),
    );
    for (const day of allDays) {
      const dayIdx = Number(day.dayIndex);
      const dayDate = new Date(start.getTime() + dayIdx * 86400000);
      const dayName = DAY_NAMES[dayIdx];
      const dd = String(dayDate.getDate()).padStart(2, "0");
      const mmm = MONTH_NAMES_SHORT[dayDate.getMonth()];
      const massEntries = day.entries
        .filter((e) => e.entryType === "msza")
        .sort((a, b) => a.time.localeCompare(b.time));
      for (const e of massEntries) {
        opts.push({
          id: e.id,
          label: `${dayName}, ${dd} ${mmm} – ${e.time}`,
          dayIndex: dayIdx,
          time: e.time,
          date: `${dayName}, ${dd} ${mmm}`,
        });
      }
    }
    return opts;
  }, [week, weekId]);

  // Check if already submitted for this entry+role
  const isAlreadySubmitted = React.useMemo(() => {
    if (!entryId) return false;
    const regs = getRegistrations();
    return regs.some(
      (r) =>
        r.entryId === entryId && r.role === role && r.status !== "rejected",
    );
  }, [entryId, role]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !entryId) return;
    if (isAlreadySubmitted) {
      toast.error("Już zgłoszono posługę na tę Mszę dla tej roli.");
      return;
    }

    setSubmitting(true);
    const selected = massOptions.find((o) => o.id === entryId);
    if (!selected) {
      setSubmitting(false);
      return;
    }

    const reg: MinisterRegistration = {
      id: crypto.randomUUID(),
      name: name.trim(),
      role,
      weekId,
      dayIndex: selected.dayIndex,
      entryId,
      massTime: selected.time,
      massDate: selected.date,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };

    const regs = getRegistrations();
    saveRegistrations([...regs, reg]);

    toast.success(
      "Zgłoszenie zostało przesłane. Czeka na zatwierdzenie przez administratora.",
    );
    setName("");
    setRole("lektor");
    setEntryId("");
    setSubmitting(false);
  };

  return (
    <section
      className="max-w-2xl mx-auto px-4 sm:px-6 pb-0 pt-12"
      data-ocid="liturgia.minister_form.section"
    >
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
        >
          <p className="font-sans text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
            Posługa
          </p>
          <h2 className="font-display text-3xl font-extralight text-foreground">
            Zgłoszenie posługi
          </h2>
          <p className="font-sans text-sm font-light text-muted-foreground mt-2 leading-relaxed">
            Lektorzy i Psalmiści — zgłoś swoją posługę na Mszę Świętą
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="bg-card/60 border border-border/50 rounded-2xl p-6 sm:p-8"
      >
        {massOptions.length === 0 ? (
          <p className="font-sans text-sm font-light text-muted-foreground text-center py-4">
            Brak zaplanowanych Mszy Świętych w bieżącym tygodniu.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="minister-name"
                className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Imię i nazwisko
              </Label>
              <Input
                id="minister-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jan Kowalski"
                required
                className="font-sans font-light"
                data-ocid="liturgia.minister_form.input"
              />
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Posługa
              </Label>
              <div className="flex gap-4">
                {(["lektor", "psalmista"] as const).map((r) => (
                  <label
                    key={r}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="minister-role"
                      value={r}
                      checked={role === r}
                      onChange={() => setRole(r)}
                      className="w-4 h-4 accent-primary"
                      data-ocid="liturgia.minister_form.radio"
                    />
                    <span
                      className={`font-sans text-sm font-light transition-colors capitalize ${r === "lektor" ? "text-blue-700 dark:text-blue-400 group-hover:text-blue-800 dark:group-hover:text-blue-300" : "text-green-700 dark:text-green-400 group-hover:text-green-800 dark:group-hover:text-green-300"}`}
                    >
                      {r === "lektor" ? "Lektor" : "Psalmista"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Mass selection */}
            <div className="space-y-1.5">
              <Label
                htmlFor="minister-mass"
                className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                Msza Święta
              </Label>
              <Select value={entryId} onValueChange={setEntryId}>
                <SelectTrigger
                  id="minister-mass"
                  className="font-sans font-light"
                  data-ocid="liturgia.minister_form.select"
                >
                  <SelectValue placeholder="Wybierz Mszę Świętą…" />
                </SelectTrigger>
                <SelectContent>
                  {massOptions.map((opt) => (
                    <SelectItem
                      key={opt.id}
                      value={opt.id}
                      className="font-sans font-light"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isAlreadySubmitted && (
              <p className="font-sans text-xs text-amber-600 dark:text-amber-400">
                Posługa na tę Mszę w tej roli została już zgłoszona.
              </p>
            )}

            <Button
              type="submit"
              disabled={
                submitting || !name.trim() || !entryId || isAlreadySubmitted
              }
              className="font-sans font-light w-full sm:w-auto rounded-full px-8"
              data-ocid="liturgia.minister_form.submit_button"
            >
              Zgłoś posługę
            </Button>
          </form>
        )}
      </motion.div>

      <Separator className="mt-12" />
    </section>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export function LiturgiaPage() {
  const { identity } = useInternetIdentity();
  const isAdmin = !!identity;

  const {
    week,
    weekId,
    isLoading,
    isSaving,
    loadWeek,
    saveWeek,
    copyFromPreviousWeek,
    clearWeek,
  } = useLiturgy();

  // Dialog state: which day + type
  const [massDialog, setMassDialog] = useState<number | null>(null);
  const [serviceDialog, setServiceDialog] = useState<number | null>(null);

  // ---------- Helpers ----------

  const withSave = async (updater: (w: LiturgyWeek) => LiturgyWeek) => {
    if (!week) return;
    const updated = updater(week);
    try {
      await saveWeek(updated);
      toast.success("Zapisano");
    } catch {
      toast.error("Błąd zapisu");
    }
  };

  const handleAddMass = async (
    dayIdx: number,
    time: string,
    intention: string,
  ) => {
    await withSave((w) => {
      const days = w.days.map((d) => {
        if (Number(d.dayIndex) !== dayIdx) return d;
        const newEntry: LiturgyEntry = {
          id: crypto.randomUUID(),
          entryType: "msza",
          time,
          intention,
          serviceType: "",
          description: "",
          order: BigInt(Date.now()),
        };
        return { ...d, entries: [...d.entries, newEntry] };
      });
      return { ...w, days };
    });
  };

  const handleAddService = async (
    dayIdx: number,
    serviceType: string,
    time: string,
    description: string,
  ) => {
    await withSave((w) => {
      const days = w.days.map((d) => {
        if (Number(d.dayIndex) !== dayIdx) return d;
        const newEntry: LiturgyEntry = {
          id: crypto.randomUUID(),
          entryType: "nabozenstwo",
          time,
          intention: "",
          serviceType,
          description,
          order: BigInt(Date.now()),
        };
        return { ...d, entries: [...d.entries, newEntry] };
      });
      return { ...w, days };
    });
  };

  const handleDeleteEntry = async (dayIdx: number, entryId: string) => {
    await withSave((w) => {
      const days = w.days.map((d) => {
        if (Number(d.dayIndex) !== dayIdx) return d;
        return { ...d, entries: d.entries.filter((e) => e.id !== entryId) };
      });
      return { ...w, days };
    });
  };

  const handlePrevWeek = () => {
    const prevId = adjacentWeekId(weekId, -1);
    loadWeek(prevId);
  };

  const handleNextWeek = () => {
    const nextId = adjacentWeekId(weekId, 1);
    loadWeek(nextId);
  };

  const handleCopyPrev = async () => {
    try {
      await copyFromPreviousWeek();
      toast.success("Skopiowano poprzedni tydzień (bez intencji)");
    } catch {
      toast.error("Błąd kopiowania");
    }
  };

  const handleClearWeek = async () => {
    try {
      await clearWeek();
      toast.success("Tydzień wyczyszczony");
    } catch {
      toast.error("Błąd czyszczenia");
    }
  };

  const handlePDF = () => {
    if (!week) return;
    try {
      generatePDF(week);
    } catch {
      toast.error("Błąd generowania PDF");
    }
  };

  // ---------- Week dates ----------

  const { start: weekStart, end: weekEnd } = getWeekDates(weekId);

  // ---------- Sorted days ----------
  const sortedDays = week
    ? ensureAllDays(week).days.sort(
        (a, b) => Number(a.dayIndex) - Number(b.dayIndex),
      )
    : [];

  return (
    <main className="min-h-screen bg-background pt-nav">
      {/* ---- HERO ---- */}
      {isLoading || !week ? (
        <div
          className="relative min-h-[40vh] flex flex-col items-center justify-center"
          style={{
            background:
              "linear-gradient(165deg, oklch(var(--theme-hero-from)) 0%, oklch(var(--card)) 55%, oklch(var(--accent) / 0.35) 100%)",
          }}
        >
          <div className="space-y-4 text-center">
            <Skeleton className="h-3 w-40 mx-auto" />
            <Skeleton className="h-14 w-56 mx-auto" />
            <Skeleton className="h-5 w-72 mx-auto" />
          </div>
        </div>
      ) : (
        <HeroSection
          week={week}
          isAdmin={isAdmin}
          onSave={saveWeek}
          isSaving={isSaving}
        />
      )}

      {/* ---- MINISTER FORM ---- */}
      {!isLoading && week && (
        <MinisterRegistrationForm week={week} weekId={weekId} />
      )}

      {/* ---- SCHEDULE ---- */}
      <section
        className="max-w-2xl mx-auto px-4 sm:px-6 py-12"
        data-ocid="liturgia.schedule.section"
      >
        {/* Section header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <p className="font-sans text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">
              Grafik
            </p>
            <h2 className="font-display text-3xl font-extralight text-foreground">
              Intencje mszalne
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            {/* Week navigation */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrevWeek}
                disabled={isLoading}
                className="w-9 h-9 rounded-full flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-all disabled:opacity-40"
                aria-label="Poprzedni tydzień"
                data-ocid="liturgia.prev_week.button"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <p className="font-sans text-sm font-medium text-foreground/80 whitespace-nowrap tracking-wide">
                {formatDate(weekStart)} – {formatDate(weekEnd)}
              </p>

              <button
                type="button"
                onClick={handleNextWeek}
                disabled={isLoading}
                className="w-9 h-9 rounded-full flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-all disabled:opacity-40"
                aria-label="Następny tydzień"
                data-ocid="liturgia.next_week.button"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Admin week controls */}
            {isAdmin && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyPrev}
                  disabled={isSaving}
                  className="font-sans font-light text-xs h-8"
                  data-ocid="liturgia.copy_week.button"
                >
                  <Copy className="w-3 h-3 mr-1.5" />
                  Kopiuj poprzedni
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearWeek}
                  disabled={isSaving}
                  className="font-sans font-light text-xs h-8 text-destructive hover:text-destructive hover:border-destructive/30"
                  data-ocid="liturgia.clear_week.button"
                >
                  <Eraser className="w-3 h-3 mr-1.5" />
                  Wyczyść
                </Button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Loading */}
        {isLoading && <ScheduleSkeleton />}

        {/* Days */}
        {!isLoading && week && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="space-y-0 divide-y divide-border/30"
          >
            {sortedDays.map((day) => {
              const dayIdx = Number(day.dayIndex);
              // Compute the calendar date for this day:
              // weekStart is Monday (dayIndex 0), so add dayIdx days
              const dayDate = new Date(weekStart.getTime() + dayIdx * 86400000);
              return (
                <DayBlock
                  key={dayIdx}
                  day={day}
                  dayIndex={dayIdx}
                  date={dayDate}
                  isAdmin={isAdmin}
                  onAddMass={() => setMassDialog(dayIdx)}
                  onAddService={() => setServiceDialog(dayIdx)}
                  onDeleteEntry={(entryId) =>
                    handleDeleteEntry(dayIdx, entryId)
                  }
                />
              );
            })}
          </motion.div>
        )}

        {/* PDF button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12 flex justify-center"
        >
          <Button
            variant="outline"
            onClick={handlePDF}
            disabled={!week}
            className="font-sans font-light gap-2 rounded-full px-6"
            data-ocid="liturgia.print_pdf.button"
          >
            <Printer className="w-4 h-4" />
            Drukuj grafik tygodnia (PDF)
          </Button>
        </motion.div>
      </section>

      {/* ---- DIALOGS ---- */}
      <AddMassDialog
        open={massDialog !== null}
        onClose={() => setMassDialog(null)}
        onSave={(time, intention) => {
          if (massDialog !== null) {
            handleAddMass(massDialog, time, intention);
            setMassDialog(null);
          }
        }}
      />

      <AddServiceDialog
        open={serviceDialog !== null}
        onClose={() => setServiceDialog(null)}
        onSave={(serviceType, time, description) => {
          if (serviceDialog !== null) {
            handleAddService(serviceDialog, serviceType, time, description);
            setServiceDialog(null);
          }
        }}
      />
    </main>
  );
}
