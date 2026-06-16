// Định nghĩa type dùng chung, khớp với DTO/entity của backend (com.example.se330).
// Trước đây nằm trong src/mocks/types.ts; đã tách khỏi mock vì là type thật.
export type ApiStatus = 'success' | 'error'
// Matches com.example.se330.enums.Role
export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT'
export type DateString = string
export type DateTimeString = string

export type ApiResponse<T> = {
  status: ApiStatus
  message: string
  data: T
  errorCode: string | null
  timestamp: DateTimeString
}

// Matches com.example.se330.dto.auth.AuthResponse
export type AuthResponse = {
  accessToken: string
  tokenType: string
  expiresIn: number // Java Long
  uid: string
  email: string
  name: string
  role: Role
}

// Matches com.example.se330.dto.UserDto
export type UserDto = {
  id: number // Java Long
  uid: string
  email: string
  name: string
  role: Role
  isActive: boolean
}

export type LoginRequest = {
  email: string
  password: string
}

export type UserProfile = {
  userId: number
  summary: string
  firstName: string
  lastName: string
  avatarUrl: string
  phoneNumber: string
  birthday: DateString
}

export type User = {
  userId: number
  uid: string
  email: string
  password: string | null
  name: string
  role: Role
  createdAt: DateTimeString
  updatedAt: DateTimeString | null
  isActive: boolean
  verificationToken: string | null
  verificationTokenExpiry: DateTimeString | null
  resetPasswordToken: string | null
  resetPasswordTokenExpiry: DateTimeString | null
  userProfile: UserProfile | null
}

export type Course = {
  courseId: number
  name: string
  lecturer: User | null
  maxStudents: number
  startDate: DateString
  endDate: DateString
  groups: Group[]
  projects: Project[]
}

export type Category = {
  categoryId: number
  name: string
  description: string
  isActive: boolean
}

export type Group = {
  groupId: number
  name: string
  description: string
  course: Course
  leader: User
  members: User[]
  tasks: Task[]
}

export type Registration = {
  groupId: number
  project: Project | null
  groupMember: User | null
  registeredAt: DateString
  approvedAt: DateString | null
  status: string
  note: string
}

export type Submission = {
  submissionId: number
  submittedAt: DateTimeString
  status: string
  filePath: string
  project: Project | null
  group: Group | null
  grade: unknown | null
}

export type Project = {
  projectId: number
  title: string
  description: string
  status: string
  startDate: DateString
  endDate: DateString
  course: Course
  category: Category
  registrations: Registration[]
  submissions: Submission[]
}

export type TaskPriority = 'Low' | 'Medium' | 'High'

export type Task = {
  taskId: number
  title: string
  description: string
  assignedTo: User
  createdBy: User
  status: string
  // UI-only: BE Task entity chưa có cột priority, mới dùng để hiển thị/sắp xếp.
  priority?: TaskPriority
  group: Group
  deadline: DateTimeString
  createdAt: DateTimeString
  updatedAt: DateTimeString | null
}
