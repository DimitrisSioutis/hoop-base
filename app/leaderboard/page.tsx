"use client"

import { Sidebar } from "@/components/layout/sidebar"
import styles from "./leaderboard.module.scss"
import { LeaderboardContent } from "@/components/leaderboard/LeaderboardContent"

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
