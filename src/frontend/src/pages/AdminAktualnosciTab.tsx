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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Image as ImageIcon,
  Pencil,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { ExternalBlob, type NewsArticle } from "../backend";
import {
  useAllNews,
  useCreateNews,
  useDeleteNews,
  useUpdateNews,
} from "../hooks/useQueries";

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

export function AdminAktualnosciTab() {
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
                        Ta operacja jest nieodwracalna.
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
                        className="font-sans font-light bg-destructive text-destructive-foreground"
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
