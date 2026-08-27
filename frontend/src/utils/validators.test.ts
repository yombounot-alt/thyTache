import { describe, expect, it } from "vitest"

import { emailSchema, otpSchema, passwordSchema } from "./validators"

describe("emailSchema", () => {
  it("accepte une adresse valide", () => {
    expect(emailSchema.safeParse("user@example.com").success).toBe(true)
  })

  it("rejette une adresse invalide", () => {
    expect(emailSchema.safeParse("pas-un-email").success).toBe(false)
  })

  it("rejette une chaîne vide", () => {
    expect(emailSchema.safeParse("").success).toBe(false)
  })
})

describe("passwordSchema", () => {
  it("accepte un mot de passe respectant toutes les règles", () => {
    expect(passwordSchema.safeParse("MotDePasse123!").success).toBe(true)
  })

  it("rejette un mot de passe trop court", () => {
    expect(passwordSchema.safeParse("Aa1!").success).toBe(false)
  })

  it("rejette un mot de passe sans majuscule", () => {
    expect(passwordSchema.safeParse("motdepasse123!").success).toBe(false)
  })

  it("rejette un mot de passe sans caractère spécial", () => {
    expect(passwordSchema.safeParse("MotDePasse123").success).toBe(false)
  })
})

describe("otpSchema", () => {
  it("accepte un code à 6 chiffres", () => {
    expect(otpSchema.safeParse("123456").success).toBe(true)
  })

  it("rejette un code de mauvaise longueur", () => {
    expect(otpSchema.safeParse("12345").success).toBe(false)
  })

  it("rejette un code non numérique", () => {
    expect(otpSchema.safeParse("12a456").success).toBe(false)
  })
})
