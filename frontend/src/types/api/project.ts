import type { Project } from '../../mocks/types'

export type { Project }

export type ProjectCreateRequest = {
  title: string
  description: string
  categoryId: number
  startDate: string
  endDate: string
}

export type ProjectUpdateRequest = Partial<ProjectCreateRequest> & {
  status?: string
}
