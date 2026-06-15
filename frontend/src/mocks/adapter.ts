
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'

import { MOCK_CREDENTIALS, MOCK_LOGIN_RESPONSES, MOCK_ME_RESPONSES } from './auth.mock'
import {
  aiCategory,
  databaseCourse,
  dataCategory,
  dataStructureCourse,
  machineLearningCourse,
  mobileCategory,
  mobileDevCourse,
  mockProjectRequests,
  mockProjects,
  projectManagementCourse,
  softwareEngineeringCourse,
  toolCategory,
  webCategory,
  webDevCourse,
} from './projects.mock'
import {
  mockAllStudents,
  mockCourseGroupsMap,
  mockCourseMembersMap,
  mockCourseRequirements,
  mockMyGroupMap,
  mockTasks,
  mockTeamRequestsMap,
  userSinhVienTran,
} from './tasks.mock'
import type { Category, Course, Group, Project, Role, User } from './types'

// Trùng với TOKEN_KEY trong axiosClient — khai báo lại để tránh import vòng.
const TOKEN_KEY = 'accessToken'

// ── Hằng số / lookup ─────────────────────────────────────────────────────────

const MOCK_DELAY = 200

const COURSES: Course[] = [
  softwareEngineeringCourse,
  projectManagementCourse,
  webDevCourse,
  mobileDevCourse,
  machineLearningCourse,
  dataStructureCourse,
  databaseCourse,
]

const CATEGORIES: Category[] = [webCategory, mobileCategory, aiCategory, dataCategory, toolCategory]

const ALL_GROUPS: Group[] = Object.values(mockCourseGroupsMap).flat()

const courseById = (id: number): Course | null =>
  COURSES.find((c) => c.courseId === id) ?? null

const groupById = (id: number): Group | null =>
  ALL_GROUPS.find((g) => g.groupId === id) ?? null

const projectGroupId = (p: Project): number | null => p.registrations[0]?.groupId ?? null

const projectByGroupId = (groupId: number): Project | null =>
  mockProjects.find((p) => p.registrations.some((r) => r.groupId === groupId)) ?? null

const projectById = (id: number): Project | null =>
  mockProjects.find((p) => p.projectId === id) ?? null

// Nhóm của sinh viên đang đăng nhập (theo từng lớp) — non-null values.
const MY_GROUPS: Group[] = Object.values(mockMyGroupMap).filter((g): g is Group => g != null)
const MY_GROUP_IDS = MY_GROUPS.map((g) => g.groupId)

// Tách "SE330 - Công nghệ phần mềm" => code "SE330", tên hiển thị phần sau.
const splitCode = (fullName: string): { code: string; name: string } => {
  const [code, ...rest] = fullName.split(' - ')
  return { code: code.trim(), name: rest.join(' - ').trim() || fullName }
}

// ── Phiên đăng nhập hiện tại (suy ra từ token mock) ──────────────────────────

const currentRole = (): Role => {
  const token = (typeof localStorage !== 'undefined' && localStorage.getItem(TOKEN_KEY)) || ''
  if (token.includes('admin')) return 'ADMIN'
  if (token.includes('teacher')) return 'TEACHER'
  return 'STUDENT'
}

const currentEmail = (): string => {
  const role = currentRole()
  return role === 'ADMIN' ? 'admin@gmail.com' : role === 'TEACHER' ? 'teacher@gmail.com' : 'student@gmail.com'
}

// Persona sinh viên duy nhất phục vụ các endpoint /students/me & /home.
const currentStudent = (): User => userSinhVienTran

// ── Mappers entity → DTO ─────────────────────────────────────────────────────

const toUserLite = (u: User) => ({
  id: u.userId,
  name: u.name,
  avatar: u.userProfile?.avatarUrl || null,
})

const toTeamMember = (u: User, group: Group | null) => ({
  groupMemberId: u.userId,
  userId: u.userId,
  name: u.name,
  avatar: u.userProfile?.avatarUrl || null,
  summary: u.userProfile?.summary ?? null,
  uid: u.uid,
  email: u.email,
  isLeader: group ? group.leader.userId === u.userId : false,
  status: 'APPROVED',
})

