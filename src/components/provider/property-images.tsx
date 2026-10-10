"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { uploadWithProgress } from "@/lib/api/upload";
import type { PropertyImage } from "@/types/api";

export const MAX_PROPERTY_IMAGES = 10;
const MAX_BYTES = 4 * 1024 * 1024; // matches the API limit (Vercel caps request bodies near 4.5 MB)
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

/** Uploads one file per request so large galleries stay under the request-size cap. */
export async function uploadPropertyImages(propertyId: string, files: File[], onProgress?: (done: number, total: number) => void) {
  for (const [index, file] of files.entries()) {
    const form = new FormData();
    form.append("images", file);
    await uploadWithProgress(`/properties/${propertyId}/images`, form, () => undefined, "POST");
    onProgress?.(index + 1, files.length);
  }
}

/** Returns the files that pass the type/size checks and toasts about the rest. */
function validate(selected: File[], room: number): File[] {
  const valid: File[] = [];
  for (const file of selected) {
    if (!ACCEPTED.includes(file.type)) toast.error(`${file.name}: please choose a JPG, PNG or WebP image.`);
    else if (file.size > MAX_BYTES) toast.error(`${file.name}: images must be 4 MB or smaller.`);
    else valid.push(file);
  }
  if (valid.length > room) {
    toast.error(`You can add up to ${MAX_PROPERTY_IMAGES} photos per property.`);
    return valid.slice(0, Math.max(room, 0));
  }
  return valid;
}

function usePreviews(files: File[]) {
  const urls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => urls.forEach((url) => URL.revokeObjectURL(url)), [urls]);
  return urls;
}

/** Wizard step: choose photos now, they upload right after the listing is created. */
export function PhotoPicker({ files, onChange }: { files: File[]; onChange: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previews = usePreviews(files);

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED.join(",")}
        className="sr-only"
        aria-label="Property photos"
        onChange={(e) => {
          onChange([...files, ...validate(Array.from(e.target.files ?? []), MAX_PROPERTY_IMAGES - files.length)]);
          e.target.value = "";
        }}
      />
      <p className="text-sm text-muted-foreground">
        Optional. JPG, PNG or WebP, up to 4 MB each, max {MAX_PROPERTY_IMAGES} photos. The first photo is the cover. Without photos we show a placeholder.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {previews.map((src, i) => (
          <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted">
            <Image src={src} alt={`Selected photo ${i + 1}`} fill sizes="200px" className="object-cover" unoptimized />
            {i === 0 && <span className="absolute top-2 left-2 rounded-full bg-background/90 px-2 py-0.5 text-xs font-semibold">Cover</span>}
            <button
              type="button"
              onClick={() => onChange(files.filter((_, index) => index !== i))}
              className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-background/90 shadow hover:bg-background"
              aria-label={`Remove photo ${i + 1}`}
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
        {files.length < MAX_PROPERTY_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
          >
            <ImagePlus className="size-6" /> Add photos
          </button>
        )}
      </div>
    </div>
  );
}

/** Manage page: show saved photos, add more, delete existing ones. */
export function PropertyImagesCard({ propertyId, images }: { propertyId: string; images: PropertyImage[] }) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["properties"] });

  const add = async (selected: File[]) => {
    const files = validate(selected, MAX_PROPERTY_IMAGES - images.length);
    if (!files.length) return;
    setProgress({ done: 0, total: files.length });
    try {
      await uploadPropertyImages(propertyId, files, (done, total) => setProgress({ done, total }));
      toast.success(files.length === 1 ? "Photo added" : `${files.length} photos added`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Upload failed"));
    } finally {
      setProgress(null);
      await refresh();
    }
  };

  const remove = async (imageId: string) => {
    setRemoving(imageId);
    try {
      await api.delete(`/properties/${propertyId}/images/${imageId}`);
      toast.success("Photo removed");
      await refresh();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not remove the photo"));
    } finally {
      setRemoving(null);
    }
  };

  const uploading = progress !== null;

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-semibold">Photos</h2>
            <p className="text-sm text-muted-foreground">
              {images.length}/{MAX_PROPERTY_IMAGES} photos. The first one is the cover shown in search.
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED.join(",")}
            className="sr-only"
            aria-label="Add property photos"
            onChange={(e) => {
              void add(Array.from(e.target.files ?? []));
              e.target.value = "";
            }}
          />
          <Button size="sm" variant="outline" disabled={uploading || images.length >= MAX_PROPERTY_IMAGES} onClick={() => inputRef.current?.click()}>
            {uploading ? <Loader2 className="animate-spin" /> : <ImagePlus />} Add photos
          </Button>
        </div>
        {uploading && (
          <div className="space-y-1" aria-live="polite">
            <Progress value={(progress.done / progress.total) * 100} aria-label="Upload progress" />
            <p className="text-xs text-muted-foreground">
              Uploaded {progress.done} of {progress.total}…
            </p>
          </div>
        )}
        {images.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {images.map((image, i) => (
              <div key={image.id} className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted">
                <Image src={image.url} alt={`Property photo ${i + 1}`} fill sizes="200px" className="object-cover" />
                {i === 0 && <span className="absolute top-2 left-2 rounded-full bg-background/90 px-2 py-0.5 text-xs font-semibold">Cover</span>}
                <button
                  type="button"
                  onClick={() => void remove(image.id)}
                  disabled={removing === image.id}
                  className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-background/90 shadow hover:bg-background"
                  aria-label={`Delete photo ${i + 1}`}
                >
                  {removing === image.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4 text-destructive" />}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">No photos yet — a placeholder is shown instead.</p>
        )}
      </CardContent>
    </Card>
  );
}
