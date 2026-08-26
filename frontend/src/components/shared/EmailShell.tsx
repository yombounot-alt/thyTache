import { APP_NAME } from "@/utils/constants"

interface EmailShellProps {
  preheader: string
  children: React.ReactNode
}

export function EmailShell({ preheader, children }: EmailShellProps) {
  return (
    <div className="mx-auto max-w-lg overflow-hidden rounded-xl border border-border bg-white text-[#0d1420] shadow-sm">
      <div className="bg-[#070b14] px-6 py-5 text-center">
        <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-lg border border-[#c9a227]/40 bg-[#c9a227]/10 font-bold text-[#c9a227]">
          H
        </div>
        <p className="font-brand text-lg font-semibold text-white">{APP_NAME}</p>
      </div>
      <p className="sr-only">{preheader}</p>
      <div className="space-y-4 px-8 py-8 text-sm leading-relaxed text-[#333c4d]">{children}</div>
      <div className="border-t border-[#e2e5ea] bg-[#f6f7fa] px-8 py-4 text-center text-xs text-[#8a93a3]">
        © {new Date().getFullYear()} {APP_NAME} — Tamba Hallo Yombouno. Tous droits réservés.
      </div>
    </div>
  )
}

export function EmailButton({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-2 pb-1 text-center">
      <span className="inline-block rounded-md bg-[#c9a227] px-5 py-2.5 text-sm font-semibold text-[#0a0e17]">
        {children}
      </span>
    </div>
  )
}

export function EmailHeading({ children }: { children: React.ReactNode }) {
  return <h1 className="text-lg font-semibold text-[#0d1420]">{children}</h1>
}
