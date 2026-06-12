// Nhóm + thành viên dạng phẳng theo BE GroupResponse/GroupMemberResponse.
export type TeamMember = {
  groupMemberId: number | null
  userId: number
  name: string
  avatar: string | null
  summary: string | null
  uid: string | null
  email: string | null
  isLeader: boolean
  status: string
}

export type Team = {
  groupId: number
  name: string
  description: string
  courseId: number | null
  leaderId: number | null
  leaderName: string | null
  members: TeamMember[]
  memberCount: number
}

export type TeamCreateRequest = {
  name: string
  description: string
}