const toTeam = (group: Group) => {
  const proj = projectByGroupId(group.groupId)
  return {
    groupId: group.groupId,
    name: group.name,
    description: group.description,
    courseId: group.course?.courseId ?? null,
    leaderId: group.leader?.userId ?? null,
    leaderName: group.leader?.name ?? null,
    members: group.members.map((m) => toTeamMember(m, group)),
    memberCount: group.members.length,
    projectStatus: proj?.status ?? null,
    projectTitle: proj?.title ?? null,
  }
}

const toProjectDto = (p: Project) => {
  const gid = projectGroupId(p)
  const group = gid != null ? groupById(gid) : null
  return {
    projectId: p.projectId,
    title: p.title,
    description: p.description,
    status: p.status,
    startDate: p.startDate ?? null,
    endDate: p.endDate ?? null,
    courseId: p.course?.courseId ?? null,
    courseName: p.course?.name ?? null,
    lecturerName: p.course?.lecturer?.name ?? null,
    categoryId: p.category?.categoryId ?? null,
    categoryName: p.category?.name ?? null,
    groupId: gid,
    groupName: group?.name ?? null,
    members: (group?.members ?? []).map((m) => ({
      id: m.userId,
      name: m.name,
      avatar: m.userProfile?.avatarUrl || null,
    })),
    submissions: p.submissions.map((s) => ({
      submissionId: s.submissionId,
      status: s.status,
      submittedAt: s.submittedAt ?? null,
      filePath: s.filePath ?? null,
    })),
    memberCount: group?.members.length ?? 0,
    submissionCount: p.submissions.length,
  }
}

const toTaskDto = (t: (typeof mockTasks)[number]) => ({
  taskId: t.taskId,
  title: t.title,
  description: t.description,
  status: t.status,
  assignee: t.assignedTo ? toUserLite(t.assignedTo) : null,
  createdBy: t.createdBy ? toUserLite(t.createdBy) : null,
  groupId: t.group?.groupId ?? null,
  deadline: t.deadline ?? null,
  createdAt: t.createdAt,
  updatedAt: t.updatedAt ?? null,
  priority: t.priority,
})

const toCourseCard = (c: Course) => {
  const { code, name } = splitCode(c.name)
  return {
    courseId: c.courseId,
    code,
    name,
    lecturerName: c.lecturer?.name ?? '',
    membersCount: mockCourseMembersMap[c.courseId]?.length ?? 0,
    projectsCount: mockProjects.filter((p) => p.course?.courseId === c.courseId).length,
    maxStudents: c.maxStudents,
    startDate: c.startDate,
    endDate: c.endDate,
  }
}

const toCourseResponse = (c: Course) => {
  const { code } = splitCode(c.name)
  return {
    courseId: c.courseId,
    code,
    name: c.name,
    lecturer: c.lecturer?.userId ?? null,
    lecturerName: c.lecturer?.name ?? null,
    maxStudents: c.maxStudents,
    startDate: c.startDate,
    endDate: c.endDate,
  }
}

const toPendingRegistration = (req: (typeof mockProjectRequests)[number]) => ({
  registrationId: req.requestId,
  projectId: req.requestId,
  projectTitle: req.title,
  projectDescription: req.description,
  groupId: req.requestId,
  groupName: req.groupName,
  leaderName: req.leader.name,
  leaderAvatar: req.leader.userProfile?.avatarUrl || null,
  members: req.members.map((m) => ({
    id: m.userId,
    name: m.name,
    avatar: m.userProfile?.avatarUrl || null,
  })),
  status: 'PENDING',
  registeredAt: req.submittedAt,
})

