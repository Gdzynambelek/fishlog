import { z } from "zod";

/**
 * Validation schemas for trip + catch forms. Polish error messages are
 * surfaced inline by react-hook-form.
 *
 * Number fields are stored as `number | null` (nullable) to keep the form
 * input shape and the resolved output shape identical — this avoids a
 * known react-hook-form / zod type-incompatibility when using transforms.
 * The form converts empty strings to null at the input layer.
 */

/**
 * `z.coerce.number()` lets `<input type="number">` strings flow through.
 * Empty strings become `0` after coercion, so the parent form should pass
 * `null` (not `""`) for cleared fields — see CatchForm.onChange handlers.
 */
const optionalCoercedNumber = (max: number) =>
  z
    .number({ message: "Podaj liczbę" })
    .min(0, "Wartość nie może być ujemna")
    .max(max, `Maksymalna wartość: ${max}`)
    .nullable();

const latitude = z
  .number()
  .min(-90, "Szerokość geograficzna poza zakresem")
  .max(90, "Szerokość geograficzna poza zakresem")
  .nullable();

const longitude = z
  .number()
  .min(-180, "Długość geograficzna poza zakresem")
  .max(180, "Długość geograficzna poza zakresem")
  .nullable();

export const tripSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nazwa musi mieć co najmniej 2 znaki")
      .max(120, "Nazwa zbyt długa"),
    location_name: z.string().trim().max(200).nullable(),
    latitude,
    longitude,
    started_at: z
      .string()
      .min(1, "Podaj datę rozpoczęcia")
      .refine((v) => !Number.isNaN(Date.parse(v)), "Nieprawidłowa data"),
    ended_at: z
      .string()
      .nullable()
      .refine(
        (v) => v === null || v === "" || !Number.isNaN(Date.parse(v)),
        "Nieprawidłowa data zakończenia",
      ),
    notes: z.string().trim().max(2000).nullable(),
    weather: z.string().trim().max(120).nullable(),
  })
  .refine(
    (data) =>
      !data.ended_at ||
      Date.parse(data.ended_at) >= Date.parse(data.started_at),
    {
      message: "Zakończenie musi być po rozpoczęciu",
      path: ["ended_at"],
    },
  );

export type TripFormValues = z.infer<typeof tripSchema>;

export const catchSchema = z.object({
  species: z
    .string()
    .trim()
    .min(2, "Podaj gatunek (min. 2 znaki)")
    .max(80, "Nazwa gatunku zbyt długa"),
  weight_kg: optionalCoercedNumber(500),
  length_cm: optionalCoercedNumber(500),
  caught_at: z
    .string()
    .min(1, "Podaj datę złowienia")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Nieprawidłowa data"),
  latitude,
  longitude,
  released: z.boolean(),
  notes: z.string().trim().max(2000).nullable(),
  photo_url: z.string().url().nullable(),
});

export type CatchFormValues = z.infer<typeof catchSchema>;

export const permitLinkSchema = z.object({
  label: z
    .string()
    .trim()
    .min(2, "Etykieta min. 2 znaki")
    .max(80, "Etykieta zbyt długa"),
  url: z.string().trim().url("Nieprawidłowy URL"),
});

export type PermitLinkValues = z.infer<typeof permitLinkSchema>;

export const profileSchema = z.object({
  first_name: z
    .string()
    .trim()
    .max(80, "Imię zbyt długie")
    .nullable(),
  last_name: z
    .string()
    .trim()
    .max(120, "Nazwisko zbyt długie")
    .nullable(),
  fishing_license: z
    .string()
    .trim()
    .max(80, "Numer karty wędkarskiej zbyt długi")
    .nullable(),
  permit_links: z.array(permitLinkSchema),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy adres e-mail"),
  password: z
    .string()
    .min(8, "Hasło musi mieć co najmniej 8 znaków")
    .max(128, "Hasło zbyt długie"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
