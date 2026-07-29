"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import styles from "./layout.module.scss"

const NO_SIDEBAR_PATHS = ["/login"]

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showSidebar = !NO_SIDEBAR_PATHS.includes(pathname)

  return (
    <div className={styles.layout}>
      {showSidebar && <Sidebar />}
      <main className={`${styles.main} ${showSidebar ? "" : styles.noSidebar}`}>
        {children}
      </main>
    </div>
  )
}
