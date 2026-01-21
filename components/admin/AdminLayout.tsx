"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { useAuth } from "@/lib/hooks/use-auth"
import Link from "next/link"
import { BannedIcon } from "@/components/shared"
import styles from "./admin-layout.module.scss"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isAdmin, loading: authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className={styles.layout}>
        <Sidebar />
        <main className={styles.main}>
          <p>Loading...</p>
        </main>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className={styles.layout}>
        <Sidebar />
        <main className={styles.main}>
          <div className={styles.unauthorized}>
            <BannedIcon />
            <h1>Access Denied</h1>
            <p>You need admin privileges to access this page.</p>
            <Link href="/matches">Go to Matches</Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}
