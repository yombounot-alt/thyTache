import { Link } from "react-router-dom"

import { RegisterForm } from "@/components/forms/RegisterForm"

export default function Register() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="font-brand text-2xl font-semibold">Créer votre compte</h1>
        <p className="text-sm text-muted-foreground">
          Rejoignez votre équipe et commencez à organiser vos tâches.
        </p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  )
}
