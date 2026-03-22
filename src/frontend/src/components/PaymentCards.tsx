import { Button } from "@/components/ui/button";
import { Check, Copy, QrCode } from "lucide-react";
import type React from "react";
import { useState } from "react";

// ============================================================
// SVG LOGO ICONS
// ============================================================

export function BlikLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 32"
      fill="none"
      className={className}
      role="img"
      aria-label="BLIK"
    >
      <title>BLIK</title>
      <rect width="80" height="32" rx="6" fill="#E30613" />
      <text
        x="40"
        y="23"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="900"
        fontSize="18"
        fill="white"
        letterSpacing="2"
      >
        BLIK
      </text>
    </svg>
  );
}

export function LightningLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      role="img"
      aria-label="Bitcoin Lightning"
    >
      <title>Bitcoin Lightning</title>
      <circle cx="24" cy="24" r="24" fill="#F7931A" />
      <path d="M28 6L13 27h11l-4 15 20-24H27L28 6z" fill="white" />
    </svg>
  );
}

export function UsdcLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      role="img"
      aria-label="USDC"
    >
      <title>USDC</title>
      <circle cx="24" cy="24" r="24" fill="#2775CA" />
      <circle
        cx="24"
        cy="24"
        r="16"
        stroke="white"
        strokeWidth="2.5"
        fill="none"
      />
      <text
        x="24"
        y="29"
        textAnchor="middle"
        fontFamily="Arial Black, sans-serif"
        fontWeight="900"
        fontSize="11"
        fill="white"
      >
        USDC
      </text>
    </svg>
  );
}

export function BankLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      role="img"
      aria-label="Przelew bankowy"
    >
      <title>Przelew bankowy</title>
      <rect width="48" height="48" rx="8" fill="#F5F0E8" />
      <path d="M24 8L6 18h36L24 8z" fill="#C9A84C" />
      <rect x="10" y="18" width="4" height="16" fill="#8B7355" />
      <rect x="18" y="18" width="4" height="16" fill="#8B7355" />
      <rect x="26" y="18" width="4" height="16" fill="#8B7355" />
      <rect x="34" y="18" width="4" height="16" fill="#8B7355" />
      <rect x="6" y="34" width="36" height="4" rx="1" fill="#C9A84C" />
    </svg>
  );
}

export function QrLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      role="img"
      aria-label="Kod QR"
    >
      <title>Kod QR</title>
      <rect width="48" height="48" rx="8" fill="#F5F5F5" />
      <rect x="6" y="6" width="14" height="14" rx="2" fill="#1A1A1A" />
      <rect x="9" y="9" width="8" height="8" rx="1" fill="white" />
      <rect x="11" y="11" width="4" height="4" fill="#1A1A1A" />
      <rect x="28" y="6" width="14" height="14" rx="2" fill="#1A1A1A" />
      <rect x="31" y="9" width="8" height="8" rx="1" fill="white" />
      <rect x="33" y="11" width="4" height="4" fill="#1A1A1A" />
      <rect x="6" y="28" width="14" height="14" rx="2" fill="#1A1A1A" />
      <rect x="9" y="31" width="8" height="8" rx="1" fill="white" />
      <rect x="11" y="33" width="4" height="4" fill="#1A1A1A" />
      <rect x="28" y="28" width="4" height="4" rx="0.5" fill="#1A1A1A" />
      <rect x="34" y="28" width="4" height="4" rx="0.5" fill="#1A1A1A" />
      <rect x="28" y="34" width="4" height="4" rx="0.5" fill="#1A1A1A" />
      <rect x="34" y="34" width="4" height="4" rx="0.5" fill="#1A1A1A" />
      <rect x="40" y="28" width="2" height="2" rx="0.5" fill="#1A1A1A" />
      <rect x="40" y="34" width="2" height="2" rx="0.5" fill="#1A1A1A" />
    </svg>
  );
}

// ============================================================
// COPY BUTTON HELPER
// ============================================================

