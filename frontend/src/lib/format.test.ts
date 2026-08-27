import { describe, expect, it } from "vitest"

import { formatDate, formatDateTime, formatFileSize, formatRelative, initials, isOverdue } from "./format"

describe("formatDate", () => {
  it("formate une date ISO en français", () => {
    expect(formatDate("2026-03-05T10:00:00.000Z")).toBe("5 mars 2026")
  })

  it("retourne un tiret pour une valeur absente", () => {
    expect(formatDate(null)).toBe("—")
    expect(formatDate(undefined)).toBe("—")
  })
})

describe("formatDateTime", () => {
  it("inclut l'heure", () => {
    expect(formatDateTime("2026-03-05T14:30:00.000Z")).toContain("14:30")
  })

  it("retourne un tiret pour une valeur absente", () => {
    expect(formatDateTime(null)).toBe("—")
  })
})

describe("formatRelative", () => {
  it("retourne un tiret pour une valeur absente", () => {
    expect(formatRelative(null)).toBe("—")
  })

  it("retourne une chaîne relative non vide pour une date passée", () => {
    const yesterday = new Date(Date.now() - 24 * 3600_000).toISOString()
    expect(formatRelative(yesterday).length).toBeGreaterThan(0)
  })
})

describe("isOverdue", () => {
  it("est vrai pour une date passée", () => {
    expect(isOverdue(new Date(Date.now() - 1000).toISOString())).toBe(true)
  })

  it("est faux pour une date future", () => {
    expect(isOverdue(new Date(Date.now() + 1000 * 3600).toISOString())).toBe(false)
  })

  it("est faux pour une valeur absente", () => {
    expect(isOverdue(null)).toBe(false)
    expect(isOverdue(undefined)).toBe(false)
  })
})

describe("initials", () => {
  it("prend la première lettre de chaque nom, en majuscule", () => {
    expect(initials("tamba", "yombouno")).toBe("TY")
  })
})

describe("formatFileSize", () => {
  it("affiche en Ko sous 1024", () => {
    expect(formatFileSize(500)).toBe("500 Ko")
  })

  it("affiche en Mo au-delà de 1024 Ko", () => {
    expect(formatFileSize(2048)).toBe("2.0 Mo")
  })
})
