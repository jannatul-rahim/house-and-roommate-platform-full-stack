"use client";

import type { ApiErrorBody, ApiResponse } from "@/types/api";
import { ApiError } from "./errors";

/**
 * Multipart upload through the BFF proxy using XHR, because fetch() cannot
 * report upload progress.
 */
export function uploadWithProgress<T>(path: string, form: FormData, onProgress: (percent: number) => void, method = "PATCH"): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, `/api/proxy${path}`);
    xhr.responseType = "json";
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      const json = xhr.response as ApiResponse<T> | ApiErrorBody | null;
      if (xhr.status >= 200 && xhr.status < 300 && json?.success) resolve((json as ApiResponse<T>).data);
      else {
        const err = json as ApiErrorBody | null;
        reject(new ApiError(xhr.status, err?.message ?? "Upload failed", err?.errors ?? []));
      }
    };
    xhr.onerror = () => reject(new ApiError(0, "Network error during upload. Please try again."));
    xhr.send(form);
  });
}
