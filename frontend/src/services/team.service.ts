import axiosClient from '../lib/api/axiosClient'
import type { ApiResponse } from '../types/api/common'
import type {
  Team,
  TeamCreateRequest,
  TeamJoinRequestPatch,
  TeamMember,
} from '../types/api/team'
import type { Group, User } from '../mocks/types'
import {
  groupPhoenix,
  groupAster,
  groupNimbus,
  groupOrion,
  mockMyGroupMap,
  mockCourseGroupsMap,
  mockCourseMembersMap,
  mockTeamRequestsMap,
} from '../mocks/tasks.mock'

const base = (courseId: number | string) => `/courses/${courseId}/groups`

// Mock fallback (PROJECT_RULES §3): các màn team/group cần Group/User giàu
// (members + profile + tasks). BE GroupResponse/GroupMemberResponse hiện phẳng.
// TODO(BE): enrich rồi thay bằng listTeams/listTeamMembers ở trên.
const MOCK_DELAY = 300
const resolveMock = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), MOCK_DELAY))
const ALL_GROUPS = [groupPhoenix, groupAster, groupNimbus, groupOrion]

export const getAllGroups = (): Promise<Group[]> => resolveMock(ALL_GROUPS)

export const getGroupById = (groupId: number | string): Promise<Group | null> =>
  resolveMock(ALL_GROUPS.find((g) => g.groupId === Number(groupId)) ?? null)

export const getMyGroup = (courseId: number | string): Promise<Group | null> =>
  resolveMock(mockMyGroupMap[Number(courseId)] ?? null)

export const getCourseGroups = (courseId: number | string): Promise<Group[]> =>
  resolveMock(mockCourseGroupsMap[Number(courseId)] ?? [])

export const getCourseMembers = (courseId: number | string): Promise<User[]> =>
  resolveMock(mockCourseMembersMap[Number(courseId)] ?? [])

export const getTeamRequests = (courseId: number | string): Promise<User[]> =>
  resolveMock(mockTeamRequestsMap[Number(courseId)] ?? [])

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
