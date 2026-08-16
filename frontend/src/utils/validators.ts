import { z } from "zod"

export const emailSchema = z
  .string()
  .min(1, "L'email est requis")
  .email("Adresse email invalide")

export const passwordSchema = z
  .string()
  .min(8, "8 caractères minimum")
  .regex(/[A-Z]/, "Une majuscule minimum")
  .regex(/[a-z]/, "Une minuscule minimum")
  .regex(/[0-9]/, "Un chiffre minimum")
  .regex(/[^\da-zA-Z\s]/, "Un caractère spécial minimum")

export const otpSchema = z
  .string()
  .length(6, "Le code doit contenir 6 chiffres")
  .regex(/^\d+$/, "Le code ne doit contenir que des chiffres")
