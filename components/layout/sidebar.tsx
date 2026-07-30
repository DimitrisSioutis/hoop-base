"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"
import {
  VideoIcon,
  UsersIcon,
  TrophyIcon,
  PlusIcon,
  CloseIcon,
  UserIcon,
  SettingsIcon,
  MenuIcon,
  LogoutIcon,
} from "@/components/shared"
import styles from "./sidebar.module.scss"

const getNavItems = (hasLinkedPlayer: boolean) => [
  {
    label: "Main",
    items: [
      { name: "Matches", href: "/matches", icon: "video" },
      ...(hasLinkedPlayer
        ? [{ name: "My Profile", href: "/my-profile", icon: "user" }]
        : []),
      { name: "Players", href: "/players", icon: "users" },
      { name: "Leaderboard", href: "/leaderboard", icon: "trophy" },
    ],
  },
]

const adminItems = [
  {
    label: "Admin",
    items: [
      { name: "Add Match", href: "/admin/matches/new", icon: "plus" },
      { name: "Manage Players", href: "/admin/players", icon: "settings" },
    ],
  },
]

const icons: Record<string, React.ReactNode> = {
  video: <VideoIcon />,
  users: <UsersIcon />,
  trophy: <TrophyIcon />,
  plus: <PlusIcon />,
  settings: <SettingsIcon />,
  menu: <MenuIcon />,
  x: <CloseIcon />,
  logout: <LogoutIcon />,
  user: <UserIcon />,
}

export function Sidebar() {
  const pathname = usePathname()
  const { user, appUser, isAdmin, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const hasLinkedPlayer = !!appUser?.player_id
  const navItems = getNavItems(hasLinkedPlayer)
  const allNavItems = isAdmin ? [...navItems, ...adminItems] : navItems

  const getInitials = (name: string | null) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.open : ""}`}>
        <header className={styles.header}>
          <Link href="/">
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
              </div>
              <span className={styles.logoText}>Hoop Base</span>
            </div>
          </Link>
        </header>

        <nav className={styles.nav}>
          {allNavItems.map((section) => (
            <div key={section.label} className={styles.navSection}>
              <span className={styles.navLabel}>{section.label}</span>
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${pathname === item.href || pathname.startsWith(item.href + "/") ? styles.active : ""}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {icons[item.icon]}
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <footer className={styles.footer}>
          <div className={styles.userCard}>
            <div className={styles.userInfo}>
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata?.avatar_url} alt="" className={styles.avatar} />
              ) : (
                <div className={styles.avatarFallback}>{getInitials(user?.user_metadata?.full_name)}</div>
              )}
              <div className={styles.userDetails}>
                <span className={styles.userName}>{ user?.user_metadata?.full_name || "Guest"}</span>
                <span className={styles.userRole}>{isAdmin ? "Admin" : "Player"}</span>
              </div>
            </div>
            <button className={styles.signOutButton} onClick={signOut} title="Sign out">
              {icons.logout}
            </button>
          </div>
        </footer>
      </aside>

      <div className={styles.mobileToggle}>
        <button className={styles.toggleButton} onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? icons.x : icons.menu}
        </button>
      </div>

      <div className={`${styles.overlay} ${mobileOpen ? styles.visible : ""}`} onClick={() => setMobileOpen(false)} />
    </>
  )
}
