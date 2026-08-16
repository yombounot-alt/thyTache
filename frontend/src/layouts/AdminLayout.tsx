import { Outlet, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"

import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { MobileNav } from "@/components/layout/MobileNav"
import { Topbar } from "@/components/layout/Topbar"

export function AdminLayout() {
  const location = useLocation()

  return (
    <div className="flex min-h-svh bg-background">
      <AdminSidebar />
      <MobileNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
