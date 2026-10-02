"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import type { QueryValue } from "@/lib/api/query";

/** Paginated list bound to a query object (usually derived from URL params). */
export function useListQuery<T>(key: QueryKey, path: string, query: Record<string, QueryValue>, enabled = true) {
  return useQuery({
    queryKey: [...key, query],
    queryFn: () => api.list<T>(path, query),
    placeholderData: keepPreviousData,
    enabled,
  });
}

interface ActionOptions {
  success: string;
  /** Query-key prefixes to refetch after success. */
  invalidate: QueryKey[];
}

/** Mutation with a success toast + cache invalidation (errors toast globally). */
export function useApiAction<TVars, TResult = unknown>(fn: (vars: TVars) => Promise<TResult>, options: ActionOptions) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      toast.success(options.success);
      options.invalidate.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
    },
  });
}

export { api };
