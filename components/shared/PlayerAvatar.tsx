import { getInitials } from "./utils"
import styles from "./player-avatar.module.scss"

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "xxl" | "xxxl"

interface PlayerAvatarProps {
  avatarUrl: string | null | undefined
  name: string | null | undefined
  size?: AvatarSize
}

export function PlayerAvatar({
  avatarUrl,
  name,
  size
}: PlayerAvatarProps) {
  // No size => percentage-based, fills whatever width its parent gives it (e.g. MatchCard's TeamDisplay)
  const sizeClass = size ? styles[size] : styles.fluid

  if (avatarUrl) {
    return (
      <div className={`${styles.avatar} ${sizeClass}`}>
        <img
          src={avatarUrl}
          alt=""
          title={name ?? undefined}
        />
      </div>
    )
  }

  return (
    <div className={`${styles.avatarFallback} ${sizeClass}`}>
      {getInitials(name ?? null)}
    </div>
  )
}
