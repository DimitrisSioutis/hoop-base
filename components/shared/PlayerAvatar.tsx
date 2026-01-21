import { getInitials } from "./utils"
import styles from "./player-avatar.module.scss"

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | "xxxl"

interface PlayerAvatarProps {
  avatarUrl: string | null | undefined
  name: string | null | undefined
  size?: AvatarSize
  stacked?: boolean
  className?: string
}

export function PlayerAvatar({
  avatarUrl,
  name,
  size = "md",
  stacked = false,
  className = ""
}: PlayerAvatarProps) {
  const sizeClass = styles[size]
  const stackedClass = stacked ? styles.stacked : ""

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`${styles.avatar} ${sizeClass} ${stackedClass} ${className}`.trim()}
      />
    )
  }

  return (
    <div className={`${styles.avatarFallback} ${sizeClass} ${stackedClass} ${className}`.trim()}>
      {getInitials(name ?? null)}
    </div>
  )
}
