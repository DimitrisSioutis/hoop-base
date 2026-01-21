"use client"

import { AdminLayout, MatchForm } from "@/components/admin"
import type { MatchWithStats } from "@/lib/types"

interface EditMatchClientProps {
  match: MatchWithStats
}

export function EditMatchClient({ match }: EditMatchClientProps) {
  return (
    <AdminLayout>
      <MatchForm match={match} />
    </AdminLayout>
  )
}
