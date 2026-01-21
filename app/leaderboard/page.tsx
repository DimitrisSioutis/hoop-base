"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { LeaderboardContent } from "@/components/leaderboard"
import styles from "./leaderboard.module.scss"

export default function LeaderboardPage() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <LeaderboardContent />
      </main>
    </div>
  )
}
