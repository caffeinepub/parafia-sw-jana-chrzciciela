import React, { useState, useRef, useEffect } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  EyeOff,
  GripVertical,
  Image as ImageIcon,
  Lock,
  Pencil,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  AppUserRole,
  ExternalBlob,
  type GalleryAlbum,
  type GalleryPhoto,
  type HomeSection,
  type NewsArticle,
  type SiteSettings,
} from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  ensureAllDays,
  getWeekDates,
  getWeekId,
  useLiturgy,
} from "../hooks/useLiturgy";
import {
  type MinisterRegistration,
  getRegistrations,
  parseMinistersFromDescription,
  saveRegistrations,
  serializeMinistersToDescription,
} from "../hooks/useMinisterRegistrations";
import {
  useAddPhoto,
  useAllContentBlocks,
  useAllNews,
  useAssignRole,
  useCreateAlbum,
  useCreateNews,
  useDeleteAlbum,
  useDeleteNews,
  useGalleryAlbums,
  useGetCallerUserProfile,
  useHomeSections,
  useListAllRoles,
  useRemovePhoto,
  useSiteSettings,
  useUpdateAlbum,
  useUpdateContentBlock,
  useUpdateHomeSections,
  useUpdateNews,
  useUpdateSiteSettings,
} from "../hooks/useQueries";
import { KancelariaTab } from "./AdminKancelariaTab";
import { ModlitwaTab } from "./AdminModlitwaTab";
import { WspolnotyTab } from "./AdminWspolnotyTab";
import { AdminZycieTab } from "./AdminZycieTab";

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
// IMAGE UPLOAD HELPER
// ============================================================