// Đoán category cho yêu cầu đồ án của lớp dựa trên đồ án đầu tiên của lớp đó.
const requirementForCourse = (courseId: number) => {
  const req = mockCourseRequirements[courseId]
  const sampleProject = mockProjects.find((p) => p.course?.courseId === courseId)
  return {
    categoryId: sampleProject?.category?.categoryId ?? null,
    categoryName: sampleProject?.category?.name ?? '',
    description: req?.description ?? '',
    deadline: req?.deadline ?? '',
    criteria: [
      { id: 1, name: 'Chức năng & hoàn thiện sản phẩm', maxScore: 5 },
      { id: 2, name: 'Chất lượng mã nguồn & kiến trúc', maxScore: 3 },
      { id: 3, name: 'Báo cáo & thuyết trình', maxScore: 2 },
    ],
  }
}

// ── Home feed & stats ────────────────────────────────────────────────────────

const buildFeed = () => {
  const role = currentRole()
  const taskItems = mockTasks.map((t) => ({
    type: 'TASK' as const,
    referenceId: t.taskId,
    title: t.title,
    description: t.description,
    status: t.status,
    projectId: projectByGroupId(t.group.groupId)?.projectId ?? null,
    courseId: t.group.course?.courseId ?? null,
    projectTitle: projectByGroupId(t.group.groupId)?.title ?? null,
    actorName: t.assignedTo?.name ?? 'Hệ thống',
    actorAvatar: t.assignedTo?.userProfile?.avatarUrl || null,
    timestamp: t.updatedAt ?? t.createdAt,
  }))

  const submissionItems = mockProjects.flatMap((p) =>
    p.submissions.map((s) => ({
      type: 'SUBMISSION' as const,
      referenceId: s.submissionId,
      title: `Nộp bài: ${p.title}`,
      description: s.filePath,
      status: s.status,
      projectId: p.projectId,
      courseId: p.course?.courseId ?? null,
      projectTitle: p.title,
      actorName: p.course?.lecturer?.name ?? 'Nhóm đồ án',
      actorAvatar: null,
      timestamp: s.submittedAt,
    })),
  )

  const proposalItems = mockProjectRequests.map((req) => ({
    type: 'PROJECT_PROPOSAL' as const,
    referenceId: req.requestId,
    title: `Đề xuất đề tài: ${req.title}`,
    description: req.description,
    status: 'PENDING',
    projectId: null,
    courseId: null,
    projectTitle: req.title,
    actorName: req.leader.name,
    actorAvatar: req.leader.userProfile?.avatarUrl || null,
    timestamp: req.submittedAt,
  }))

  const items =
    role === 'TEACHER'
      ? [...submissionItems, ...proposalItems, ...taskItems]
      : [...taskItems, ...submissionItems]

  return items.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
}

const buildStats = (): Record<string, number> => {
  const role = currentRole()
  if (role === 'TEACHER') {
    const submissions = mockProjects.flatMap((p) => p.submissions)
    return {
      pendingGrades: submissions.filter((s) => s.status !== 'GRADED').length,
      totalProjects: mockProjects.length,
      pendingRequests: mockProjectRequests.length,
      upcomingDeadlines: COURSES.length,
    }
  }
  const myTasks = mockTasks.filter((t) => MY_GROUP_IDS.includes(t.group.groupId))
  return {
    completed: myTasks.filter((t) => t.status === 'DONE').length,
    updated: myTasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'REVIEW').length,
    created: myTasks.length,
    dueSoon: myTasks.filter((t) => t.status !== 'DONE').length,
  }
}

const buildStatDetail = () => {
  const feed = buildFeed()
  return feed.slice(0, 8).map((f) => ({
    id: f.referenceId,
    type: (f.type === 'PROJECT_PROPOSAL' ? 'REQUEST' : f.type) as 'TASK' | 'PROJECT' | 'SUBMISSION' | 'REQUEST',
    title: f.title,
    subtitle: f.projectTitle ?? null,
    status: f.status ?? null,
    timestamp: f.timestamp,
  }))
}

// ── Notifications ────────────────────────────────────────────────────────────

