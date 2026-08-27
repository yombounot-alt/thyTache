import type { ReactElement } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter } from "react-router-dom"
import { render } from "@testing-library/react"

// Enveloppe minimale pour les composants qui dépendent de React Query
// (useMutation/useQuery, même non déclenché au rendu) et/ou de react-router
// (useNavigate, Link...) — la plupart des formulaires de l'app en ont besoin.
export function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  )
}
