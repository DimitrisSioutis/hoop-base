import styles from "./empty-state.module.scss"

interface EmptyStateProps {
  icon: React.ReactNode
  title?: string
  message: string
  large?: boolean
  gridSpan?: boolean
}

export function EmptyState({ icon, title, message, large = false, gridSpan = false }: EmptyStateProps) {
  const classNames = [
    styles.emptyState,
    large && styles.large,
    gridSpan && styles.gridSpan,
  ].filter(Boolean).join(" ")

  return (
    <div className={classNames}>
      {icon}
      {title && <h3>{title}</h3>}
      <p>{message}</p>
    </div>
  )
}
