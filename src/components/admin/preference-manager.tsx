"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Settings2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, type Column } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { FormDialog } from "@/components/shared/form-dialog";
import { ListToolbar } from "@/components/shared/list-toolbar";
import { SearchInput } from "@/components/shared/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api, useApiAction } from "@/hooks/use-api";
import { useQueryParams } from "@/hooks/use-query-params";
import { formatDate } from "@/lib/format";
import type { PreferenceOption } from "@/types/api";

// Mirrors the admin preference schema: name 1-120, type <= 80.
const preferenceSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "At most 120 characters"),
  type: z.string().trim().max(80, "At most 80 characters").optional(),
});

const KEY = ["preferences"];

/** CRUD for the roommate preference catalogue. The endpoint isn't paginated, so filtering happens client-side (still URL-synced). */
export function PreferenceManager() {
  const { get } = useQueryParams();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: KEY, queryFn: () => api.get<PreferenceOption[]>("/preferences") });
  const remove = useApiAction((id: string) => api.delete(`/preferences/${id}`), { success: "Preference deleted", invalidate: [KEY] });

  const search = get("search")?.toLowerCase();
  const type = get("type");
  const types = [...new Set((data ?? []).map((p) => p.type).filter((t): t is string => !!t))].sort();
  const rows = (data ?? []).filter((p) => (!search || p.name.toLowerCase().includes(search)) && (!type || p.type === type));
  const refresh = () => queryClient.invalidateQueries({ queryKey: KEY });

  const columns: Column<PreferenceOption>[] = [
    { key: "name", header: "Preference", cell: (p) => <span className="font-medium">{p.name}</span> },
    { key: "type", header: "Category", cell: (p) => (p.type ? <Badge variant="secondary">{p.type}</Badge> : <span className="text-muted-foreground">—</span>) },
    { key: "created", header: "Created", hideOnMobile: true, cell: (p) => <span className="text-sm text-muted-foreground">{formatDate(p.createdAt)}</span> },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "text-right",
      cell: (p) => (
        <div className="flex justify-end gap-1">
          <FormDialog
            trigger={
              <Button size="icon-sm" variant="ghost" aria-label={`Edit ${p.name}`}>
                <Pencil />
              </Button>
            }
            title="Edit preference"
            schema={preferenceSchema}
            defaultValues={{ name: p.name, type: p.type ?? "" }}
            fields={[
              { name: "name", label: "Name", required: true },
              { name: "type", label: "Category", placeholder: "Lifestyle" },
            ]}
            onSubmit={async (v) => {
              await api.patch(`/preferences/${p.id}`, { name: v.name, ...(v.type ? { type: v.type } : {}) });
              toast.success("Preference updated");
              await refresh();
            }}
          />
          <ConfirmDialog
            trigger={
              <Button size="icon-sm" variant="ghost" className="text-destructive" aria-label={`Delete ${p.name}`}>
                <Trash2 />
              </Button>
            }
            title={`Delete "${p.name}"?`}
            description="Tenants who selected it will lose it from their profiles and matching."
            confirmLabel="Delete"
            destructive
            onConfirm={() => remove.mutateAsync(p.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <ListToolbar>
          <SearchInput placeholder="Search preferences" />
          <FilterSelect paramKey="type" options={types.map((t) => ({ value: t, label: t }))} placeholder="Category" allLabel="All categories" />
        </ListToolbar>
        <FormDialog
          trigger={
            <Button>
              <Plus /> New preference
            </Button>
          }
          title="Create preference"
          description="Tenants can pick it in their roommate profile; shared picks raise compatibility."
          schema={preferenceSchema}
          defaultValues={{ name: "", type: "" }}
          fields={[
            { name: "name", label: "Name", required: true, placeholder: "Early riser" },
            { name: "type", label: "Category", placeholder: "Lifestyle" },
          ]}
          submitLabel="Create"
          onSubmit={async (v) => {
            await api.post("/preferences", { name: v.name, ...(v.type ? { type: v.type } : {}) });
            toast.success("Preference created");
            await refresh();
          }}
        />
      </div>
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        rowKey={(p) => p.id}
        emptyState={<EmptyState icon={Settings2} title="No preferences found" description={search || type ? "Nothing matches these filters." : "Create options tenants can use to describe their lifestyle."} />}
      />
      {!isLoading && <p className="text-sm text-muted-foreground">{rows.length} of {data?.length ?? 0} preferences</p>}
    </div>
  );
}
