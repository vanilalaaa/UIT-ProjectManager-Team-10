import axiosClient from '../lib/api/axiosClient'
import type { ApiResponse } from '../types/api/common'
import type { Team, TeamMember, TeamCreateRequest } from '../types/api/team'

const base = (courseId: number | string) => `/courses/${courseId}/groups`

// ----- Nhóm / thành viên: API thật (GroupController) -----

export const getMyGroup = (courseId: number | string): Promise<Team | null> =>
  axiosClient.get<ApiResponse<Team | null>>(`${base(courseId)}/me`).then((r) => r.data.data)

export const getGroupById = (groupId: number | string): Promise<Team | null> =>
  axiosClient
    .get<ApiResponse<Team>>(`/groups/${groupId}`)
    .then((r) => r.data.data)
    .catch(() => null)

export const getCourseGroups = (courseId: number | string): Promise<Team[]> =>
  axiosClient.get<ApiResponse<Team[]>>(base(courseId)).then((r) => r.data.data)

export const getGroupMembers = (
  courseId: number | string,
  groupId: number | string,
  status?: 'ACTIVE' | 'PENDING',
): Promise<TeamMember[]> =>
  axiosClient
    .get<ApiResponse<TeamMember[]>>(`${base(courseId)}/${groupId}/members`, {
      params: status ? { status } : undefined,
    })
    .then((r) => r.data.data)

export const getJoinRequests = (
  courseId: number | string,
  groupId: number | string,
): Promise<TeamMember[]> =>
  axiosClient
    .get<ApiResponse<TeamMember[]>>(`${base(courseId)}/${groupId}/join-requests`)
    .then((r) => r.data.data)

export const createTeam = (
  courseId: number | string,
  payload: TeamCreateRequest,
): Promise<Team> =>
  axiosClient.post<ApiResponse<Team>>(base(courseId), payload).then((r) => r.data.data)

export const updateTeam = (
  courseId: number | string,
  groupId: number | string,
  payload: TeamCreateRequest,
): Promise<Team> =>
  axiosClient.put<ApiResponse<Team>>(`${base(courseId)}/${groupId}`, payload).then((r) => r.data.data)

export const deleteTeam = (courseId: number | string, groupId: number | string): Promise<void> =>
  axiosClient.delete(`${base(courseId)}/${groupId}`).then(() => undefined)

export const requestJoinTeam = (
  courseId: number | string,
  groupId: number | string,
): Promise<void> =>
  axiosClient.post(`${base(courseId)}/${groupId}/join`).then(() => undefined)

export const reviewJoinRequest = (
  courseId: number | string,
  groupId: number | string,
  userId: number | string,
  approve: boolean,
): Promise<void> =>
  axiosClient
    .put(`${base(courseId)}/${groupId}/members/${userId}/review`, null, { params: { approve } })
    .then(() => undefined)

export const transferLeader = (
  courseId: number | string,
  groupId: number | string,
  newLeaderId: number,
): Promise<Team> =>
  axiosClient
    .post<ApiResponse<Team>>(`${base(courseId)}/${groupId}/transfer-leader`, { newLeaderId })
    .then((r) => r.data.data)

export const removeMember = (
  courseId: number | string,
  groupId: number | string,
  userId: number | string,
): Promise<void> =>
  axiosClient.post(`${base(courseId)}/${groupId}/members/${userId}/remove`).then(() => undefined)

export const leaveGroup = (
  courseId: number | string,
  groupId: number | string,
): Promise<void> =>
  axiosClient.post(`${base(courseId)}/${groupId}/leave`).then(() => undefined)

// ----- Mời thành viên / lời mời (API thật) -----

// Sinh viên đã tham gia lớp (để trưởng nhóm chọn mời + màn Thành viên lớp).
export const getCourseMembers = (courseId: number | string): Promise<TeamMember[]> =>
  axiosClient.get<ApiResponse<TeamMember[]>>(`${base(courseId)}/classmates`).then((r) => r.data.data)

export const getInviteCandidates = (courseId: number | string): Promise<TeamMember[]> =>
  axiosClient.get<ApiResponse<TeamMember[]>>(`${base(courseId)}/invite-candidates`).then((r) => r.data.data)

export const inviteMember = (
  courseId: number | string,
  groupId: number | string,
  userId: number,
): Promise<void> =>
  axiosClient.post(`${base(courseId)}/${groupId}/invite`, { userId }).then(() => undefined)

export type Invitation = {
  groupMemberId: number
  groupId: number
  groupName: string
  courseId: number
  courseName: string
  leaderName: string
  memberCount: number
}

export const getMyInvitations = (): Promise<Invitation[]> =>
  axiosClient.get<ApiResponse<Invitation[]>>('/students/me/invitations').then((r) => r.data.data)

export const acceptInvitation = (groupMemberId: number | string): Promise<void> =>
  axiosClient.post(`/students/me/invitations/${groupMemberId}/accept`).then(() => undefined)

export const declineInvitation = (groupMemberId: number | string): Promise<void> =>
  axiosClient.post(`/students/me/invitations/${groupMemberId}/decline`).then(() => undefined)
