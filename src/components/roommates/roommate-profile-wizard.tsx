"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormField, fieldAria } from "@/components/shared/form-field";
import { Stepper } from "@/components/shared/stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { applyServerErrors } from "@/lib/forms";
import { dateInputToIso, formatCurrency, formatDate, toDateInputValue } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ROOMMATE_STEPS, roommateProfileSchema, type RoommateProfileInput } from "@/lib/validations/roommate";
import type { MyPreference, PreferenceOption, RoommateProfile } from "@/types/api";

const EMPTY: RoommateProfileInput = {
  occupation: "",
  bio: "",
  budgetMin: "",
  budgetMax: "",
  preferredLocation: "",
  moveInDate: "",
  smoking: false,
  pets: false,
  genderPreference: "",
  isDiscoverable: true,
  preferenceIds: [],
};

function useMyProfile() {
  return useQuery({
    queryKey: ["roommate-profile", "me"],
    // 404 simply means "no profile yet".
    queryFn: async () => {
      try {
        return await api.get<RoommateProfile>("/roommate-profile/me");
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
  });
}

/** Five-step wizard that creates or edits the tenant's roommate profile. */
export function RoommateProfileWizard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const profile = useMyProfile();
  const options = useQuery({ queryKey: ["preferences"], queryFn: () => api.get<PreferenceOption[]>("/preferences") });
  const mine = useQuery({
    queryKey: ["roommate-preferences", "me"],
    queryFn: () => api.get<MyPreference[]>("/roommate-preferences/me"),
    enabled: !!profile.data,
  });

  const form = useForm<RoommateProfileInput>({
    resolver: zodResolver(roommateProfileSchema),
    mode: "onTouched",
    defaultValues: EMPTY,
  });
  const { errors } = form.formState;
  const isEdit = !!profile.data;

  // Prefill once the existing profile has loaded.
  useEffect(() => {
    if (!profile.data) return;
    const p = profile.data;
    form.reset({
      occupation: p.occupation ?? "",
      bio: p.bio ?? "",
      budgetMin: p.budgetMin?.toString() ?? "",
      budgetMax: p.budgetMax?.toString() ?? "",
      preferredLocation: p.preferredLocation ?? "",
      moveInDate: toDateInputValue(p.moveInDate),
      smoking: p.smoking,
      pets: p.pets,
      genderPreference: p.genderPreference ?? "",
      isDiscoverable: p.isDiscoverable,
      preferenceIds: mine.data?.map((m) => m.preferenceId) ?? p.preferences.map((x) => x.preferenceId),
    });
  }, [profile.data, mine.data, form]);

  const grouped = useMemo(() => {
    const map = new Map<string, PreferenceOption[]>();
    for (const option of options.data ?? []) {
      const key = option.type ?? "Other";
      map.set(key, [...(map.get(key) ?? []), option]);
    }
    return [...map.entries()];
  }, [options.data]);

  const save = useMutation({
    mutationFn: async (values: RoommateProfileInput) => {
      const body = {
        occupation: values.occupation,
        bio: values.bio,
        budgetMin: values.budgetMin || undefined,
        budgetMax: values.budgetMax || undefined,
        preferredLocation: values.preferredLocation,
        moveInDate: values.moveInDate ? dateInputToIso(values.moveInDate) : undefined,
        smoking: values.smoking,
        pets: values.pets,
        genderPreference: values.genderPreference || undefined,
        isDiscoverable: values.isDiscoverable,
      };
      if (isEdit) await api.patch("/roommate-profile/me", body);
      else await api.post("/roommate-profile", body);
      await api.put("/roommate-preferences/me", { preferences: values.preferenceIds.map((preferenceId) => ({ preferenceId })) });
    },
    onSuccess: () => {
      toast.success(isEdit ? "Roommate profile updated" : "Roommate profile created — let's find your matches!");
      queryClient.invalidateQueries({ queryKey: ["roommate-profile"] });
      queryClient.invalidateQueries({ queryKey: ["roommate-preferences"] });
      queryClient.invalidateQueries({ queryKey: ["roommates"] });
      router.push("/dashboard/roommates");
    },
    onError: (error) => {
      if (applyServerErrors(error, form.setError, Object.keys(EMPTY))) setStep(0);
    },
  });

  const remove = useMutation({
    mutationFn: () => api.delete("/roommate-profile/me"),
    onSuccess: () => {
      toast.success("Roommate profile deleted");
      queryClient.invalidateQueries({ queryKey: ["roommate-profile"] });
      queryClient.invalidateQueries({ queryKey: ["roommates"] });
      form.reset(EMPTY);
      setStep(0);
    },
  });

  const next = async () => {
    const fields = ROOMMATE_STEPS[step].fields as readonly (keyof RoommateProfileInput)[];
    const valid = fields.length === 0 || (await form.trigger([...fields], { shouldFocus: true }));
    if (valid) setStep((s) => Math.min(s + 1, ROOMMATE_STEPS.length - 1));
  };

  if (profile.isLoading) {
    return <Skeleton className="h-[480px] w-full rounded-xl" />;
  }

  const values = form.watch();
  const selectedPrefs = (options.data ?? []).filter((o) => values.preferenceIds.includes(o.id));

  return (
    <div className="space-y-6">
      <Stepper steps={ROOMMATE_STEPS} current={step} />
      <Card>
        <CardContent className="p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (step === ROOMMATE_STEPS.length - 1) form.handleSubmit((v) => save.mutate(v))();
              else void next();
            }}
            noValidate
            className="space-y-6"
          >
            <div>
              <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                Step {step + 1} of {ROOMMATE_STEPS.length}
              </p>
              <h2 className="font-heading text-xl font-semibold">{ROOMMATE_STEPS[step].title}</h2>
            </div>

            {step === 0 && (
              <div className="space-y-4">
                <FormField label="Occupation" htmlFor="occupation" error={errors.occupation?.message} required>
                  <Input placeholder="e.g. Software Engineer, Student" {...fieldAria("occupation", errors.occupation?.message)} {...form.register("occupation")} />
                </FormField>
                <FormField label="About you" htmlFor="bio" error={errors.bio?.message} description={`${values.bio.length}/2000 — your routine, hobbies and what you're like to live with.`} required>
                  <Textarea rows={5} {...fieldAria("bio", errors.bio?.message)} {...form.register("bio")} />
                </FormField>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Minimum budget (৳/month)" htmlFor="budgetMin" error={errors.budgetMin?.message}>
                  <Input inputMode="numeric" placeholder="8000" {...fieldAria("budgetMin", errors.budgetMin?.message)} {...form.register("budgetMin")} />
                </FormField>
                <FormField label="Maximum budget (৳/month)" htmlFor="budgetMax" error={errors.budgetMax?.message}>
                  <Input inputMode="numeric" placeholder="15000" {...fieldAria("budgetMax", errors.budgetMax?.message)} {...form.register("budgetMax")} />
                </FormField>
                <FormField label="Preferred location" htmlFor="preferredLocation" error={errors.preferredLocation?.message} required>
                  <Input placeholder="e.g. Gulshan, Dhaka" {...fieldAria("preferredLocation", errors.preferredLocation?.message)} {...form.register("preferredLocation")} />
                </FormField>
                <FormField label="Move-in date" htmlFor="moveInDate" error={errors.moveInDate?.message}>
                  <Input type="date" {...fieldAria("moveInDate", errors.moveInDate?.message)} {...form.register("moveInDate")} />
                </FormField>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                {(
                  [
                    { name: "smoking", label: "I smoke", hint: "Matched against others' lifestyle." },
                    { name: "pets", label: "I have or want pets", hint: "Cats, dogs, birds…" },
                    { name: "isDiscoverable", label: "Show my profile in roommate search", hint: "Turn off to browse privately." },
                  ] as const
                ).map((item) => (
                  <Controller
                    key={item.name}
                    control={form.control}
                    name={item.name}
                    render={({ field }) => (
                      <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
                        <div>
                          <Label htmlFor={item.name}>{item.label}</Label>
                          <p className="text-xs text-muted-foreground">{item.hint}</p>
                        </div>
                        <Switch id={item.name} checked={field.value} onCheckedChange={field.onChange} />
                      </div>
                    )}
                  />
                ))}
                <FormField label="Roommate gender preference" htmlFor="genderPreference" error={errors.genderPreference?.message} description="Optional, e.g. Female, Male or Any.">
                  <Input {...fieldAria("genderPreference", errors.genderPreference?.message)} {...form.register("genderPreference")} />
                </FormField>
              </div>
            )}

            {step === 3 && (
              <Controller
                control={form.control}
                name="preferenceIds"
                render={({ field }) => (
                  <div className="space-y-5">
                    {options.isLoading && <Skeleton className="h-32 w-full" />}
                    {grouped.map(([type, list]) => (
                      <fieldset key={type} className="space-y-2">
                        <legend className="text-sm font-semibold">{type}</legend>
                        <div className="flex flex-wrap gap-2">
                          {list.map((option) => {
                            const checked = field.value.includes(option.id);
                            return (
                              <button
                                key={option.id}
                                type="button"
                                role="checkbox"
                                aria-checked={checked}
                                onClick={() => field.onChange(checked ? field.value.filter((id) => id !== option.id) : [...field.value, option.id])}
                                className={cn(
                                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors hover:border-primary",
                                  checked && "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
                                )}
                              >
                                {checked && <Check className="size-3.5" />} {option.name}
                              </button>
                            );
                          })}
                        </div>
                      </fieldset>
                    ))}
                    {options.isSuccess && options.data.length === 0 && (
                      <p className="text-sm text-muted-foreground">The admin hasn&apos;t published any preference options yet.</p>
                    )}
                  </div>
                )}
              />
            )}

            {step === 4 && (
              <dl className="grid gap-4 rounded-xl bg-muted/50 p-5 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Occupation</dt>
                  <dd className="font-medium">{values.occupation}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Location</dt>
                  <dd className="font-medium">{values.preferredLocation}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Budget</dt>
                  <dd className="font-medium">
                    {values.budgetMin || values.budgetMax ? `${formatCurrency(values.budgetMin || null)} – ${formatCurrency(values.budgetMax || null)}` : "Flexible"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Move-in</dt>
                  <dd className="font-medium">{values.moveInDate ? formatDate(values.moveInDate) : "Flexible"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Lifestyle</dt>
                  <dd className="font-medium">
                    {values.smoking ? "Smoker" : "Non-smoker"} · {values.pets ? "Pet friendly" : "No pets"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Visibility</dt>
                  <dd className="font-medium">{values.isDiscoverable ? "Visible in search" : "Hidden"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">About</dt>
                  <dd className="whitespace-pre-line">{values.bio}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="mb-1 text-muted-foreground">Preferences</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {selectedPrefs.length ? selectedPrefs.map((p) => <span key={p.id} className="rounded-full bg-background px-2.5 py-0.5 text-xs font-medium ring-1 ring-border">{p.name}</span>) : "None selected"}
                  </dd>
                </div>
              </dl>
            )}

            <div className="flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-between">
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
                  <ArrowLeft /> Back
                </Button>
                {isEdit && (
                  <ConfirmDialog
                    trigger={
                      <Button type="button" variant="ghost" className="text-destructive">
                        <Trash2 /> Delete profile
                      </Button>
                    }
                    title="Delete your roommate profile?"
                    description="You'll disappear from roommate search and lose your matches. You can create a new profile any time."
                    confirmLabel="Delete profile"
                    destructive
                    onConfirm={() => remove.mutateAsync()}
                  />
                )}
              </div>
              {step < ROOMMATE_STEPS.length - 1 ? (
                <Button type="submit">
                  Continue <ArrowRight />
                </Button>
              ) : (
                <Button type="submit" disabled={save.isPending}>
                  {save.isPending ? <Loader2 className="animate-spin" /> : <Check />} {isEdit ? "Save changes" : "Create profile"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
