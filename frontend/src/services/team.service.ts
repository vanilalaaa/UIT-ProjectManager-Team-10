import axiosClient from '../lib/api/axiosClient'
import type { ApiResponse } from '../types/api/common'
import type { Team, TeamMember, TeamCreateRequest } from '../types/api/team'
import { mockCourseMembersMap, mockClassMembers } from '../mocks/tasks.mock'

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

// ----- Chưa có BE: danh sách thành viên lớp + gợi ý/lời mời → giữ mock (flat) -----

const MOCK_DELAY = 300
const resolveMock = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), MOCK_DELAY))

const toMember = (u: {
  userId: number
  name: string
  uid?: string
  email?: string
  userProfile?: { avatarUrl?: string; summary?: string } | null
}): TeamMember => ({
  groupMemberId: null,
  userId: u.userId,
  name: u.name,
  avatar: u.userProfile?.avatarUrl ?? null,
  summary: u.userProfile?.summary ?? null,
  uid: u.uid ?? null,
  email: u.email ?? null,
  isLeader: false,
  status: 'ACTIVE',
})

export const getCourseMembers = (courseId: number | string): Promise<TeamMember[]> =>
  resolveMock((mockCourseMembersMap[Number(courseId)] ?? []).map(toMember))

export type TeamInvitation = {
  id: number
  name: string
  info: string
  avatarUrl: string | null
}

export const getTeamInvitations = (): Promise<TeamInvitation[]> =>
  resolveMock(
    mockClassMembers.slice(4, 12).map((u) => ({
      id: u.userId,
      name: u.name,
      info: u.userProfile?.summary || 'Sinh viên',
      avatarUrl: u.userProfile?.avatarUrl || null,
    })),
  )
