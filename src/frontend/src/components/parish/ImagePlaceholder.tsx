import { Image } from "lucide-react";
import React from "react";
import type { ExternalBlob } from "../../backend";

interface ImagePlaceholderProps {
  blob?: ExternalBlob | null;
  alt?: string;
  className?: string;
  aspect?: "square" | "video" | "portrait" | "wide";
}

export function ImageWithFallback({
  blob,
  alt,
  className,
  aspect = "video",
}: ImagePlaceholderProps) {
  const [error, setError] = React.useState(false);
  const url = blob ? blob.getDirectURL() : "";
  const hasImage = url && url !== "" && !error;

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    wide: "aspect-[21/9]",
  };

  if (hasImage) {
    return (
      <img
        src={url}
        alt={alt || ""}
        className={`${className || ""} ${aspectClasses[aspect]} object-cover`}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div
      className={`${className || ""} ${aspectClasses[aspect]} img-placeholder rounded-lg`}
    >
      <div className="flex flex-col items-center gap-2 opacity-40">
        <Image className="w-8 h-8" />
        <span className="text-xs font-sans">Placeholder</span>
      </div>
    </div>
  );
}
