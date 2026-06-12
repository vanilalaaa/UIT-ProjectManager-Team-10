export type RegistrationMember = {
  id: number
  name: string
  avatar: string | null
}

// 1 yêu cầu đăng ký đề tài (nhóm ↔ đề tài) cho màn duyệt của giảng viên.
export type PendingRegistration = {
  registrationId: number
  projectId: number
  projectTitle: string
  projectDescription: string
  groupId: number
  groupName: string
  leaderName: string
  leaderAvatar: string | null
  members: RegistrationMember[]
  status: string
  registeredAt: string | null
}
