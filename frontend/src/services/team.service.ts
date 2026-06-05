import axiosClient from '../lib/api/axiosClient'
import type { ApiResponse } from '../types/api/common'
import type {
  Team,
  TeamCreateRequest,
  TeamJoinRequestPatch,
  TeamMember,
} from '../types/api/team'

const base = (courseId: number | string) => `/courses/${courseId}/groups`

export const listTeams = (courseId: number | string): Promise<ApiResponse<Team[]>> =>
  axiosClient.get<ApiResponse<Team[]>>(base(courseId)).then((r) => r.data)

export const getTeamById = (
  courseId: number | string,
  teamId: number | string,
): Promise<ApiResponse<Team>> =>
  axiosClient.get<ApiResponse<Team>>(`${base(courseId)}/${teamId}`).then((r) => r.data)

export const createTeam = (
  courseId: number | string,
  payload: TeamCreateRequest,
): Promise<ApiResponse<Team>> =>
  axiosClient.post<ApiResponse<Team>>(base(courseId), payload).then((r) => r.data)

export const updateTeam = (
  courseId: number | string,
  teamId: number | string,
  payload: TeamCreateRequest,
): Promise<ApiResponse<Team>> =>
  axiosClient.put<ApiResponse<Team>>(`${base(courseId)}/${teamId}`, payload).then((r) => r.data)

export const deleteTeam = (
  courseId: number | string,
  teamId: number | string,
): Promise<ApiResponse<void>> =>
  axiosClient.delete<ApiResponse<void>>(`${base(courseId)}/${teamId}`).then((r) => r.data)

export const requestJoinTeam = (
  courseId: number | string,
  teamId: number | string,
): Promise<ApiResponse<void>> =>
  axiosClient.post<ApiResponse<void>>(`${base(courseId)}/${teamId}/join`).then((r) => r.data)

export const listTeamJoinRequests = (
  courseId: number | string,
  teamId: number | string,
): Promise<ApiResponse<TeamMember[]>> =>
  axiosClient
    .get<ApiResponse<TeamMember[]>>(`${base(courseId)}/${teamId}/join-requests`)
    .then((r) => r.data)

export const reviewTeamJoinRequest = (
  courseId: number | string,
  teamId: number | string,
  memberId: number | string,
  payload: TeamJoinRequestPatch,
): Promise<ApiResponse<void>> =>
  axiosClient
    .put<ApiResponse<void>>(
      `${base(courseId)}/${teamId}/members/${memberId}/review`,
      payload,
    )
    .then((r) => r.data)

export const listTeamMembers = (
  courseId: number | string,
  teamId: number | string,
  status?: 'ACTIVE' | 'PENDING',
): Promise<ApiResponse<TeamMember[]>> =>
  axiosClient
    .get<ApiResponse<TeamMember[]>>(`${base(courseId)}/${teamId}/members`, {
      params: status ? { status } : undefined,
    })
    .then((r) => r.data)
