import type { Submission } from '../../mocks/types'

export type { Submission }

export type SubmissionCreateRequest = {
  groupId: number
  filePath: string
  note?: string
}

export type SubmissionUpdateRequest = Partial<SubmissionCreateRequest> & {
  status?: string
}
