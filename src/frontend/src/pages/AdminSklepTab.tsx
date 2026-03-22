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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Loader2,
  Package,
  Pencil,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  DEFAULT_CONFIG,
  useShopOrders,
  useSklepConfig,
  useSklepProducts,
} from "../hooks/useSklepData";
import type { ShopOrder } from "../hooks/useSklepData";
import { useZycieImageUpload } from "../hooks/useZycieImageUpload";
import type { ShopConfig, ShopProduct } from "./SklepPage";

function generateId() {
  return `product_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ============================================================
// IMAGE FIELD
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

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const url = await upload(file);
      onChange(url);
    } catch {
      toast.error("Nie udało się wgrać zdjęcia");
    } finally {
      setUploading(false);
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
      >
        {value ? (
          <img
            src={value}
            alt="Podgląd"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 min-h-[120px]">
            <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
            <span className="font-sans text-sm text-muted-foreground/60">
              Kliknij, aby dodać zdjęcie
            </span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}
        <div className="absolute bottom-2 right-2">
          <span className="bg-card/80 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-xs font-sans">
            <Upload className="w-3.5 h-3.5" />
            {value ? "Zmień" : "Dodaj"}
          </span>
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
// PRODUCT FORM
// ============================================================

const EMPTY_PRODUCT: Omit<ShopProduct, "id"> = {
  name: "",
  description: "",
  fullDescription: "",
  price: "",
  priceLabel: "Cena",
  category: "",
  status: "available",
  imageUrl: "",
  youtubeUrl: "",
  order: 0,
};

function ProductForm({
  initial,
  categories,
  onSave,
  onCancel,
}: {
  initial: ShopProduct | null;
  categories: string[];
  onSave: (p: ShopProduct) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Omit<ShopProduct, "id">>(
    initial
      ? {
          name: initial.name,
          description: initial.description,
          fullDescription: initial.fullDescription,
          price: initial.price,
          priceLabel: initial.priceLabel,
          category: initial.category,
          status: initial.status,
          imageUrl: initial.imageUrl,
          youtubeUrl: initial.youtubeUrl,
          order: initial.order,
        }
      : { ...EMPTY_PRODUCT },
  );

  const set = (key: keyof typeof form, value: unknown) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Podaj nazwę produktu");
      return;
    }
    onSave({ id: initial?.id ?? generateId(), ...form });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-1">
        <h3 className="font-display text-lg font-semibold">
          {initial ? "Edytuj produkt" : "Nowy produkt"}
        </h3>
        <p className="text-sm text-muted-foreground font-sans">
          Uzupełnij dane produktu
        </p>
      </div>
      <Separator />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label>Nazwa *</Label>
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="np. Miód parafialny"
            data-ocid="sklep.product.name.input"
          />
        </div>
        <div className="space-y-2">
          <Label>Kategoria</Label>
          <Input
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            placeholder="np. Produkty naturalne"
            list="categories-list"
            data-ocid="sklep.product.category.input"
          />
          <datalist id="categories-list">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div className="space-y-2">
          <Label>Cena / Ofiara *</Label>
          <Input
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="np. 35 zł"
            data-ocid="sklep.product.price.input"
          />
        </div>
        <div className="space-y-2">
          <Label>Rodzaj ceny</Label>
          <Select
            value={form.priceLabel}
            onValueChange={(v) => set("priceLabel", v)}
          >
            <SelectTrigger data-ocid="sklep.product.price_label.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cena">Cena</SelectItem>
              <SelectItem value="Ofiara">Sugerowana ofiara</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={(v) => set("status", v as ShopProduct["status"])}
          >
            <SelectTrigger data-ocid="sklep.product.status.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Dostępny</SelectItem>
              <SelectItem value="new">Nowość</SelectItem>
              <SelectItem value="featured">Polecane</SelectItem>
              <SelectItem value="seasonal">Sezonowy</SelectItem>
              <SelectItem value="soldout">Wyprzedany</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Kolejność wyświetlania</Label>
          <Input
            type="number"
            value={form.order}
            onChange={(e) => set("order", Number(e.target.value))}
            data-ocid="sklep.product.order.input"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Krótki opis</Label>
        <Textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Krótki opis widoczny na karcie produktu"
          rows={2}
          className="resize-none"
          data-ocid="sklep.product.description.textarea"
        />
      </div>
      <div className="space-y-2">
        <Label>Pełny opis</Label>
        <Textarea
          value={form.fullDescription}
          onChange={(e) => set("fullDescription", e.target.value)}
          placeholder="Szczegółowy opis widoczny po kliknięciu produktu"
          rows={4}
          className="resize-none"
          data-ocid="sklep.product.full_description.textarea"
        />
      </div>
      <div className="space-y-2">
        <Label>Link YouTube (opcjonalnie)</Label>
        <Input
          value={form.youtubeUrl}
          onChange={(e) => set("youtubeUrl", e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          data-ocid="sklep.product.youtube.input"
        />
      </div>

      <ImageField
        label="Zdjęcie produktu"
        value={form.imageUrl}
        onChange={(url) => set("imageUrl", url)}
      />

      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="gap-2"
          data-ocid="sklep.product.form.cancel.button"
        >
          <X className="w-4 h-4" />
          Anuluj
        </Button>
        <Button
          onClick={handleSave}
          className="gap-2"
          data-ocid="sklep.product.form.save.button"
        >
          <Save className="w-4 h-4" />
          Zapisz produkt
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// PRODUCTS SUB-TAB
// ============================================================

function ProductsSubTab() {
  const { products, saveProducts } = useSklepProducts();
  const { config } = useSklepConfig();
  const [editing, setEditing] = useState<ShopProduct | null | "new">(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (product: ShopProduct) => {
    setSaving(true);
    try {
      let updated: ShopProduct[];
      if (editing === "new") {
        updated = [...products, product];
      } else {
        updated = products.map((p) => (p.id === product.id ? product : p));
      }
      await saveProducts(updated);
      toast.success("Produkt zapisany");
      setEditing(null);
    } catch {
      toast.error("Nie udało się zapisać");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Usunąć ten produkt?")) return;
    setSaving(true);
    try {
      await saveProducts(products.filter((p) => p.id !== id));
      toast.success("Produkt usunięty");
    } catch {
      toast.error("Nie udało się usunąć");
    } finally {
      setSaving(false);
    }
  };

  if (editing !== null) {
    return (
      <ProductForm
        initial={editing === "new" ? null : editing}
        categories={config.categories}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="font-sans text-sm text-muted-foreground">
          {products.length} produktów
        </p>
        <Button
          onClick={() => setEditing("new")}
          className="gap-2"
          data-ocid="sklep.product.add.button"
        >
          <Plus className="w-4 h-4" />
          Nowy produkt
        </Button>
      </div>

      {products.length === 0 ? (
        <div
          className="py-16 text-center text-muted-foreground"
          data-ocid="sklep.products.empty_state"
        >
          <Package className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="font-sans text-sm">Brak produktów</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...products]
            .sort((a, b) => a.order - b.order)
            .map((product, i) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-4 bg-card border border-border/40 rounded-xl"
                data-ocid={`sklep.product.row.${i + 1}`}
              >
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm font-medium text-foreground truncate">
                    {product.name}
                  </p>
                  <p className="font-sans text-xs text-muted-foreground">
                    {product.priceLabel}: {product.price}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(product)}
                    disabled={saving}
                    data-ocid={`sklep.product.edit_button.${i + 1}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(product.id)}
                    disabled={saving}
                    className="text-destructive hover:bg-destructive/10"
                    data-ocid={`sklep.product.delete_button.${i + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// CONFIG SUB-TAB
// ============================================================

function ConfigSubTab() {
  const { config, saveConfig } = useSklepConfig();
  const [form, setForm] = useState<ShopConfig>({ ...DEFAULT_CONFIG });
  const [catInput, setCatInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({ ...config });
  }, [config]);

  const set = (key: keyof ShopConfig, value: unknown) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveConfig(form);
      toast.success("Konfiguracja zapisana");
    } catch {
      toast.error("Nie udało się zapisać");
    } finally {
      setSaving(false);
    }
  };

  const addCategory = () => {
    const val = catInput.trim();
    if (!val || form.categories.includes(val)) return;
    set("categories", [...form.categories, val]);
    setCatInput("");
  };

  const removeCategory = (cat: string) =>
    set(
      "categories",
      form.categories.filter((c) => c !== cat),
    );

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-1">
        <h3 className="font-display text-lg font-semibold">
          Konfiguracja sklepu
        </h3>
        <p className="text-sm text-muted-foreground font-sans">
          Teksty, płatności i kategorie
        </p>
      </div>
      <Separator />

      {/* Hero */}
      <div className="space-y-4">
        <h4 className="font-sans text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Sekcja Hero
        </h4>
        <div className="space-y-2">
          <Label>Nagłówek</Label>
          <Input
            value={form.heroTitle}
            onChange={(e) => set("heroTitle", e.target.value)}
            data-ocid="sklep.config.hero_title.input"
          />
        </div>
        <div className="space-y-2">
          <Label>Podtytuł</Label>
          <Input
            value={form.heroSubtitle}
            onChange={(e) => set("heroSubtitle", e.target.value)}
            data-ocid="sklep.config.hero_subtitle.input"
          />
        </div>
        <div className="space-y-2">
          <Label>Opis</Label>
          <Textarea
            value={form.heroDescription}
            onChange={(e) => set("heroDescription", e.target.value)}
            rows={3}
            className="resize-none"
            data-ocid="sklep.config.hero_description.textarea"
          />
        </div>
        <ImageField
          label="Obraz hero"
          value={form.heroImageUrl}
          onChange={(url) => set("heroImageUrl", url)}
          aspectRatio="16/5"
        />
      </div>

      <Separator />

      {/* Payment */}
      <div className="space-y-4">
        <h4 className="font-sans text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Płatności
        </h4>
        <div className="space-y-2">
          <Label>Numer BLIK (telefon parafii)</Label>
          <Input
            value={form.blikPhone}
            onChange={(e) => set("blikPhone", e.target.value)}
            placeholder="+48 123 456 789"
            data-ocid="sklep.config.blik_phone.input"
          />
        </div>
        <ImageField
          label="Kod QR do przelewu"
          value={form.qrImageUrl}
          onChange={(url) => set("qrImageUrl", url)}
          aspectRatio="1/1"
        />
      </div>

      <Separator />

      {/* Thank you */}
      <div className="space-y-4">
        <h4 className="font-sans text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Podziękowanie
        </h4>
        <div className="space-y-2">
          <Label>Nagłówek podziękowania</Label>
          <Input
            value={form.thankYouTitle}
            onChange={(e) => set("thankYouTitle", e.target.value)}
            data-ocid="sklep.config.thankyou_title.input"
          />
        </div>
        <div className="space-y-2">
          <Label>Tekst podziękowania</Label>
          <Textarea
            value={form.thankYouText}
            onChange={(e) => set("thankYouText", e.target.value)}
            rows={3}
            className="resize-none"
            data-ocid="sklep.config.thankyou_text.textarea"
          />
        </div>
      </div>

      <Separator />

      {/* Categories */}
      <div className="space-y-4">
        <h4 className="font-sans text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Kategorie
        </h4>
        <div className="flex gap-2">
          <Input
            value={catInput}
            onChange={(e) => setCatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCategory()}
            placeholder="Nowa kategoria..."
            data-ocid="sklep.config.category.input"
          />
          <Button
            variant="outline"
            onClick={addCategory}
            data-ocid="sklep.config.add_category.button"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {form.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.categories.map((cat) => (
              <span
                key={cat}
                className="flex items-center gap-1.5 bg-muted/60 text-sm font-sans px-3 py-1.5 rounded-full border border-border"
              >
                {cat}
                <button
                  type="button"
                  onClick={() => removeCategory(cat)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2"
          data-ocid="sklep.config.save.button"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Zapisz konfigurację
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// ORDER STATUS HELPERS
// ============================================================

const ORDER_STATUS_LABELS: Record<ShopOrder["status"], string> = {
  new: "Nowe",
  awaiting: "Oczekuje wpłaty",
  paid: "Opłacone",
  shipped: "Wysłane",
};

const ORDER_STATUS_STYLES: Record<ShopOrder["status"], string> = {
  new: "bg-sky-50 text-sky-700 border-sky-200",
  awaiting: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  shipped: "bg-muted text-muted-foreground border-border",
};

const ORDER_FILTERS: { value: ShopOrder["status"] | "all"; label: string }[] = [
  { value: "all", label: "Wszystkie" },
  { value: "new", label: "Nowe" },
  { value: "awaiting", label: "Oczekuje wpłaty" },
  { value: "paid", label: "Opłacone" },
  { value: "shipped", label: "Wysłane" },
];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// ============================================================
// ORDER CARD
// ============================================================

function OrderCard({
  order,
  index,
  onUpdate,
  onDelete,
}: {
  order: ShopOrder;
  index: number;
  onUpdate: (id: string, o: ShopOrder) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [adminNotes, setAdminNotes] = useState(order.adminNotes);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleStatusChange = async (status: ShopOrder["status"]) => {
    setSaving(true);
    try {
      await onUpdate(order.id, {
        ...order,
        status,
        adminNotes,
        trackingNumber,
      });
      toast.success("Status zaktualizowany");
    } catch {
      toast.error("Nie udało się zaktualizować");
    } finally {
      setSaving(false);
    }
  };

  const handleNotesBlur = async () => {
    if (adminNotes === order.adminNotes) return;
    setSaving(true);
    try {
      await onUpdate(order.id, { ...order, adminNotes, trackingNumber });
    } catch {
      toast.error("Nie udało się zapisać notatki");
    } finally {
      setSaving(false);
    }
  };

  const handleTrackingBlur = async () => {
    if (trackingNumber === order.trackingNumber) return;
    setSaving(true);
    try {
      await onUpdate(order.id, { ...order, adminNotes, trackingNumber });
      toast.success("Numer przesyłki zapisany");
    } catch {
      toast.error("Nie udało się zapisać");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Usunąć to zamówienie?")) return;
    setDeleting(true);
    try {
      await onDelete(order.id);
      toast.success("Zamówienie usunięte");
    } catch {
      toast.error("Nie udało się usunąć");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="bg-card border border-border/40 rounded-xl overflow-hidden"
      data-ocid={`sklep.order.row.${index + 1}`}
    >
      {/* Main row */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="space-y-0.5">
            <p className="font-sans text-sm font-semibold text-foreground">
              {order.customerName}
            </p>
            <p className="font-sans text-xs text-muted-foreground">
              {order.productName} &middot; {order.productPrice}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs px-2.5 py-1 rounded-full border font-sans font-medium ${
                ORDER_STATUS_STYLES[order.status]
              }`}
            >
              {ORDER_STATUS_LABELS[order.status]}
            </span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full border font-sans ${
                order.deliveryType === "shipping"
                  ? "bg-violet-50 text-violet-700 border-violet-200"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {order.deliveryType === "shipping"
                ? "Wysyłka"
                : "Odbiór osobisty"}
            </span>
            {order.paymentConfirmed && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-sans">
                ✓ Wpłata potwierdzona
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-xs font-sans text-muted-foreground">
          <span>{order.phone}</span>
          {order.email && <span>{order.email}</span>}
          {order.deliveryType === "shipping" && order.address && (
            <span>
              {order.address}, {order.postalCode} {order.city}
            </span>
          )}
          <span className="ml-auto">{formatDate(order.createdAt)}</span>
        </div>
      </div>

      {/* Expand/collapse */}
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-2 bg-muted/30 border-t border-border/30 text-xs font-sans text-muted-foreground hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
        data-ocid={`sklep.order.toggle.${index + 1}`}
      >
        <span>Szczegóły i zarządzanie</span>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>

      {expanded && (
        <div className="p-4 border-t border-border/30 space-y-5">
          {/* Notes */}
          {order.notes && (
            <div className="space-y-1">
              <p className="text-xs font-sans text-muted-foreground uppercase tracking-wider">
                Uwagi klienta
              </p>
              <p className="font-sans text-sm text-foreground">{order.notes}</p>
            </div>
          )}

          {/* Status change */}
          <div className="space-y-2">
            <p className="text-xs font-sans text-muted-foreground uppercase tracking-wider">
              Zmień status
            </p>
            <div className="flex flex-wrap gap-2">
              {(["new", "awaiting", "paid", "shipped"] as const).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={order.status === s ? "default" : "outline"}
                  onClick={() => handleStatusChange(s)}
                  disabled={saving || order.status === s}
                  className="text-xs"
                  data-ocid={`sklep.order.status_${s}.button`}
                >
                  {ORDER_STATUS_LABELS[s]}
                </Button>
              ))}
            </div>
          </div>

          {/* Tracking number */}
          <div className="space-y-2">
            <Label className="text-xs font-sans text-muted-foreground uppercase tracking-wider">
              Numer przesyłki
            </Label>
            <Input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onBlur={handleTrackingBlur}
              placeholder="np. 00123456789PL"
              className="text-sm"
              data-ocid="sklep.order.tracking.input"
            />
          </div>

          {/* Admin notes */}
          <div className="space-y-2">
            <Label className="text-xs font-sans text-muted-foreground uppercase tracking-wider">
              Notatki admina
            </Label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Wewnętrzne notatki..."
              rows={2}
              className="text-sm resize-none"
              data-ocid="sklep.order.admin_notes.textarea"
            />
          </div>

          {/* Delete */}
          <div className="flex justify-end pt-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2 text-destructive hover:bg-destructive/10"
              data-ocid={`sklep.order.delete_button.${index + 1}`}
            >
              {deleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              Usuń zamówienie
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ORDERS SUB-TAB
// ============================================================

function OrdersSubTab() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { orders, isLoading, updateOrder, deleteOrder } = useShopOrders();
  const [filter, setFilter] = useState<ShopOrder["status"] | "all">("all");

  const counts = {
    all: orders.length,
    new: orders.filter((o) => o.status === "new").length,
    awaiting: orders.filter((o) => o.status === "awaiting").length,
    paid: orders.filter((o) => o.status === "paid").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
  };

  const filtered = [...orders]
    .filter((o) => filter === "all" || o.status === filter)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  if (!isAuthenticated) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <p className="font-sans text-sm">
          Zaloguj się, aby zarządzać zamówieniami.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="font-sans text-sm text-muted-foreground">
          {orders.length} zamówień łącznie
        </p>
      </div>

      {/* Filters */}
      <div
        className="flex flex-wrap gap-2"
        data-ocid="sklep.orders.filter.toggle"
      >
        {ORDER_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            data-ocid="sklep.orders.filter.tab"
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-sans border transition-all ${
              filter === f.value
                ? "bg-foreground text-background border-foreground"
                : "bg-transparent text-muted-foreground border-border hover:border-foreground/40"
            }`}
          >
            {f.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                filter === f.value
                  ? "bg-background/20 text-background"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {counts[f.value]}
            </span>
          </button>
        ))}
      </div>

      {isLoading && orders.length === 0 ? (
        <div
          className="py-12 text-center"
          data-ocid="sklep.orders.loading_state"
        >
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground/40" />
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="py-16 text-center text-muted-foreground"
          data-ocid="sklep.orders.empty_state"
        >
          <Package className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="font-sans text-sm">
            {filter === "all"
              ? "Brak zamówień"
              : `Brak zamówień o statusie "${ORDER_STATUS_LABELS[filter as ShopOrder["status"]]}"`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order, i) => (
            <OrderCard
              key={order.id}
              order={order}
              index={i}
              onUpdate={updateOrder}
              onDelete={deleteOrder}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN EXPORT
// ============================================================

export function AdminSklepTab() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Sklep parafialny
        </h2>
        <p className="font-sans text-sm text-muted-foreground">
          Zarządzaj produktami, konfiguracją i zamówieniami
        </p>
      </div>
      <Separator />

      <Tabs defaultValue="produkty">
        <TabsList className="bg-muted/40 p-1 rounded-xl">
          <TabsTrigger
            value="produkty"
            className="font-sans font-light text-sm"
            data-ocid="sklep.admin.produkty.tab"
          >
            Produkty
          </TabsTrigger>
          <TabsTrigger
            value="konfiguracja"
            className="font-sans font-light text-sm"
            data-ocid="sklep.admin.konfiguracja.tab"
          >
            Konfiguracja
          </TabsTrigger>
          <TabsTrigger
            value="zamowienia"
            className="font-sans font-light text-sm"
            data-ocid="sklep.admin.zamowienia.tab"
          >
            Zamówienia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="produkty" className="pt-6">
          <ProductsSubTab />
        </TabsContent>
        <TabsContent value="konfiguracja" className="pt-6">
          <ConfigSubTab />
        </TabsContent>
        <TabsContent value="zamowienia" className="pt-6">
          <OrdersSubTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