const NOTIFICATIONS = [
  {
    id: 1,
    type: 'PROJECT_PROPOSAL',
    title: 'Đề tài mới chờ duyệt',
    message: 'Nhóm 06 - BigData vừa gửi đề xuất đề tài "Hệ thống Data Engineering cho E-commerce".',
    courseId: 5,
    projectId: null,
    isRead: false,
    createdAt: '2026-06-12T14:05:00',
  },
  {
    id: 2,
    type: 'SUBMISSION',
    title: 'Có bài nộp mới',
    message: 'Nhóm 01 - Phoenix đã nộp tài liệu SRS cho đồ án SE330.',
    courseId: 1,
    projectId: 1,
    isRead: false,
    createdAt: '2026-06-10T09:30:00',
  },
  {
    id: 3,
    type: 'TASK',
    title: 'Task sắp tới hạn',
    message: 'Task "Thiết kế API danh sách đồ án" sẽ tới hạn trong 2 ngày.',
    courseId: 1,
    projectId: 1,
    isRead: true,
    createdAt: '2026-06-08T08:00:00',
  },
]

// ── Admin users ──────────────────────────────────────────────────────────────

const adminUserList = () => {
  const lecturers: User[] = []
  for (const c of COURSES) {
    if (c.lecturer && !lecturers.some((l) => l.userId === c.lecturer!.userId)) {
      lecturers.push(c.lecturer)
    }
  }
  const toItem = (u: User, roleOverride?: Role) => ({
    id: u.userId,
    uid: u.uid,
    email: u.email,
    name: u.name,
    role: roleOverride ?? u.role,
    isActive: u.isActive,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  })
  const admin = {
    id: 1000,
    uid: 'AD001',
    email: 'admin@gmail.com',
    name: 'Admin Hệ thống',
    role: 'ADMIN' as Role,
    isActive: true,
    createdAt: '2025-08-01T08:00:00',
    updatedAt: null,
  }
  // Giảng viên trong mock mang role 'ADMIN' nhưng đại diện cho TEACHER.
  return [admin, ...lecturers.map((l) => toItem(l, 'TEACHER')), ...mockAllStudents.map((s) => toItem(s))]
}

// ── Helpers wrap / fail ──────────────────────────────────────────────────────

const wrap = <T>(data: T) => ({
  status: 'success' as const,
  message: 'Call API success.',
  data,
  errorCode: null,
  timestamp: new Date().toISOString(),
})

const ok = <T>(data: T, config: InternalAxiosRequestConfig): AxiosResponse =>
  ({
    data: wrap(data),
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  }) as AxiosResponse

const fail = (status: number, message: string, config: InternalAxiosRequestConfig): AxiosError =>
  new AxiosError(message, String(status), config, null, {
    status,
    statusText: 'Error',
    headers: {},
    config,
    data: { message, errorCode: 'MOCK_ERROR' },
  } as AxiosResponse)

const num = (s: string | undefined): number => Number(s)

const param = (config: InternalAxiosRequestConfig, key: string): string | undefined => {
  const v = config.params?.[key]
  return v == null ? undefined : String(v)
}

// ── Bảng route ───────────────────────────────────────────────────────────────

type Handler = (m: RegExpMatchArray, config: InternalAxiosRequestConfig) => unknown
type Route = { method: string; re: RegExp; handler: Handler }

