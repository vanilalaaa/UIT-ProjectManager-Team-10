import axiosClient from '../lib/api/axiosClient'
import type { ApiResponse } from '../types/api/common'
import type {
  Team,
  TeamCreateRequest,
  TeamJoinRequestCreate,
  TeamJoinRequestPatch,
  TeamMember,
} from '../types/api/team'

export const createTeam = (
  projectId: number | string,
  payload: TeamCreateRequest,
): Promise<ApiResponse<Team>> =>
  axiosClient.post<ApiResponse<Team>>(`/projects/${projectId}/teams`, payload).then((r) => r.data)

export const requestJoinTeam = (
  teamId: number | string,
  payload: TeamJoinRequestCreate = {},
): Promise<ApiResponse<void>> =>
  axiosClient
    .post<ApiResponse<void>>(`/teams/${teamId}/join-requests`, payload)
    .then((r) => r.data)

export const patchTeamJoinRequest = (
  teamId: number | string,
  requestId: number | string,
  payload: TeamJoinRequestPatch,
): Promise<ApiResponse<void>> =>
  axiosClient
    .put<ApiResponse<void>>(`/teams/${teamId}/join-requests/${requestId}`, payload)
    .then((r) => r.data)

export const listTeamMembers = (
  teamId: number | string,
): Promise<ApiResponse<TeamMember[]>> =>
  axiosClient.get<ApiResponse<TeamMember[]>>(`/teams/${teamId}/members`).then((r) => r.data)
