import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  header?: React.ReactNode
  metrics?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function DashboardLayout({ header, metrics, children, className }: DashboardLayoutProps) {
  return (
    <div className={cn("flex flex-col h-screen bg-canvas text-ink", className)}>
      {header && (
        <header className="flex items-center justify-between px-4 h-12 border-b border-border bg-panel shrink-0">
          {header}
        </header>
      )}

      {metrics && (
        <div className="grid grid-cols-4 gap-px border-b border-border bg-border shrink-0">
          {metrics}
        </div>
      )}

      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
