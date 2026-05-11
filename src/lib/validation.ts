import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";

/**
 * Zod schemas wrapped as hooks so the validation messages can use the
 * active locale. Each hook returns a schema memoized against the translator.
 *
 * Why hooks? react-hook-form's `zodResolver` needs the schema at call time
 * inside the component. Building it via `useTranslations` makes the messages
 * follow whatever locale is active.
 */

type T = (key: string, values?: Record<string, string | number>) => string;

function buildLatitude(t: T) {
  return z
    .number()
    .min(-90, t("validation.latOutOfRange"))
    .max(90, t("validation.latOutOfRange"))
    .nullable();
}

function buildLongitude(t: T) {
  return z
    .number()
    .min(-180, t("validation.lngOutOfRange"))
    .max(180, t("validation.lngOutOfRange"))
    .nullable();
}

function buildOptionalNumber(t: T, max: number) {
  return z
    .number({ message: t("validation.numberRequired") })
    .min(0, t("validation.numberNonNegative"))
    .max(max, t("validation.numberMax", { max }))
    .nullable();
}

export function useTripSchema() {
  const t = useTranslations();
  return useMemo(
    () =>
      z
        .object({
          name: z
            .string()
            .trim()
            .min(2, t("validation.nameMin"))
            .max(120, t("validation.nameMax")),
          location_name: z.string().trim().max(200).nullable(),
          latitude: buildLatitude(t as T),
          longitude: buildLongitude(t as T),
          started_at: z
            .string()
            .min(1, t("validation.dateStart"))
            .refine(
              (v) => !Number.isNaN(Date.parse(v)),
              t("validation.dateInvalid"),
            ),
          ended_at: z
            .string()
            .nullable()
            .refine(
              (v) => v === null || v === "" || !Number.isNaN(Date.parse(v)),
              t("validation.dateEndInvalid"),
            ),
          notes: z.string().trim().max(2000).nullable(),
          weather: z.string().trim().max(120).nullable(),
        })
        .refine(
          (data) =>
            !data.ended_at ||
            Date.parse(data.ended_at) >= Date.parse(data.started_at),
          {
            message: t("validation.endBeforeStart"),
            path: ["ended_at"],
          },
        ),
    [t],
  );
}

export type TripFormValues = z.infer<ReturnType<typeof useTripSchema>>;

export function useCatchSchema() {
  const t = useTranslations();
  return useMemo(
    () =>
      z.object({
        species: z
          .string()
          .trim()
          .min(2, t("validation.speciesMin"))
          .max(80, t("validation.speciesMax")),
        weight_kg: buildOptionalNumber(t as T, 500),
        length_cm: buildOptionalNumber(t as T, 500),
        caught_at: z
          .string()
          .min(1, t("validation.dateEnd"))
          .refine(
            (v) => !Number.isNaN(Date.parse(v)),
            t("validation.dateInvalid"),
          ),
        latitude: buildLatitude(t as T),
        longitude: buildLongitude(t as T),
        released: z.boolean(),
        notes: z.string().trim().max(2000).nullable(),
        photo_url: z.string().url(t("validation.urlInvalid")).nullable(),
      }),
    [t],
  );
}

export type CatchFormValues = z.infer<ReturnType<typeof useCatchSchema>>;

export function useLoginSchema() {
  const t = useTranslations();
  return useMemo(
    () =>
      z.object({
        email: z.string().email(t("validation.emailInvalid")),
        password: z
          .string()
          .min(8, t("validation.passwordMin"))
          .max(128, t("validation.passwordMax")),
      }),
    [t],
  );
}

export type LoginFormValues = z.infer<ReturnType<typeof useLoginSchema>>;

export function usePermitLinkSchema() {
  const t = useTranslations();
  return useMemo(
    () =>
      z.object({
        label: z
          .string()
          .trim()
          .min(2, t("validation.labelMin"))
          .max(80, t("validation.labelMax")),
        url: z.string().trim().url(t("validation.urlInvalid")),
      }),
    [t],
  );
}

export type PermitLinkValues = z.infer<ReturnType<typeof usePermitLinkSchema>>;

export function useProfileSchema() {
  const t = useTranslations();
  const permitLink = usePermitLinkSchema();
  return useMemo(
    () =>
      z.object({
        first_name: z
          .string()
          .trim()
          .max(80, t("validation.firstNameMax"))
          .nullable(),
        last_name: z
          .string()
          .trim()
          .max(120, t("validation.lastNameMax"))
          .nullable(),
        fishing_license: z
          .string()
          .trim()
          .max(80, t("validation.licenseMax"))
          .nullable(),
        permit_links: z.array(permitLink),
      }),
    [t, permitLink],
  );
}

export type ProfileFormValues = z.infer<ReturnType<typeof useProfileSchema>>;
