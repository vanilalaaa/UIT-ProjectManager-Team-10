import type { Role, UserDto } from '../../mocks/types'

export type { Role, UserDto }

export type AdminUserListItem = UserDto & {
  createdAt?: string
  updatedAt?: string | null
}

export type AdminUserQuery = {
  page?: number
  size?: number
  search?: string
  role?: Role | ''
  isActive?: boolean | ''
}

export type AdminUserCreateRequest = {
  email: string
  name: string
  password: string
  role: Role
}

export type AdminUserUpdateRequest = {
  name?: string
  email?: string
  role?: Role
}

export type AdminUserPatchRequest = { isActive: boolean }
