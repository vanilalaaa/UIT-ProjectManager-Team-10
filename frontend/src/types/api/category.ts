import type { Category } from '../../mocks/types'

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
  isActive?: boolean
}

export type AdminCategoryUpdateRequest = Partial<AdminCategoryCreateRequest>
