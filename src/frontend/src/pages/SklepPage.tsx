import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Copy,
  Package,
  QrCode,
  Smartphone,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import React, { useState } from "react";
import { toast } from "sonner";
import { PaymentMethodsGrid } from "../components/PaymentCards";
import { useSiteSettings } from "../hooks/useQueries";
import {
  useShopOrders,
  useSklepConfig,
  useSklepProducts,
} from "../hooks/useSklepData";
import type { ShopOrder } from "../hooks/useSklepData";

// ============================================================
// TYPES
// ============================================================

export interface ShopProduct {
  id: string;
  name: string;
  description: string;
  fullDescription: string;
  price: string;
  priceLabel: "Cena" | "Ofiara";
  category: string;
  status: "available" | "new" | "featured" | "seasonal" | "soldout";
  imageUrl: string;
  youtubeUrl: string;
  order: number;
}

export interface ShopConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImageUrl: string;
  blikPhone: string;
  qrImageUrl: string;
  thankYouTitle: string;
  thankYouText: string;
  categories: string[];
}

// ============================================================
// HELPERS
// ============================================================

function getYoutubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([-\w]{11})/,
  );
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

const STATUS_LABELS: Record<ShopProduct["status"], string> = {
  available: "Dostępny",
  new: "Nowość",
  featured: "Polecane",
  seasonal: "Sezonowy",
  soldout: "Wyprzedany",
};

const STATUS_STYLES: Record<ShopProduct["status"], string> = {
  available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  new: "bg-sky-50 text-sky-700 border-sky-200",
  featured: "bg-amber-50 text-amber-700 border-amber-200",
  seasonal: "bg-orange-50 text-orange-700 border-orange-200",
  soldout: "bg-muted text-muted-foreground border-border",
};

