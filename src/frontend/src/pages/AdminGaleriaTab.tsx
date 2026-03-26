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
import { Textarea } from "@/components/ui/textarea";
import {
  Image as ImageIcon,
  Pencil,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { ExternalBlob, type GalleryAlbum, type GalleryPhoto } from "../backend";
import {
  useAddPhoto,
  useCreateAlbum,
  useDeleteAlbum,
  useGalleryAlbums,
  useRemovePhoto,
  useUpdateAlbum,
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

export function AdminGaleriaTab() {
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
