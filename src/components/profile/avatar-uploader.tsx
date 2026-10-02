"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { sessionQueryKey } from "@/hooks/use-auth";
import { getErrorMessage } from "@/lib/api/errors";
import { uploadWithProgress } from "@/lib/api/upload";
import { useAuthStore } from "@/store/auth-store";
import type { AuthUser } from "@/types/api";

const MAX_BYTES = 5 * 1024 * 1024; // matches the API's multer limit
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

/** Pick → preview → upload (with progress) for the profile photo. */
export function AvatarUploader({ user }: { user: AuthUser }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const patchUser = useAuthStore((s) => s.patchUser);
  const current = useAuthStore((s) => s.user) ?? user;
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const choose = (selected: File | undefined) => {
    if (!selected) return;
    if (!ACCEPTED.includes(selected.type)) return toast.error("Please choose a JPG, PNG or WebP image.");
    if (selected.size > MAX_BYTES) return toast.error("Images must be 5 MB or smaller.");
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const upload = async () => {
    if (!file) return;
    const form = new FormData();
    form.append("image", file);
    setProgress(0);
    try {
      const updated = await uploadWithProgress<{ image: string | null }>("/auth/imageUpdate", form, setProgress);
      patchUser({ image: updated.image });
      queryClient.setQueryData<AuthUser | null>(sessionQueryKey, (prev) => (prev ? { ...prev, image: updated.image } : prev));
      toast.success("Profile photo updated");
      reset();
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error, "Upload failed"));
      setProgress(null);
    }
  };

  const uploading = progress !== null;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="relative">
        {preview ? (
          <div className="relative size-24 overflow-hidden rounded-full ring-4 ring-primary/20">
            <Image src={preview} alt="New profile photo preview" fill sizes="96px" className="object-cover" unoptimized />
          </div>
        ) : (
          <UserAvatar name={current.name} image={current.image} className="size-24 text-2xl ring-4 ring-background" />
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
          aria-label="Choose a new profile photo"
        >
          <Camera className="size-4" />
        </button>
      </div>
      <div className="w-full flex-1 space-y-3 text-center sm:text-left">
        <div>
          <p className="font-medium">Profile photo</p>
          <p className="text-sm text-muted-foreground">JPG, PNG or WebP, up to 5 MB. Shown to owners and potential roommates.</p>
        </div>
        <input ref={inputRef} type="file" accept={ACCEPTED.join(",")} className="sr-only" onChange={(e) => choose(e.target.files?.[0])} aria-label="Profile photo file" />
        {file ? (
          <div className="space-y-3">
            <p className="truncate text-sm">
              <span className="font-medium">{file.name}</span> <span className="text-muted-foreground">({(file.size / 1024).toFixed(0)} KB)</span>
            </p>
            {uploading && (
              <div className="space-y-1" aria-live="polite">
                <Progress value={progress} aria-label="Upload progress" />
                <p className="text-xs text-muted-foreground">Uploading… {progress}%</p>
              </div>
            )}
            <div className="flex justify-center gap-2 sm:justify-start">
              <Button size="sm" onClick={upload} disabled={uploading}>
                {uploading ? <Loader2 className="animate-spin" /> : <Upload />} Upload photo
              </Button>
              <Button size="sm" variant="ghost" onClick={reset} disabled={uploading}>
                <X /> Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
            <Camera /> Change photo
          </Button>
        )}
      </div>
    </div>
  );
}
