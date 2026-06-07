import type { Group, User } from '../../mocks/types'

export type Team = Group
export type TeamMember = User

export type TeamCreateRequest = {
  name: string
  description: string
}

export type TeamJoinRequestCreate = { note?: string }

export type TeamJoinRequestPatch = {
  status: 'APPROVED' | 'REJECTED'
  note?: string
}
