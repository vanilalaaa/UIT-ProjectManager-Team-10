export type ApiStatus = 'success' | 'error'

export type ApiResponse<T> = {
  status: ApiStatus
  message: string
  data: T
  errorCode: string | null
  timestamp: string
}

export type Page<T> = {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export type PageQuery = {
  page?: number
  size?: number
  search?: string
  sort?: string
}