const routes: Route[] = [
  // Auth
  {
    method: 'post',
    re: /^\/auth\/login$/,
    handler: (_m, config) => {
      const body = (config.data ? JSON.parse(config.data as string) : {}) as {
        email?: string
        password?: string
      }
      const email = body.email ?? ''
      const cred = MOCK_CREDENTIALS[email]
      if (!cred || cred.password !== body.password) {
        throw fail(401, 'Email hoặc mật khẩu không đúng.', config)
      }
      return MOCK_LOGIN_RESPONSES[email].data
    },
  },
  { method: 'get', re: /^\/auth\/me$/, handler: () => MOCK_ME_RESPONSES[currentEmail()].data },

  // Student self
  {
    method: 'get',
    re: /^\/students\/me\/courses$/,
    handler: () => {
      const me = currentStudent().userId
      const enrolled = COURSES.filter((c) =>
        (mockCourseMembersMap[c.courseId] ?? []).some((u) => u.userId === me),
      )
      return (enrolled.length ? enrolled : COURSES.slice(0, 3)).map(toCourseCard)
    },
  },
  {
    method: 'get',
    re: /^\/students\/me\/projects$/,
    handler: () =>
      mockProjects
        .filter((p) => {
          const gid = projectGroupId(p)
          return gid != null && MY_GROUP_IDS.includes(gid)
        })
        .map(toProjectDto),
  },
  { method: 'get', re: /^\/students\/me\/invitations$/, handler: () => [] },

  // Courses
  { method: 'get', re: /^\/courses\/teaching$/, handler: () => COURSES.map(toCourseCard) },
  { method: 'get', re: /^\/courses$/, handler: () => COURSES.map(toCourseResponse) },
  {
    method: 'get',
    re: /^\/courses\/(\d+)$/,
    handler: (m) => {
      const c = courseById(num(m[1]))
      return c ? toCourseResponse(c) : null
    },
  },
  {
    method: 'get',
    re: /^\/courses\/(\d+)\/projects$/,
    handler: (m) =>
      mockProjects.filter((p) => p.course?.courseId === num(m[1])).map(toProjectDto),
  },
  {
    method: 'get',
    re: /^\/courses\/(\d+)\/projects\/(\d+)$/,
    handler: (m) => {
      const p = projectById(num(m[2]))
      return p ? toProjectDto(p) : null
    },
  },
  { method: 'get', re: /^\/courses\/(\d+)\/projects\/(\d+)\/activities$/, handler: () => buildFeed().slice(0, 10) },
  {
    method: 'get',
    re: /^\/courses\/(\d+)\/groups$/,
    handler: (m) => (mockCourseGroupsMap[num(m[1])] ?? []).map(toTeam),
  },
  {
    method: 'get',
    re: /^\/courses\/(\d+)\/groups\/me$/,
    handler: (m) => {
      const g = mockMyGroupMap[num(m[1])]
      return g ? toTeam(g) : null
    },
  },
  {
    method: 'get',
    re: /^\/courses\/(\d+)\/groups\/classmates$/,
    handler: (m) => (mockCourseMembersMap[num(m[1])] ?? []).map((u) => toTeamMember(u, null)),
  },
  {
    method: 'get',
    re: /^\/courses\/(\d+)\/groups\/(\d+)\/members$/,
    handler: (m) => {
      const g = groupById(num(m[2]))
      return g ? g.members.map((u) => toTeamMember(u, g)) : []
    },
  },
  {
    method: 'get',
    re: /^\/courses\/(\d+)\/groups\/(\d+)\/join-requests$/,
    handler: (m) =>
      (mockTeamRequestsMap[num(m[1])] ?? []).map((u) => ({
        ...toTeamMember(u, null),
        status: 'PENDING',
      })),
  },
  {
    method: 'get',
    re: /^\/courses\/(\d+)\/registrations$/,
    handler: () => mockProjectRequests.map(toPendingRegistration),
  },
  {
    method: 'get',
    re: /^\/courses\/(\d+)\/requirement$/,
    handler: (m) => requirementForCourse(num(m[1])),
  },

  // Groups
  {
    method: 'get',
    re: /^\/groups\/(\d+)$/,
    handler: (m) => {
      const g = groupById(num(m[1]))
      return g ? toTeam(g) : null
    },
  },

  // Projects
  {
    method: 'get',
    re: /^\/projects\/(\d+)$/,
    handler: (m) => {
      const p = projectById(num(m[1]))
      return p ? toProjectDto(p) : null
    },
  },
  {
    method: 'get',
    re: /^\/projects\/(\d+)\/board$/,
    handler: (m) => {
      const p = projectById(num(m[1]))
      const gid = p ? projectGroupId(p) : null
      const group = gid != null ? groupById(gid) : null
      return {
        tasks: mockTasks.filter((t) => t.group.groupId === gid).map(toTaskDto),
        currentUser: toUserLite(currentStudent()),
        group: group
          ? {
              groupId: group.groupId,
              name: group.name,
              leaderId: group.leader?.userId ?? null,
              members: group.members.map(toUserLite),
            }
          : null,
      }
    },
  },
  {
    method: 'get',
    re: /^\/projects\/(\d+)\/tasks$/,
    handler: (m) => {
      const p = projectById(num(m[1]))
      const gid = p ? projectGroupId(p) : null
      return mockTasks.filter((t) => t.group.groupId === gid).map(toTaskDto)
    },
  },
  {
    method: 'get',
    re: /^\/projects\/(\d+)\/submissions$/,
    handler: (m) => {
      const p = projectById(num(m[1]))
      return (p?.submissions ?? []).map((s) => ({
        submissionId: s.submissionId,
        submittedAt: s.submittedAt,
        status: s.status,
        filePath: s.filePath,
        project: null,
        group: null,
        grade: null,
      }))
    },
  },

  // Home
  { method: 'get', re: /^\/home\/stats$/, handler: () => ({ quickStats: buildStats() }) },
  { method: 'get', re: /^\/home\/feed$/, handler: () => buildFeed() },
  {
    method: 'get',
    re: /^\/home\/stats\/detail$/,
    handler: () => buildStatDetail(),
  },

  // Notifications
  { method: 'get', re: /^\/notifications$/, handler: () => NOTIFICATIONS },
  {
    method: 'get',
    re: /^\/notifications\/unread-count$/,
    handler: () => NOTIFICATIONS.filter((n) => !n.isRead).length,
  },

  // Categories
  { method: 'get', re: /^\/categories$/, handler: () => CATEGORIES },

  // Admin
  {
    method: 'get',
    re: /^\/admin\/users$/,
    handler: (_m, config) => {
      const role = param(config, 'role')
      const search = (param(config, 'search') ?? '').toLowerCase()
      const isActive = param(config, 'isActive')
      const page = Number(param(config, 'page') ?? 0)
      const size = Number(param(config, 'size') ?? 10)
      let list = adminUserList()
      if (role) list = list.filter((u) => u.role === role)
      if (isActive === 'true') list = list.filter((u) => u.isActive)
      if (isActive === 'false') list = list.filter((u) => !u.isActive)
      if (search) {
        list = list.filter(
          (u) =>
            u.name.toLowerCase().includes(search) ||
            u.email.toLowerCase().includes(search) ||
            u.uid.toLowerCase().includes(search),
        )
      }
      const totalElements = list.length
      const content = list.slice(page * size, page * size + size)
      return {
        content,
        number: page,
        size,
        totalElements,
        totalPages: Math.max(1, Math.ceil(totalElements / size)),
        last: (page + 1) * size >= totalElements,
      }
    },
  },
  {
    method: 'get',
    re: /^\/admin\/categories$/,
    handler: (_m, config) => {
      const search = (param(config, 'search') ?? '').toLowerCase()
      const page = Number(param(config, 'page') ?? 0)
      const size = Number(param(config, 'size') ?? 10)
      let list = CATEGORIES
      if (search) list = list.filter((c) => c.name.toLowerCase().includes(search))
      const totalElements = list.length
      return {
        content: list.slice(page * size, page * size + size),
        number: page,
        size,
        totalElements,
        totalPages: Math.max(1, Math.ceil(totalElements / size)),
        last: (page + 1) * size >= totalElements,
      }
    },
  },
]

// ── Adapter ──────────────────────────────────────────────────────────────────

export const mockAdapter = (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
  const method = (config.method ?? 'get').toLowerCase()
  const path = (config.url ?? '').split('?')[0]

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      for (const route of routes) {
        if (route.method !== method) continue
        const match = path.match(route.re)
        if (!match) continue
        try {
          const data = route.handler(match, config)
          resolve(ok(data, config))
        } catch (err) {
          // handler chủ động ném AxiosError qua fail() để mô phỏng lỗi HTTP.
          reject(err)
        }
        return
      }

      // Mutation chưa map → trả thành công rỗng để UI không vỡ; GET lạ → mảng rỗng.
      if (method === 'get') {
        if (import.meta.env.DEV) console.warn(`[mock] GET chưa hỗ trợ: ${path} → trả []`)
        resolve(ok([], config))
      } else {
        resolve(ok(null, config))
      }
    }, MOCK_DELAY)
  })
}

export default mockAdapter
