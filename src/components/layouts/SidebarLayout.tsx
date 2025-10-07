import type { ReactNode } from "react"
import Header from "../Header"

interface SidebarLayoutProps {
  children: ReactNode
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-gradient-to-b from-gray-50 to-white">
      {/* Header Component */}
      <Header />

      {/* Page content */}
      <main className="w-full px-6 md:px-12 pb-12">{children}</main>
    </div>
  )
}