function ImageUpload({
  label,
  current,
  onUpload,
  className,
}: {
  label: string;
  current?: ExternalBlob | null;
  onUpload: (blob: ExternalBlob) => void;
  className?: string;
}) {
  const [progress, setProgress] = useState<number | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  const url = current?.getDirectURL();
  const hasImage = url && url !== "";

  const handleFile = async (file: File) => {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((p) => {
      setProgress(p);
    });
    onUpload(blob);
    setProgress(null);
    toast.success("Zdjęcie dodane. Zapisz formularz, aby przesłać.");
  };

  return (
    <div className={`space-y-2 ${className || ""}`}>
      <Label className="font-sans text-sm font-light">{label}</Label>
      <div
        className="relative rounded-lg border-2 border-dashed border-border hover:border-primary/40 transition-colors overflow-hidden aspect-video"
        data-ocid="admin.image.dropzone"
        onClick={() => ref.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") ref.current?.click();
        }}
      >
        {hasImage ? (
          <img src={url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="img-placeholder w-full h-full flex flex-col items-center justify-center gap-2">
            <ImageIcon className="w-8 h-8 opacity-30" />
            <span className="font-sans text-xs text-muted-foreground">
              Kliknij, aby dodać zdjęcie
            </span>
          </div>
        )}
        {progress !== null && (
          <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
            <div className="text-background font-sans text-sm">
              {Math.round(progress)}%
            </div>
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
            data-ocid="admin.image.upload_button"
          >
            <Upload className="w-3.5 h-3.5" />
            {hasImage ? "Zmień" : "Dodaj"}
          </button>
        </div>
      </div>
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
// NEWS TAB
// ============================================================

function NewsTab() {
  const { data: news, isLoading, isError } = useAllNews();
  const create = useCreateNews();
  const update = useUpdateNews();
  const del = useDeleteNews();

  const empty: NewsArticle = {
    id: "",
    title: "",
    content: "",
    order: 0n,
    date: new Date().toISOString().split("T")[0],
    published: false,
    image: ExternalBlob.fromURL(""),
  };

  const [editing, setEditing] = useState<NewsArticle | null>(null);
  const [form, setForm] = useState<NewsArticle>(empty);

  const openNew = () => {
    setForm({ ...empty, id: crypto.randomUUID() });
    setEditing({ ...empty, id: "new" });
  };

  const openEdit = (article: NewsArticle) => {
    setForm(article);
    setEditing(article);
  };

  const handleSave = async () => {
    try {
      if (editing?.id === "new") {
        await create.mutateAsync(form);
        toast.success("Artykuł dodany");
      } else {
        await update.mutateAsync({ id: form.id, article: form });
        toast.success("Artykuł zaktualizowany");
      }
      setEditing(null);
    } catch {
      toast.error("Błąd zapisu");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await del.mutateAsync(id);
      toast.success("Artykuł usunięty");
    } catch {
      toast.error("Błąd usuwania");
    }
  };

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(null)}
            className="font-sans font-light"
          >
            ← Wróć
          </Button>
          <h2 className="font-display text-xl font-light text-foreground">
            {editing.id === "new" ? "Nowy artykuł" : "Edytuj artykuł"}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-sans font-light">Tytuł</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Tytuł artykułu"
                className="font-sans"
                data-ocid="admin.news.title.input"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-sans font-light">Treść</Label>
              <Textarea
                value={form.content}
                onChange={(e) =>
                  setForm((p) => ({ ...p, content: e.target.value }))
                }
                placeholder="Treść artykułu..."
                rows={8}
                className="font-sans resize-none"
                data-ocid="admin.news.content.textarea"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-sans font-light">Data</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                className="font-sans"
                data-ocid="admin.news.date.input"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.published}
                onCheckedChange={(v) =>
                  setForm((p) => ({ ...p, published: v }))
                }
                data-ocid="admin.news.published.switch"
              />
              <Label className="font-sans font-light">Opublikowany</Label>
            </div>
          </div>
          <ImageUpload
            label="Zdjęcie"
            current={form.image}
            onUpload={(blob) => setForm((p) => ({ ...p, image: blob }))}
          />
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={create.isPending || update.isPending}
            className="font-sans font-light"
            data-ocid="admin.news.save.submit_button"
          >
            <Save className="w-4 h-4 mr-2" />
            {create.isPending || update.isPending ? "Zapisywanie..." : "Zapisz"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setEditing(null)}
            className="font-sans font-light"
            data-ocid="admin.news.cancel.button"
          >
            Anuluj
          </Button>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-light text-foreground">
            Aktualności
          </h2>
        </div>
        <div
          className="text-center py-16 border border-dashed border-destructive/30 rounded-xl"
          data-ocid="admin.news.error_state"
        >
          <p className="font-sans text-sm text-muted-foreground">
            Wystąpił błąd podczas ładowania aktualności. Odśwież stronę i
            spróbuj ponownie.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-light text-foreground">
          Aktualności
        </h2>
        <Button
          onClick={openNew}
          size="sm"
          className="font-sans font-light"
          data-ocid="admin.news.add.primary_button"
        >
          <Plus className="w-4 h-4 mr-2" /> Nowy artykuł
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="admin.news.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !news || news.length === 0 ? (
        <div
          className="text-center py-16 border border-dashed border-border rounded-xl"
          data-ocid="admin.news.empty_state"
        >
          <p className="font-sans text-sm text-muted-foreground">
            Brak artykułów. Dodaj pierwszy.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {news.map((article, i) => (
            <div
              key={article.id}
              className="flex items-center gap-4 bg-card rounded-lg p-4 border border-border"
              data-ocid={`admin.news.item.${i + 1}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display text-sm font-light text-foreground truncate">
                    {article.title || "Bez tytułu"}
                  </span>
                  <Badge
                    variant={article.published ? "default" : "secondary"}
                    className="text-xs font-sans font-light"
                  >
                    {article.published ? "Opublikowany" : "Szkic"}
                  </Badge>
                </div>
                <p className="font-sans text-xs text-muted-foreground mt-0.5">
                  {article.date}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openEdit(article)}
                  data-ocid={`admin.news.edit.edit_button.${i + 1}`}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      data-ocid={`admin.news.delete.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent data-ocid="admin.news.delete.dialog">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-display font-light">
                        Usuń artykuł
                      </AlertDialogTitle>
                      <AlertDialogDescription className="font-sans">
                        Tej operacji nie można cofnąć. Artykuł zostanie trwale
                        usunięty.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        className="font-sans font-light"
                        data-ocid="admin.news.delete.cancel_button"
                      >
                        Anuluj
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(article.id)}
                        className="font-sans font-light bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        data-ocid="admin.news.delete.confirm_button"
                      >
                        Usuń
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// GALLERY TAB
// ============================================================

function GalleryTab() {
  const { data: albums, isLoading } = useGalleryAlbums();
  const createAlbum = useCreateAlbum();
  const updateAlbum = useUpdateAlbum();
  const deleteAlbum = useDeleteAlbum();
  const addPhoto = useAddPhoto();
  const removePhoto = useRemovePhoto();

  const [editing, setEditing] = useState<GalleryAlbum | null>(null);
  const [form, setForm] = useState<GalleryAlbum | null>(null);
  const [uploadingAlbumId, setUploadingAlbumId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const emptyAlbum: GalleryAlbum = {
    id: "",
    date: new Date().toISOString().split("T")[0],
    name: "",
    layout: "grid",
    description: "",
    coverImage: ExternalBlob.fromURL(""),
    photos: [],
  };

  const openNew = () => {
    const a = { ...emptyAlbum, id: crypto.randomUUID() };
    setForm(a);
    setEditing({ ...a, id: "new" });
  };

  const openEdit = (album: GalleryAlbum) => {
    setForm(album);
    setEditing(album);
  };

  const handleSave = async () => {
    if (!form) return;
    try {
      if (editing?.id === "new") {
        await createAlbum.mutateAsync(form);
        toast.success("Album utworzony");
      } else {
        await updateAlbum.mutateAsync({ id: form.id, album: form });
        toast.success("Album zaktualizowany");
      }
      setEditing(null);
    } catch {
      toast.error("Błąd zapisu");
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    try {
      await deleteAlbum.mutateAsync(id);
      toast.success("Album usunięty");
    } catch {
      toast.error("Błąd usuwania");
    }
  };

  const handleAddPhoto = async (albumId: string, file: File) => {
    setUploadingAlbumId(albumId);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes);
      const photo: GalleryPhoto = {
        id: crypto.randomUUID(),
        order: BigInt(Date.now()),
        blob,
        date: new Date().toISOString().split("T")[0],
        caption: "",
      };
      await addPhoto.mutateAsync({ albumId, photo });
      toast.success("Zdjęcie dodane");
    } catch {
      toast.error("Błąd dodawania zdjęcia");
    } finally {
      setUploadingAlbumId(null);
    }
  };

  const handleRemovePhoto = async (albumId: string, photoId: string) => {
    try {
      await removePhoto.mutateAsync({ albumId, photoId });
      toast.success("Zdjęcie usunięte");
    } catch {
      toast.error("Błąd usuwania zdjęcia");
    }
  };

  if (editing && form) {
    const album = albums?.find((a) => a.id === form.id) || form;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(null)}
            className="font-sans font-light"
          >
            ← Wróć
          </Button>
          <h2 className="font-display text-xl font-light">
            {editing.id === "new" ? "Nowy album" : "Edytuj album"}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-sans font-light">Nazwa albumu</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((p) => (p ? { ...p, name: e.target.value } : p))
                }
                placeholder="Nazwa albumu"
                className="font-sans"
                data-ocid="admin.album.name.input"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-sans font-light">Opis</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((p) =>
                    p ? { ...p, description: e.target.value } : p,
                  )
                }
                placeholder="Opis albumu..."
                rows={3}
                className="font-sans resize-none"
                data-ocid="admin.album.description.textarea"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-sans font-light">Data</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => (p ? { ...p, date: e.target.value } : p))
                }
                className="font-sans"
                data-ocid="admin.album.date.input"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-sans font-light">Układ galerii</Label>
              <Select
                value={form.layout}
                onValueChange={(v) =>
                  setForm((p) => (p ? { ...p, layout: v } : p))
                }
              >
                <SelectTrigger
                  className="font-sans"
                  data-ocid="admin.album.layout.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid" className="font-sans">
                    Siatka
                  </SelectItem>
                  <SelectItem value="masonry" className="font-sans">
                    Masonry
                  </SelectItem>
                  <SelectItem value="slider" className="font-sans">
                    Slider
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <ImageUpload
            label="Okładka albumu"
            current={form.coverImage}
            onUpload={(blob) =>
              setForm((p) => (p ? { ...p, coverImage: blob } : p))
            }
          />
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={createAlbum.isPending || updateAlbum.isPending}
            className="font-sans font-light"
            data-ocid="admin.album.save.submit_button"
          >
            <Save className="w-4 h-4 mr-2" />
            {createAlbum.isPending || updateAlbum.isPending
              ? "Zapisywanie..."
              : "Zapisz album"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setEditing(null)}
            className="font-sans font-light"
            data-ocid="admin.album.cancel.button"
          >
            Anuluj
          </Button>
        </div>

        {editing.id !== "new" && (
          <div className="space-y-4 border-t border-border pt-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-light">
                Zdjęcia ({album.photos.length})
              </h3>
              <Button
                size="sm"
                variant="outline"
                className="font-sans font-light"
                onClick={() => fileRef.current?.click()}
                disabled={!!uploadingAlbumId}
                data-ocid="admin.album.addphoto.upload_button"
              >
                {uploadingAlbumId ? (
                  "Dodawanie..."
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 mr-2" /> Dodaj zdjęcia
                  </>
                )}
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  for (const file of files) {
                    await handleAddPhoto(album.id, file);
                  }
                }}
              />
            </div>

            {album.photos.length === 0 ? (
              <div
                className="text-center py-10 border border-dashed border-border rounded-xl"
                data-ocid="admin.album.photos.empty_state"
              >
                <p className="font-sans text-sm text-muted-foreground">
                  Brak zdjęć. Dodaj pierwsze.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {album.photos.map((photo, i) => (
                  <div
                    key={photo.id}
                    className="relative group aspect-square rounded-lg overflow-hidden bg-muted"
                    data-ocid={`admin.album.photo.item.${i + 1}`}
                  >
                    <img
                      src={photo.blob.getDirectURL()}
                      alt={photo.caption}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 h-8 w-8 text-background hover:text-background hover:bg-destructive/80 transition-all"
                            data-ocid={`admin.photo.delete.delete_button.${i + 1}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent data-ocid="admin.photo.delete.dialog">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-display font-light">
                              Usuń zdjęcie
                            </AlertDialogTitle>
                            <AlertDialogDescription className="font-sans">
                              Ta operacja jest nieodwracalna.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              className="font-sans font-light"
                              data-ocid="admin.photo.delete.cancel_button"
                            >
                              Anuluj
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleRemovePhoto(album.id, photo.id)
                              }
                              className="font-sans font-light bg-destructive text-destructive-foreground"
                              data-ocid="admin.photo.delete.confirm_button"
                            >
                              Usuń
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-light">Galeria</h2>
        <Button
          onClick={openNew}
          size="sm"
          className="font-sans font-light"
          data-ocid="admin.gallery.add.primary_button"
        >
          <Plus className="w-4 h-4 mr-2" /> Nowy album
        </Button>
      </div>

      {isLoading ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          data-ocid="admin.gallery.loading_state"
        >
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : !albums || albums.length === 0 ? (
        <div
          className="text-center py-16 border border-dashed border-border rounded-xl"
          data-ocid="admin.gallery.empty_state"
        >
          <p className="font-sans text-sm text-muted-foreground">
            Brak albumów.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {albums.map((album, i) => (
            <div
              key={album.id}
              className="flex gap-4 bg-card rounded-xl p-4 border border-border"
              data-ocid={`admin.gallery.album.item.${i + 1}`}
            >
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {album.coverImage.getDirectURL() ? (
                  <img
                    src={album.coverImage.getDirectURL()}
                    alt={album.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="img-placeholder w-full h-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm font-light text-foreground truncate">
                  {album.name}
                </p>
                <p className="font-sans text-xs text-muted-foreground">
                  {album.date} · {album.photos.length} zdjęć
                </p>
                <p className="font-sans text-xs text-muted-foreground mt-1 capitalize">
                  {album.layout}
                </p>
              </div>
              <div className="flex items-start gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openEdit(album)}
                  data-ocid={`admin.gallery.album.edit.edit_button.${i + 1}`}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      data-ocid={`admin.gallery.album.delete.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent data-ocid="admin.gallery.album.delete.dialog">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-display font-light">
                        Usuń album
                      </AlertDialogTitle>
                      <AlertDialogDescription className="font-sans">
                        Ta operacja jest nieodwracalna. Wszystkie zdjęcia
                        zostaną usunięte.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        className="font-sans font-light"
                        data-ocid="admin.gallery.album.delete.cancel_button"
                      >
                        Anuluj
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteAlbum(album.id)}
                        className="font-sans font-light bg-destructive text-destructive-foreground"
                        data-ocid="admin.gallery.album.delete.confirm_button"
                      >
                        Usuń album
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
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
// NAVIGATION TAB
// ============================================================

const DEFAULT_NAV = [
  { name: "Aktualności", path: "/aktualnosci", visible: true },
  { name: "Liturgia", path: "/liturgia", visible: true },
  { name: "Wspólnoty", path: "/wspolnoty", visible: true },
  { name: "Galeria", path: "/galeria", visible: true },
  { name: "Kancelaria", path: "/kancelaria", visible: true },
  { name: "Kontakt", path: "/kontakt", visible: true },
  { name: "Modlitwa", path: "/modlitwa", visible: true },
  { name: "Życie", path: "/zycie", visible: true },
];

function NavigationTab() {
  const { data: settings } = useSiteSettings();
  const update = useUpdateSiteSettings();

  const [items, setItems] = useState(DEFAULT_NAV);

  React.useEffect(() => {
    if (settings?.navigation) {
      try {
        const saved = JSON.parse(settings.navigation) as {
          name: string;
          path: string;
          visible: boolean;
        }[];
        const merged = [...saved];
        for (const def of DEFAULT_NAV) {
          if (!merged.find((s) => s.path === def.path)) {
            merged.push(def);
          }
        }
        setItems(merged);
      } catch {
        setItems(DEFAULT_NAV);
      }
    } else {
      setItems(DEFAULT_NAV);
    }
  }, [settings]);

  const updateName = (i: number, name: string) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, name } : item)),
    );
  };

  const toggleVisible = (i: number) => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === i ? { ...item, visible: !item.visible } : item,
      ),
    );
  };

  const handleSave = async () => {
    const current = settings || {
      contactData: "{}",
      navigation: "",
      aestheticMode: "jordan",
      typography: "{}",
    };
    try {
      await update.mutateAsync({
        ...current,
        navigation: JSON.stringify(items),
      });
      toast.success("Nawigacja zaktualizowana");
    } catch {
      toast.error("Błąd zapisu");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-light">Nawigacja</h2>
        <Button
          onClick={handleSave}
          disabled={update.isPending}
          size="sm"
          className="font-sans font-light"
          data-ocid="admin.nav.save.submit_button"
        >
          <Save className="w-4 h-4 mr-2" />
          {update.isPending ? "Zapisywanie..." : "Zapisz"}
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={item.path}
            className={`flex items-center gap-3 bg-card rounded-lg p-3 border border-border ${!item.visible ? "opacity-50" : ""}`}
            data-ocid={`admin.nav.item.${i + 1}`}
          >
            <div className="flex-1">
              <Input
                value={item.name}
                onChange={(e) => updateName(i, e.target.value)}
                className="font-sans font-light text-sm border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                data-ocid={`admin.nav.name.input.${i + 1}`}
              />
              <p className="font-sans text-xs text-muted-foreground">
                {item.path}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={item.visible}
                onCheckedChange={() => toggleVisible(i)}
                data-ocid={`admin.nav.visible.switch.${i + 1}`}
              />
              {item.visible ? (
                <Eye className="w-4 h-4 text-muted-foreground" />
              ) : (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// SETTINGS TAB
// ============================================================

function SettingsTab() {
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
  });
  const [aestheticMode, setAestheticMode] = useState("jordan");

  React.useEffect(() => {
    if (settings) {
      try {
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
          ...JSON.parse(settings.contactData || "{}"),
        });
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
        contactData: JSON.stringify(contact),
        aestheticMode,
      });
      toast.success("Ustawienia zapisane");
    } catch {
      toast.error("Błąd zapisu");
    }
  };

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
    </div>
  );
}

