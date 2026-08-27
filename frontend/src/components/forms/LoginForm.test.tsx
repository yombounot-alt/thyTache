import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { renderWithProviders } from "@/test/renderWithProviders"
import { LoginForm } from "./LoginForm"

describe("LoginForm", () => {
  it("affiche les champs email, mot de passe et le bouton de connexion", () => {
    renderWithProviders(<LoginForm />)

    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Mot de passe")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /se connecter/i })).toBeInTheDocument()
  })

  it("affiche une erreur de validation si le mot de passe est vide", async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)

    await user.type(screen.getByLabelText("Email"), "user@example.com")
    await user.click(screen.getByRole("button", { name: /se connecter/i }))

    expect(await screen.findByText("Le mot de passe est requis")).toBeInTheDocument()
  })

  it("affiche une erreur de validation pour un email invalide", async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)

    await user.type(screen.getByLabelText("Email"), "pas-un-email")
    await user.type(screen.getByLabelText("Mot de passe"), "MotDePasse123!")
    await user.click(screen.getByRole("button", { name: /se connecter/i }))

    expect(await screen.findByText("Adresse email invalide")).toBeInTheDocument()
  })

  it("bascule l'affichage du mot de passe en clair", async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm />)

    const passwordInput = screen.getByLabelText("Mot de passe")
    expect(passwordInput).toHaveAttribute("type", "password")

    await user.click(screen.getByLabelText("Afficher le mot de passe"))
    await waitFor(() => expect(passwordInput).toHaveAttribute("type", "text"))
  })
})
