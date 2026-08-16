import { SearchIcon, XIcon } from "lucide-react"

import { Input } from "@/components/ui/input"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({ value, onChange, placeholder = "Rechercher...", className }: SearchInputProps) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
          aria-label="Effacer la recherche"
        >
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  )
}
