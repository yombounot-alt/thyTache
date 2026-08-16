import { Link } from "react-router-dom"

import { LoginForm } from "@/components/forms/LoginForm"

export default function Login() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="font-brand text-2xl font-semibold">Content de vous revoir</h1>
        <p className="text-sm text-muted-foreground">
          Connectez-vous pour accéder à votre espace de travail.
        </p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Créer un compte
        </Link>
      </p>
    </div>
  )
}