function CopyBtn({
  text,
  label,
  successLabel = "Skopiowano!",
  copiedKey,
  ownKey,
  onCopy,
  dataOcid,
  fullWidth = false,
}: {
  text: string;
  label: string;
  successLabel?: string;
  copiedKey: string;
  ownKey: string;
  onCopy: (text: string, key: string, msg: string) => void;
  dataOcid?: string;
  fullWidth?: boolean;
}) {
  const isCopied = !!copiedKey && copiedKey === ownKey;
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => onCopy(text, ownKey, successLabel)}
      className={`gap-2 justify-center border-border/40 hover:border-[#C9A84C]/60 transition-colors text-xs${fullWidth ? " w-full" : ""}`}
      data-ocid={dataOcid}
    >
      {isCopied ? (
        <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
      ) : (
        <Copy className="w-3.5 h-3.5 shrink-0" />
      )}
      {isCopied ? "Skopiowano!" : label}
    </Button>
  );
}

// ============================================================
// BASE CARD COMPONENT (horizontal layout)
// ============================================================

const GOLD = "#C9A84C";

interface PaymentMethodCardProps {
  icon: React.ReactNode;
  title: string;
  tagline: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  dataOcid?: string;
}

export function PaymentMethodCard({
  icon,
  title,
  tagline,
  children,
  actions,
  dataOcid,
}: PaymentMethodCardProps) {
  return (
    <div
      className="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden"
      style={{ borderLeft: `3px solid ${GOLD}` }}
      data-ocid={dataOcid}
    >
      {/* Horizontal layout on md+, vertical on mobile */}
      <div className="flex flex-col md:flex-row">
        {/* LEFT ZONE — logo + tagline */}
        <div className="flex md:flex-col items-center gap-3 md:gap-2 md:justify-center px-5 py-4 md:py-5 md:w-[22%] md:min-w-[160px] border-b md:border-b-0 md:border-r border-border/20 bg-card/50">
          <div className="shrink-0">{icon}</div>
          <div className="md:text-center">
            <p className="font-display text-sm font-semibold text-foreground tracking-wide leading-tight">
              {title}
            </p>
            <p className="font-sans text-xs text-muted-foreground leading-snug mt-0.5 md:mt-1">
              {tagline}
            </p>
          </div>
        </div>

        {/* MIDDLE ZONE — data */}
        <div className="flex-1 px-5 py-4 md:py-5 space-y-2.5">{children}</div>

        {/* RIGHT ZONE — actions */}
        {actions && (
          <div className="flex flex-col justify-center gap-2 px-5 py-4 md:py-5 md:w-[28%] md:min-w-[180px] border-t md:border-t-0 md:border-l border-border/20">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// PAYMENT METHODS GRID (stack of 5 horizontal cards)
// ============================================================

export interface PaymentMethodsGridProps {
  bankAccount?: string;
  blikPhone?: string;
  qrImageUrl?: string;
  lightningAddress?: string;
  lightningQrUrl?: string;
  lightningDescription?: string;
  lightningEnabled?: boolean;
  usdcAddress?: string;
  usdcQrUrl?: string;
  usdcEnabled?: boolean;
  transferTitle?: string;
  ocidPrefix?: string;
  /** External copy handler -- if not provided, internal clipboard is used */
  onCopy?: (text: string, key: string, message: string) => void;
  copiedKey?: string | null;
}

export function PaymentMethodsGrid({
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
  transferTitle,
  ocidPrefix = "payment",
  onCopy: externalCopy,
  copiedKey: externalCopied,
}: PaymentMethodsGridProps) {
  const [internalCopied, setInternalCopied] = useState("");
  const [showLightningQr, setShowLightningQr] = useState(false);
  const [showUsdcQr, setShowUsdcQr] = useState(false);

  const copy = externalCopy
    ? externalCopy
    : async (text: string, key: string, _msg: string) => {
        try {
          await navigator.clipboard.writeText(text);
          setInternalCopied(key);
          setTimeout(() => setInternalCopied(""), 2000);
        } catch {}
      };

  const copied =
    externalCopied !== undefined && externalCopied !== null
      ? externalCopied
      : internalCopied;

  const showLightning = !!(lightningEnabled && lightningAddress);
  const showUsdc = !!(usdcEnabled && usdcAddress);

  return (
    <div className="space-y-3">
      {/* 1. Przelew bankowy */}
      <PaymentMethodCard
        icon={<BankLogo className="w-11 h-11" />}
        title="Przelew bankowy"
        tagline="Tradycyjny przelew — sprawdzony i bezpieczny"
        dataOcid={`${ocidPrefix}.bank.card`}
        actions={
          bankAccount ? (
            <>
              <CopyBtn
                text={bankAccount}
                label="Kopiuj numer konta"
                copiedKey={copied}
                ownKey={`${ocidPrefix}-account`}
                onCopy={copy}
                dataOcid={`${ocidPrefix}.copy_account.button`}
                fullWidth
              />
              {transferTitle && (
                <CopyBtn
                  text={transferTitle}
                  label="Kopiuj tytuł"
                  copiedKey={copied}
                  ownKey={`${ocidPrefix}-title`}
                  onCopy={copy}
                  dataOcid={`${ocidPrefix}.copy_title.button`}
                  fullWidth
                />
              )}
            </>
          ) : undefined
        }
      >
        <p className="font-sans text-xs uppercase tracking-wider text-muted-foreground">
          Parafia św. Jana Chrzciciela
        </p>
        {bankAccount ? (
          <p className="font-mono text-sm font-semibold text-foreground tracking-wider break-all">
            {bankAccount}
          </p>
        ) : (
          <p className="font-sans text-xs text-muted-foreground italic">
            Skontaktuj się z parafią
          </p>
        )}
        {transferTitle && (
          <div className="space-y-0.5">
            <p className="font-sans text-xs uppercase tracking-wider text-muted-foreground">
              Tytuł przelewu
            </p>
            <p className="font-sans text-xs font-semibold text-foreground">
              {transferTitle}
            </p>
          </div>
        )}
      </PaymentMethodCard>

      {/* 2. BLIK */}
      {blikPhone && (
        <PaymentMethodCard
          icon={<BlikLogo className="w-14 h-7" />}
          title="BLIK"
          tagline="Szybka płatność BLIK bezpośrednio z telefonu"
          dataOcid={`${ocidPrefix}.blik.card`}
          actions={
            <CopyBtn
              text={blikPhone}
              label="Kopiuj numer"
              copiedKey={copied}
              ownKey={`${ocidPrefix}-blik`}
              onCopy={copy}
              dataOcid={`${ocidPrefix}.copy_blik.button`}
              fullWidth
            />
          }
        >
          <p className="font-sans text-xs uppercase tracking-wider text-muted-foreground">
            Numer telefonu parafii
          </p>
          <p className="font-mono text-base font-bold text-foreground tracking-widest">
            {blikPhone}
          </p>
          <p className="font-sans text-xs text-muted-foreground leading-relaxed">
            Wykonaj przelew BLIK na telefon parafii. W tytule podaj nazwę
            produktu.
          </p>
        </PaymentMethodCard>
      )}

      {/* 3. QR */}
      {qrImageUrl && (
        <PaymentMethodCard
          icon={<QrLogo className="w-11 h-11" />}
          title="Kod QR"
          tagline="Zeskanuj kod i zapłać w kilka sekund"
          dataOcid={`${ocidPrefix}.qr.card`}
        >
          <p className="font-sans text-xs uppercase tracking-wider text-muted-foreground">
            Skanuj telefonem
          </p>
          <div className="flex items-start gap-4">
            <img
              src={qrImageUrl}
              alt="Kod QR do przelewu"
              className="w-24 h-24 object-contain rounded-lg border border-border/30 shrink-0"
            />
            <p className="font-sans text-xs text-muted-foreground leading-relaxed self-center">
              Zeskanuj telefonem, aby wykonać przelew na konto parafii.
            </p>
          </div>
        </PaymentMethodCard>
      )}

      {/* 4. Bitcoin Lightning */}
      {showLightning && (
        <PaymentMethodCard
          icon={<LightningLogo className="w-11 h-11" />}
          title="Bitcoin Lightning"
          tagline="Możesz wesprzeć parafię przez sieć Bitcoin Lightning"
          dataOcid={`${ocidPrefix}.lightning.card`}
          actions={
            <>
              <CopyBtn
                text={lightningAddress!}
                label="Kopiuj adres Lightning"
                copiedKey={copied}
                ownKey={`${ocidPrefix}-lightning`}
                onCopy={copy}
                dataOcid={`${ocidPrefix}.copy_lightning.button`}
                fullWidth
              />
              {lightningQrUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowLightningQr((v) => !v)}
                  className="gap-2 w-full justify-center border-border/40 hover:border-[#C9A84C]/60 transition-colors text-xs"
                  data-ocid={`${ocidPrefix}.lightning_qr.toggle`}
                >
                  <QrCode className="w-3.5 h-3.5 shrink-0" />
                  {showLightningQr ? "Ukryj QR" : "Pokaż QR"}
                </Button>
              )}
            </>
          }
        >
          <p className="font-sans text-xs uppercase tracking-wider text-muted-foreground">
            Lightning Address
          </p>
          <p className="font-mono text-xs text-foreground break-all">
            {lightningAddress}
          </p>
          {showLightningQr && lightningQrUrl && (
            <div className="pt-1">
              <img
                src={lightningQrUrl}
                alt="Kod QR Lightning"
                className="w-28 h-28 object-contain rounded-lg border border-border/30"
              />
            </div>
          )}
          <p className="font-sans text-xs text-muted-foreground leading-relaxed">
            {lightningDescription ||
              "Wpłata przez sieć Bitcoin Lightning — natychmiastowa i bez prowizji."}
          </p>
        </PaymentMethodCard>
      )}

      {/* 5. USDC (Arbitrum) */}
      {showUsdc && (
        <PaymentMethodCard
          icon={<UsdcLogo className="w-11 h-11" />}
          title="USDC (Arbitrum)"
          tagline="Wsparcie w stabilnej kryptowalucie przez sieć Arbitrum"
          dataOcid={`${ocidPrefix}.usdc.card`}
          actions={
            <>
              <CopyBtn
                text={usdcAddress!}
                label="Kopiuj adres"
                copiedKey={copied}
                ownKey={`${ocidPrefix}-usdc`}
                onCopy={copy}
                dataOcid={`${ocidPrefix}.copy_usdc.button`}
                fullWidth
              />
              {usdcQrUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowUsdcQr((v) => !v)}
                  className="gap-2 w-full justify-center border-border/40 hover:border-[#C9A84C]/60 transition-colors text-xs"
                  data-ocid={`${ocidPrefix}.usdc_qr.toggle`}
                >
                  <QrCode className="w-3.5 h-3.5 shrink-0" />
                  {showUsdcQr ? "Ukryj QR" : "Pokaż QR"}
                </Button>
              )}
            </>
          }
        >
          <p className="font-sans text-xs uppercase tracking-wider text-muted-foreground">
            Adres portfela USDC
          </p>
          <p className="font-mono text-xs text-foreground break-all">
            {usdcAddress}
          </p>
          {showUsdcQr && usdcQrUrl && (
            <div className="pt-1">
              <img
                src={usdcQrUrl}
                alt="Kod QR USDC"
                className="w-28 h-28 object-contain rounded-lg border border-border/30"
              />
            </div>
          )}
          <div className="space-y-0.5">
            <p className="font-sans text-xs text-muted-foreground">
              Sieć:{" "}
              <span className="font-medium text-foreground">Arbitrum</span>
            </p>
            <p className="font-sans text-xs text-amber-600 font-medium">
              Wysyłaj tylko USDC przez sieć Arbitrum.
            </p>
          </div>
        </PaymentMethodCard>
      )}
    </div>
  );
}
