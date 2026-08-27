import { render, screen } from "@testing-library/react"
import { CheckIcon } from "lucide-react"
import { describe, expect, it } from "vitest"

import { StatCard } from "./StatCard"

describe("StatCard", () => {
  it("affiche le label et la valeur", () => {
    render(<StatCard label="Total des tâches" value={42} icon={CheckIcon} />)

    expect(screen.getByText("Total des tâches")).toBeInTheDocument()
    expect(screen.getByText("42")).toBeInTheDocument()
  })

  it("affiche le hint quand il est fourni", () => {
    render(<StatCard label="Terminées" value={3} icon={CheckIcon} hint="+2 cette semaine" />)
    expect(screen.getByText("+2 cette semaine")).toBeInTheDocument()
  })

  it("n'affiche rien de plus quand hint est absent", () => {
    render(<StatCard label="Terminées" value={3} icon={CheckIcon} />)
    expect(screen.queryByText(/cette semaine/)).not.toBeInTheDocument()
  })

  it("accepte une valeur textuelle", () => {
    render(<StatCard label="Taux" value="87%" icon={CheckIcon} />)
    expect(screen.getByText("87%")).toBeInTheDocument()
  })
})