function generateOrderId() {
  return `order_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (text: string, key: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      toast.success(msg);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Nie udało się skopiować");
    }
  };
  return { copied, copy };
}

// ============================================================
// STEP INDICATOR
// ============================================================

function StepIndicator({ step }: { step: number }) {
  const steps = ["Produkt", "Dane", "Płatność", "Gotowe"];
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {steps.map((label, i) => {
        const num = i + 1;
        const isActive = num === step;
        const isDone = num < step;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-sans font-medium transition-colors ${
                  isDone
                    ? "bg-primary text-primary-foreground"
                    : isActive
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : num}
              </div>
              <span
                className={`text-[10px] font-sans hidden sm:block ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-10 h-px mx-1 mb-5 sm:mb-4 ${
                  isDone ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ============================================================
// STEP 1: PRODUCT DETAIL
// ============================================================

function Step1Product({
  product,
  onNext,
}: {
  product: ShopProduct;
  onNext: () => void;
}) {
  const embedUrl = getYoutubeEmbedUrl(product.youtubeUrl);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {product.imageUrl && (
          <div className="rounded-xl overflow-hidden border border-border/40">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full object-cover aspect-[4/3]"
            />
          </div>
        )}
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full border font-sans font-medium ${
                STATUS_STYLES[product.status]
              }`}
            >
              {STATUS_LABELS[product.status]}
            </span>
            {product.category && (
              <span className="text-xs px-2.5 py-0.5 rounded-full border border-border text-muted-foreground font-sans">
                {product.category}
              </span>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-xs font-sans text-muted-foreground uppercase tracking-widest">
              {product.priceLabel}
            </p>
            <p className="font-display text-3xl font-bold text-foreground">
              {product.price}
            </p>
          </div>
          {product.fullDescription && (
            <p className="font-sans text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {product.fullDescription}
            </p>
          )}
        </div>
      </div>

      {embedUrl && (
        <div className="rounded-xl overflow-hidden border border-border/40 aspect-video">
          <iframe
            src={embedUrl}
            title={product.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )}

      {product.status !== "soldout" && (
        <Button
          onClick={onNext}
          className="w-full py-6 text-base font-sans font-medium"
          data-ocid="sklep.product.buy_button"
        >
          Kupuję ten produkt
        </Button>
      )}
    </div>
  );
}

// ============================================================
// STEP 2: CUSTOMER DATA FORM
// ============================================================

interface CustomerForm {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  postalCode: string;
  city: string;
  notes: string;
  deliveryType: "pickup" | "shipping";
}

function Step2Form({
  form,
  onChange,
  onBack,
  onNext,
}: {
  form: CustomerForm;
  onChange: (f: CustomerForm) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const set = (key: keyof CustomerForm, val: string) =>
    onChange({ ...form, [key]: val });

  const handleNext = () => {
    if (!form.customerName.trim()) {
      toast.error("Podaj imię i nazwisko");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("Podaj numer telefonu");
      return;
    }
    if (form.deliveryType === "shipping") {
      if (
        !form.address.trim() ||
        !form.postalCode.trim() ||
        !form.city.trim()
      ) {
        toast.error("Wypełnij pełny adres wysyłki");
        return;
      }
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="font-display text-xl font-semibold text-foreground">
          Dane do wysyłki
        </h3>
        <p className="font-sans text-sm text-muted-foreground">
          Podaj dane, abyśmy mogli wysłać zamówiony produkt.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 space-y-2">
          <Label className="font-sans text-sm">Imię i nazwisko *</Label>
          <Input
            value={form.customerName}
            onChange={(e) => set("customerName", e.target.value)}
            placeholder="Jan Kowalski"
            className="text-base py-5"
            data-ocid="sklep.order.name.input"
          />
        </div>
        <div className="space-y-2">
          <Label className="font-sans text-sm">Telefon *</Label>
          <Input
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+48 123 456 789"
            type="tel"
            className="text-base py-5"
            data-ocid="sklep.order.phone.input"
          />
        </div>
        <div className="space-y-2">
          <Label className="font-sans text-sm">E-mail (opcjonalnie)</Label>
          <Input
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="jan@example.com"
            type="email"
            className="text-base py-5"
            data-ocid="sklep.order.email.input"
          />
        </div>
      </div>

      {/* Delivery type */}
      <div className="space-y-3">
        <Label className="font-sans text-sm font-medium">Sposób odbioru</Label>
        <div className="grid grid-cols-2 gap-3">
          {(["pickup", "shipping"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => set("deliveryType", type)}
              data-ocid={`sklep.order.delivery_${type}.button`}
              className={`py-4 px-4 rounded-xl border text-sm font-sans font-medium transition-all ${
                form.deliveryType === type
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground/40"
              }`}
            >
              {type === "pickup" ? "Odbiór osobisty" : "Wysyłka pocztą"}
            </button>
          ))}
        </div>
      </div>

      {/* Address (only for shipping) */}
      {form.deliveryType === "shipping" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-2">
            <Label className="font-sans text-sm">Adres *</Label>
            <Input
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="ul. Przykładowa 1/2"
              className="text-base py-5"
              data-ocid="sklep.order.address.input"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-sans text-sm">Kod pocztowy *</Label>
            <Input
              value={form.postalCode}
              onChange={(e) => set("postalCode", e.target.value)}
              placeholder="00-000"
              className="text-base py-5"
              data-ocid="sklep.order.postal.input"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-sans text-sm">Miasto *</Label>
            <Input
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="Warszawa"
              className="text-base py-5"
              data-ocid="sklep.order.city.input"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label className="font-sans text-sm">Uwagi (opcjonalnie)</Label>
        <Textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Dodatkowe informacje do zamówienia..."
          rows={3}
          className="font-sans text-sm resize-none"
          data-ocid="sklep.order.notes.textarea"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 py-5 gap-2"
          data-ocid="sklep.order.form.back.button"
        >
          <ArrowLeft className="w-4 h-4" />
          Wstecz
        </Button>
        <Button
          onClick={handleNext}
          className="flex-1 py-5"
          data-ocid="sklep.order.form.next.button"
        >
          Przejdź do płatności
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// STEP 3: PAYMENT
// ============================================================

function Step3Payment({
  product,
  form,
  bankAccount,
  blikPhone,
  qrImageUrl,
  lightningAddress,
  lightningQrUrl,
  lightningDescription,
  lightningEnabled,
  usdcAddress,
  usdcQrUrl,
  usdcEnabled,
  onBack,
  onSubmit,
  submitting,
}: {
  product: ShopProduct;
  form: CustomerForm;
  bankAccount: string;
  blikPhone: string;
  qrImageUrl: string;
  lightningAddress?: string;
  lightningQrUrl?: string;
  lightningDescription?: string;
  lightningEnabled?: boolean;
  usdcAddress?: string;
  usdcQrUrl?: string;
  usdcEnabled?: boolean;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const { copied, copy } = useCopy();
  const transferTitle = `Zakup – ${product.name}`;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="font-display text-xl font-semibold text-foreground">
          Jak zapłacić
        </h3>
        <p className="font-sans text-sm text-muted-foreground">
          Wybierz wygodną metodę płatności.
        </p>
      </div>

      {/* Customer summary */}
      <div className="bg-muted/40 rounded-xl border border-border/40 p-4 space-y-1">
        <p className="font-sans text-sm font-medium text-foreground">
          {form.customerName}
        </p>
        {form.deliveryType === "shipping" && (
          <p className="font-sans text-xs text-muted-foreground">
            {form.address}, {form.postalCode} {form.city}
          </p>
        )}
        {form.deliveryType === "pickup" && (
          <p className="font-sans text-xs text-muted-foreground">
            Odbiór osobisty
          </p>
        )}
        <p className="font-sans text-xs text-muted-foreground">
          {product.priceLabel}: <strong>{product.price}</strong>
        </p>
      </div>

      {/* Payment methods */}
      <PaymentMethodsGrid
        bankAccount={bankAccount}
        blikPhone={blikPhone}
        qrImageUrl={qrImageUrl}
        lightningAddress={lightningAddress}
        lightningQrUrl={lightningQrUrl}
        lightningDescription={lightningDescription}
        lightningEnabled={lightningEnabled}
        usdcAddress={usdcAddress}
        usdcQrUrl={usdcQrUrl}
        usdcEnabled={usdcEnabled}
        transferTitle={transferTitle}
        ocidPrefix="sklep.payment"
        onCopy={copy}
        copiedKey={copied}
      />

      <p className="font-sans text-sm font-medium text-foreground text-center py-2">
        Po wpłacie parafia przygotuje wysyłkę produktu.
      </p>

      {/* Payment confirmation */}
      <div className="flex items-start gap-3 bg-muted/30 rounded-xl border border-border/40 p-4">
        <Checkbox
          id="payment-confirm"
          checked={paymentConfirmed}
          onCheckedChange={(v) => setPaymentConfirmed(!!v)}
          className="mt-0.5"
          data-ocid="sklep.order.payment_confirmed.checkbox"
        />
        <Label
          htmlFor="payment-confirm"
          className="font-sans text-sm text-foreground leading-relaxed cursor-pointer"
        >
          Potwierdzam, że dokonałem/am wpłaty na konto parafii
        </Label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 py-5 gap-2"
          data-ocid="sklep.order.payment.back.button"
        >
          <ArrowLeft className="w-4 h-4" />
          Wstecz
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!paymentConfirmed || submitting}
          className="flex-1 py-5"
          data-ocid="sklep.order.submit.button"
        >
          {submitting ? "Wysyłanie..." : "Wyślij zamówienie"}
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// STEP 4: THANK YOU
// ============================================================

function Step4ThankYou({
  product,
  form,
  onClose,
}: {
  product: ShopProduct;
  form: CustomerForm;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 text-center py-4"
    >
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="font-display text-2xl font-semibold text-foreground">
          Dziękujemy za zamówienie!
        </h3>
        <p className="font-sans text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
          Po zaksięgowaniu wpłaty przygotujemy wysyłkę na wskazany adres.
        </p>
      </div>

      {/* Order summary */}
      <div className="bg-muted/30 rounded-xl border border-border/40 p-4 text-left space-y-2 max-w-sm mx-auto">
        <p className="font-sans text-xs text-muted-foreground uppercase tracking-wider">
          Podsumowanie zamówienia
        </p>
        <p className="font-sans text-sm font-medium text-foreground">
          {product.name}
        </p>
        <p className="font-sans text-sm text-foreground">
          {product.priceLabel}: {product.price}
        </p>
        <div className="pt-1 border-t border-border/40">
          <p className="font-sans text-sm text-foreground">
            {form.customerName}
          </p>
          {form.deliveryType === "shipping" && (
            <p className="font-sans text-xs text-muted-foreground">
              {form.address}, {form.postalCode} {form.city}
            </p>
          )}
          {form.deliveryType === "pickup" && (
            <p className="font-sans text-xs text-muted-foreground">
              Odbiór osobisty
            </p>
          )}
        </div>
      </div>

      <Button
        onClick={onClose}
        variant="outline"
        className="px-10 py-5 text-base"
        data-ocid="sklep.order.close.button"
      >
        Zamknij
      </Button>
    </motion.div>
  );
}

// ============================================================
// PRODUCT DIALOG (4-STEP FLOW)
// ============================================================

function ProductDialog({
  product,
  bankAccount,
  blikPhone,
  qrImageUrl,
  lightningAddress,
  lightningQrUrl,
  lightningDescription,
  lightningEnabled,
  usdcAddress,
  usdcQrUrl,
  usdcEnabled,
  onClose,
}: {
  product: ShopProduct | null;
  bankAccount: string;
  blikPhone: string;
  qrImageUrl: string;
  lightningAddress?: string;
  lightningQrUrl?: string;
  lightningDescription?: string;
  lightningEnabled?: boolean;
  usdcAddress?: string;
  usdcQrUrl?: string;
  usdcEnabled?: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CustomerForm>({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    postalCode: "",
    city: "",
    notes: "",
    deliveryType: "shipping",
  });
  const { saveOrder } = useShopOrders();

  const handleClose = () => {
    setStep(1);
    setForm({
      customerName: "",
      phone: "",
      email: "",
      address: "",
      postalCode: "",
      city: "",
      notes: "",
      deliveryType: "shipping",
    });
    onClose();
  };

  const handleSubmit = async () => {
    if (!product) return;
    setSubmitting(true);
    try {
      const order: ShopOrder = {
        id: generateOrderId(),
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        customerName: form.customerName,
        phone: form.phone,
        email: form.email,
        address: form.address,
        postalCode: form.postalCode,
        city: form.city,
        notes: form.notes,
        deliveryType: form.deliveryType,
        paymentConfirmed: true,
        status: "new",
        trackingNumber: "",
        adminNotes: "",
        createdAt: new Date().toISOString(),
      };
      await saveOrder(order);
      setStep(4);
    } catch {
      toast.error("Nie udało się zapisać zamówienia. Spróbuj ponownie.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog
      open={!!product}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent
        className="max-w-2xl max-h-[92vh] overflow-y-auto"
        data-ocid="sklep.product.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-semibold text-foreground tracking-tight">
            {product.name}
          </DialogTitle>
        </DialogHeader>

        <StepIndicator step={step} />

        {step === 1 && (
          <Step1Product product={product} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <Step2Form
            form={form}
            onChange={setForm}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <Step3Payment
            product={product}
            form={form}
            bankAccount={bankAccount}
            blikPhone={blikPhone}
            qrImageUrl={qrImageUrl}
            lightningAddress={lightningAddress}
            lightningQrUrl={lightningQrUrl}
            lightningDescription={lightningDescription}
            lightningEnabled={lightningEnabled}
            usdcAddress={usdcAddress}
            usdcQrUrl={usdcQrUrl}
            usdcEnabled={usdcEnabled}
            onBack={() => setStep(2)}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}
        {step === 4 && (
          <Step4ThankYou product={product} form={form} onClose={handleClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// PRODUCT CARD
// ============================================================

function ProductCard({
  product,
  index,
  onClick,
}: {
  product: ShopProduct;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      whileHover={{ y: -4, boxShadow: "0 16px 48px 0 rgba(0,0,0,0.09)" }}
      className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm cursor-pointer group transition-shadow"
      onClick={onClick}
      data-ocid={`sklep.product.card.${index + 1}`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted/30">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10 text-muted-foreground/20" />
          </div>
        )}
        {product.status !== "available" && (
          <div className="absolute top-3 left-3">
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full border font-sans font-medium ${
                STATUS_STYLES[product.status]
              }`}
            >
              {STATUS_LABELS[product.status]}
            </span>
          </div>
        )}
        {product.status === "soldout" && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <span className="font-sans text-sm text-muted-foreground font-medium">
              Wyprzedany
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground tracking-tight leading-snug">
            {product.name}
          </h3>
          {product.category && (
            <p className="text-xs font-sans text-muted-foreground/60 mt-0.5">
              {product.category}
            </p>
          )}
        </div>
        {product.description && (
          <p className="font-sans text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-[10px] font-sans text-muted-foreground/70 uppercase tracking-widest">
              {product.priceLabel}
            </p>
            <p className="font-display text-xl font-bold text-foreground">
              {product.price}
            </p>
          </div>
          <span className="font-sans text-xs text-muted-foreground border border-border rounded-full px-3 py-1 group-hover:border-foreground/40 transition-colors">
            {product.status === "soldout" ? "Wyprzedany" : "Szczegóły"}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

// ============================================================
// SKELETON
// ============================================================

function SklepSkeleton() {
  return (
    <main className="pt-nav">
      <div className="min-h-[55vh] bg-muted/20 animate-pulse" />
      <div className="py-16 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[4/3] rounded-2xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export function SklepPage() {
  const { products, isLoading: loadingProducts } = useSklepProducts();
  const { config, isLoading: loadingConfig } = useSklepConfig();
  const { data: settings } = useSiteSettings();
  const [activeCategory, setActiveCategory] = useState("Wszystkie");
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(
    null,
  );

  // Get payment data from site settings
  let bankAccount = "";
  let lightningAddress = "";
  let lightningQrUrl = "";
  let lightningDescription = "";
  let lightningEnabled = false;
  let usdcAddress = "";
  let usdcQrUrl = "";
  let usdcEnabled = false;
  if (settings?.contactData) {
    try {
      const parsed = JSON.parse(settings.contactData) as {
        bankAccount?: string;
        lightningAddress?: string;
        lightningQrUrl?: string;
        lightningDescription?: string;
        lightningEnabled?: boolean;
        usdcAddress?: string;
        usdcQrUrl?: string;
        usdcEnabled?: boolean;
      };
      bankAccount = parsed.bankAccount ?? "";
      lightningAddress = parsed.lightningAddress ?? "";
      lightningQrUrl = parsed.lightningQrUrl ?? "";
      lightningDescription = parsed.lightningDescription ?? "";
      lightningEnabled = parsed.lightningEnabled ?? false;
      usdcAddress = parsed.usdcAddress ?? "";
      usdcQrUrl = parsed.usdcQrUrl ?? "";
      usdcEnabled = parsed.usdcEnabled ?? false;
    } catch {
      // ignore
    }
  }

  if ((loadingProducts || loadingConfig) && products.length === 0) {
    return <SklepSkeleton />;
  }

  const allCategories = [
    "Wszystkie",
    ...new Set(
      config.categories.length > 0
        ? config.categories
        : products.map((p) => p.category).filter(Boolean),
    ),
  ];

  const filtered =
    activeCategory === "Wszystkie"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const sorted = [...filtered].sort((a, b) => a.order - b.order);

  return (
    <main className="pt-nav">
      {/* HERO */}
      <section className="relative min-h-[55vh] flex items-end overflow-hidden">
        {config.heroImageUrl ? (
          <img
            src={config.heroImageUrl}
            alt={config.heroTitle}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-muted/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        <div className="relative z-10 w-full px-6 pb-16 pt-32">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-4"
            >
              <p className="font-sans text-xs tracking-[0.25em] uppercase text-primary/70">
                Parafia św. Jana Chrzciciela
              </p>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extralight text-foreground tracking-tight leading-none">
                {config.heroTitle}
              </h1>
              <div className="w-10 h-px bg-primary/40 mx-auto" />
              <p className="font-editorial text-lg sm:text-xl font-light text-foreground/70 leading-relaxed">
                {config.heroSubtitle}
              </p>
              <p className="font-sans text-sm font-light text-muted-foreground leading-relaxed max-w-lg mx-auto">
                {config.heroDescription}
              </p>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
          <ChevronDown className="w-5 h-5 text-foreground" />
        </div>
      </section>

      {/* CATEGORY FILTERS */}
      {allCategories.length > 1 && (
        <section className="py-8 px-6 border-b border-border/30">
          <div className="max-w-6xl mx-auto">
            <div
              className="flex flex-wrap gap-2 justify-center"
              data-ocid="sklep.category.toggle"
            >
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  data-ocid="sklep.category.tab"
                  className={`px-5 py-2 rounded-full text-sm font-sans transition-all duration-200 border ${
                    activeCategory === cat
                      ? "bg-foreground text-background border-foreground shadow-sm"
                      : "bg-transparent text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PRODUCT GRID */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {sorted.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
              data-ocid="sklep.products.empty_state"
            >
              <Package className="w-12 h-12 mx-auto text-muted-foreground/20 mb-4" />
              <p className="font-display text-xl text-muted-foreground">
                Brak produktów
              </p>
              <p className="font-sans text-sm text-muted-foreground/60 mt-2">
                Produkty pojawią się po dodaniu ich w panelu admina.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {sorted.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={i}
                  onClick={() => setSelectedProduct(product)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* THANK YOU */}
      <section className="py-16 px-6 bg-muted/20 border-t border-border/30">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h2 className="font-display text-3xl font-semibold text-foreground tracking-tight">
              {config.thankYouTitle}
            </h2>
            <div className="w-8 h-px bg-primary/40 mx-auto" />
            <p className="font-sans text-base text-muted-foreground leading-relaxed">
              {config.thankYouText}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              "Utrzymanie parafii",
              "Inwestycje",
              "Pomoc potrzebującym",
              "Działalność duszpasterska",
            ].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-card rounded-xl p-4 border border-border/40 text-center"
              >
                <p className="font-sans text-xs text-muted-foreground leading-snug">
                  {item}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT DIALOG */}
      <ProductDialog
        product={selectedProduct}
        bankAccount={bankAccount}
        blikPhone={config.blikPhone}
        qrImageUrl={config.qrImageUrl}
        lightningAddress={lightningAddress}
        lightningQrUrl={lightningQrUrl}
        lightningDescription={lightningDescription}
        lightningEnabled={lightningEnabled}
        usdcAddress={usdcAddress}
        usdcQrUrl={usdcQrUrl}
        usdcEnabled={usdcEnabled}
        onClose={() => setSelectedProduct(null)}
      />
    </main>
  );
}