// ============================================================
// ROLES TAB
// ============================================================

function RolesTab() {
  const { data: roles, isLoading } = useListAllRoles();
  const assign = useAssignRole();

  const handleAssign = async (
    user: import("@icp-sdk/core/principal").Principal,
    role: AppUserRole,
  ) => {
    try {
      await assign.mutateAsync({ user, role });
      toast.success("Rola przypisana");
    } catch {
      toast.error("Błąd przypisywania roli");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-light">Role użytkowników</h2>

      {isLoading ? (
        <div className="space-y-3" data-ocid="admin.roles.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !roles || roles.length === 0 ? (
        <div
          className="text-center py-16 border border-dashed border-border rounded-xl"
          data-ocid="admin.roles.empty_state"
        >
          <p className="font-sans text-sm text-muted-foreground">
            Brak przypisanych ról.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {roles.map(([principal, role], i) => (
            <div
              key={principal.toString()}
              className="flex items-center gap-4 bg-card rounded-lg p-4 border border-border"
              data-ocid={`admin.roles.item.${i + 1}`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-sans text-xs text-muted-foreground font-mono truncate">
                  {principal.toString()}
                </p>
              </div>
              <Select
                value={role}
                onValueChange={(v) => handleAssign(principal, v as AppUserRole)}
              >
                <SelectTrigger
                  className="w-36 font-sans text-sm"
                  data-ocid={`admin.roles.role.select.${i + 1}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value={AppUserRole.admin}
                    className="font-sans capitalize"
                  >
                    Admin
                  </SelectItem>
                  <SelectItem
                    value={AppUserRole.editor}
                    className="font-sans capitalize"
                  >
                    Redaktor
                  </SelectItem>
                  <SelectItem
                    value={AppUserRole.moderator}
                    className="font-sans capitalize"
                  >
                    Moderator
                  </SelectItem>
                  <SelectItem
                    value={AppUserRole.photographer}
                    className="font-sans capitalize"
                  >
                    Fotograf
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// LITURGIA TAB
// ============================================================

function LiturgiaTab() {
  const { week, saveWeek } = useLiturgy();
  const [registrations, setRegistrations] = React.useState<
    MinisterRegistration[]
  >([]);
  const [showApproved, setShowApproved] = React.useState(false);
  const [showRejected, setShowRejected] = React.useState(false);

  // Refresh from localStorage
  const refreshRegs = React.useCallback(() => {
    setRegistrations(getRegistrations());
  }, []);

  React.useEffect(() => {
    refreshRegs();
  }, [refreshRegs]);

  const pending = registrations.filter((r) => r.status === "pending");
  const approved = registrations.filter((r) => r.status === "approved");
  const rejected = registrations.filter((r) => r.status === "rejected");

  const handleApprove = async (reg: MinisterRegistration) => {
    if (!week) {
      toast.error("Nie załadowano tygodnia liturgicznego.");
      return;
    }

    // Find the week that contains this entry

    // We try to update the current week in memory if weekId matches
    // Otherwise we update localStorage directly
    let targetWeek = week.id === reg.weekId ? week : null;
    if (!targetWeek) {
      // Try from localStorage
      const stored = localStorage.getItem("liturgy_weeks");
      if (stored) {
        try {
          const all = JSON.parse(stored);
          const raw = all[reg.weekId];
          if (raw) {
            targetWeek = {
              ...raw,
              days: raw.days.map(
                (d: {
                  dayIndex: number;
                  entries: Array<{
                    id: string;
                    serviceType: string;
                    entryType: string;
                    order: number;
                    time: string;
                    intention: string;
                    description: string;
                  }>;
                }) => ({
                  dayIndex: BigInt(d.dayIndex),
                  entries: d.entries.map(
                    (e: {
                      id: string;
                      serviceType: string;
                      entryType: string;
                      order: number;
                      time: string;
                      intention: string;
                      description: string;
                    }) => ({
                      ...e,
                      order: BigInt(e.order),
                    }),
                  ),
                }),
              ),
            };
          }
        } catch {
          // ignore
        }
      }
    }

    if (!targetWeek) {
      toast.error("Nie znaleziono tygodnia liturgicznego dla tej intencji.");
      return;
    }

    const updatedDays = ensureAllDays(targetWeek).days.map((d) => {
      if (Number(d.dayIndex) !== reg.dayIndex) return d;
      const entries = d.entries.map((e) => {
        if (e.id !== reg.entryId) return e;
        const ministers = parseMinistersFromDescription(e.description);
        if (reg.role === "lektor") {
          if (!ministers.lectors.includes(reg.name)) {
            ministers.lectors.push(reg.name);
          }
        } else {
          if (!ministers.psalmists.includes(reg.name)) {
            ministers.psalmists.push(reg.name);
          }
        }
        return {
          ...e,
          description: serializeMinistersToDescription(
            ministers.lectors,
            ministers.psalmists,
          ),
        };
      });
      return { ...d, entries };
    });

    const updatedWeek = { ...targetWeek, days: updatedDays };

    try {
      if (week.id === reg.weekId) {
        await saveWeek(updatedWeek);
      } else {
        // Save directly to localStorage for other weeks
        const stored = localStorage.getItem("liturgy_weeks");
        const all = stored ? JSON.parse(stored) : {};
        all[reg.weekId] = {
          ...updatedWeek,
          days: updatedWeek.days.map((d) => ({
            dayIndex: Number(d.dayIndex),
            entries: d.entries.map((e) => ({ ...e, order: Number(e.order) })),
          })),
        };
        localStorage.setItem("liturgy_weeks", JSON.stringify(all));
      }

      // Update registration status
      const regs = getRegistrations().map((r) =>
        r.id === reg.id ? { ...r, status: "approved" as const } : r,
      );
      saveRegistrations(regs);
      refreshRegs();
      toast.success(`${reg.name} (${reg.role}) został zatwierdzony.`);
    } catch {
      toast.error("Błąd podczas zatwierdzania.");
    }
  };

  const handleReject = (reg: MinisterRegistration) => {
    const regs = getRegistrations().map((r) =>
      r.id === reg.id ? { ...r, status: "rejected" as const } : r,
    );
    saveRegistrations(regs);
    refreshRegs();
    toast.success("Zgłoszenie odrzucone.");
  };

  const handleDelete = (reg: MinisterRegistration) => {
    const regs = getRegistrations().filter((r) => r.id !== reg.id);
    saveRegistrations(regs);
    refreshRegs();
  };

  const roleBadge = (role: "lektor" | "psalmista") => (
    <Badge
      variant="secondary"
      className={`font-sans text-xs font-medium ${role === "lektor" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"}`}
    >
      {role === "lektor" ? "Lektor" : "Psalmista"}
    </Badge>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-light text-foreground">
          Liturgia
        </h2>
      </div>

      <p className="font-sans text-sm text-muted-foreground leading-relaxed">
        Zarządzaj tygodniowym grafikiem intencji mszalnych i nabożeństw. Edycja
        odbywa się bezpośrednio na stronie zakładki Liturgia.
      </p>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-display text-base font-light text-foreground">
              Grafik liturgiczny
            </p>
            <p className="font-sans text-sm font-light text-muted-foreground">
              Dodawaj Msze i nabożeństwa, edytuj godziny i intencje, generuj PDF
              do wydruku.
            </p>
          </div>
        </div>

        <a
          href="/liturgia"
          onClick={(e) => {
            e.preventDefault();
            window.history.pushState({}, "", "/liturgia");
            window.dispatchEvent(new PopStateEvent("popstate"));
          }}
          className="inline-flex items-center gap-2 font-sans text-sm font-light text-primary hover:text-primary/80 transition-colors"
          data-ocid="admin.liturgia.link"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Przejdź do zakładki Liturgia
        </a>
      </div>

      {/* Minister registrations section */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-light text-foreground border-b border-border/40 pb-3">
          Lektorzy i Psalmiści
        </h3>

        {/* Pending */}
        <div className="space-y-3">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Oczekujące ({pending.length})
          </p>
          {pending.length === 0 ? (
            <div
              className="bg-muted/30 rounded-xl p-5 text-center"
              data-ocid="admin.liturgia.minister.empty_state"
            >
              <p className="font-sans text-sm font-light text-muted-foreground">
                Brak oczekujących zgłoszeń.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {pending.map((reg, i) => (
                <div
                  key={reg.id}
                  className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                  data-ocid={`admin.liturgia.minister.item.${i + 1}`}
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-sans text-sm font-medium text-foreground">
                        {reg.name}
                      </span>
                      {roleBadge(reg.role)}
                    </div>
                    <p className="font-sans text-xs font-light text-muted-foreground">
                      {reg.massDate} · {reg.massTime}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="font-sans font-light text-xs h-8 border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                      onClick={() => handleApprove(reg)}
                      data-ocid={`admin.liturgia.minister.confirm_button.${i + 1}`}
                    >
                      Zatwierdź
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="font-sans font-light text-xs h-8 border-destructive/40 text-destructive hover:bg-destructive/10"
                      onClick={() => handleReject(reg)}
                      data-ocid={`admin.liturgia.minister.delete_button.${i + 1}`}
                    >
                      Odrzuć
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approved */}
        <div className="space-y-3">
          <button
            type="button"
            className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowApproved((v) => !v)}
            data-ocid="admin.liturgia.minister.toggle"
          >
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${showApproved ? "rotate-180" : ""}`}
            />
            Zatwierdzone ({approved.length})
          </button>
          {showApproved && approved.length > 0 && (
            <div className="space-y-2">
              {approved.map((reg, i) => (
                <div
                  key={reg.id}
                  className="bg-muted/30 border border-border/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 opacity-80"
                  data-ocid={`admin.liturgia.minister.approved.item.${i + 1}`}
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-sans text-sm font-medium text-foreground">
                        {reg.name}
                      </span>
                      {roleBadge(reg.role)}
                      <Badge
                        variant="outline"
                        className="font-sans text-xs font-light text-emerald-600 border-emerald-500/40"
                      >
                        zatwierdzone
                      </Badge>
                    </div>
                    <p className="font-sans text-xs font-light text-muted-foreground">
                      {reg.massDate} · {reg.massTime}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="font-sans font-light text-xs h-8 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => handleDelete(reg)}
                    data-ocid={`admin.liturgia.minister.approved.delete_button.${i + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rejected */}
        {rejected.length > 0 && (
          <div className="space-y-3">
            <button
              type="button"
              className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowRejected((v) => !v)}
              data-ocid="admin.liturgia.minister.rejected.toggle"
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${showRejected ? "rotate-180" : ""}`}
              />
              Odrzucone ({rejected.length})
            </button>
            {showRejected && (
              <div className="space-y-2">
                {rejected.map((reg, i) => (
                  <div
                    key={reg.id}
                    className="bg-muted/20 border border-border/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 opacity-60"
                    data-ocid={`admin.liturgia.minister.rejected.item.${i + 1}`}
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-sans text-sm font-medium text-foreground line-through">
                          {reg.name}
                        </span>
                        {roleBadge(reg.role)}
                      </div>
                      <p className="font-sans text-xs font-light text-muted-foreground">
                        {reg.massDate} · {reg.massTime}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="font-sans font-light text-xs h-8 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => handleDelete(reg)}
                      data-ocid={`admin.liturgia.minister.rejected.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-muted/40 rounded-xl p-4 border border-border/60">
        <p className="font-sans text-xs text-muted-foreground leading-relaxed">
          <strong className="font-medium text-foreground/70">Wskazówka:</strong>{" "}
          Po zalogowaniu, na stronie Liturgii pojawią się przyciski edycji przy
          każdym dniu tygodnia. Możesz dodawać Msze i nabożeństwa, usuwać wpisy
          oraz generować piękny PDF do wywieszenia w kościele.
        </p>
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

  // Access is granted to any authenticated Internet Identity user.
  // Internet Identity provides cryptographic authentication — being logged in
  // is sufficient authorization for this single-admin parish website.
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
              { value: "role", label: "Role" },
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

          <TabsContent value="strona">
            <HomeSectionsTab />
          </TabsContent>
          <TabsContent value="tresci">
            <ContentBlocksTab />
          </TabsContent>
          <TabsContent value="aktualnosci">
            <NewsTab />
          </TabsContent>
          <TabsContent value="liturgia">
            <LiturgiaTab />
          </TabsContent>
          <TabsContent value="galeria">
            <GalleryTab />
          </TabsContent>
          <TabsContent value="nawigacja">
            <NavigationTab />
          </TabsContent>
          <TabsContent value="ustawienia">
            <SettingsTab />
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
          <TabsContent value="role">
            <RolesTab />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
