import type { Category } from '../models'

export type { Category }

export type AdminCategoryQuery = {
  page?: number
  size?: number
  search?: string
  isActive?: boolean | ''
}

export type AdminCategoryCreateRequest = {
  name: string
  description: string
}

export type AdminCategoryUpdateRequest = Partial<AdminCategoryCreateRequest>

export type AdminCategoryStatusPatch = { isActive: boolean }
