import type { Submission } from '../models'

export type { Submission }

export type SubmissionCreateRequest = {
  groupId: number
  filePath: string
  note?: string
}

export type SubmissionUpdateRequest = Partial<SubmissionCreateRequest>
