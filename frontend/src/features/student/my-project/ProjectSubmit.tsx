import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import DueDateCard from '../../../components/ui/student/DueDateCard'
import UploadFilesCard from '../../../components/ui/student/UploadFilesCard'
import type { Project } from '../../../types/api/project'
import { getProjectById } from '../../../services/project.service'
import { createSubmissionFormData, deleteSubmission } from '../../../services/submission.service'
import { getRequirement, type SubmissionRequirement } from '../../../services/requirement.service'

export default function ProjectSubmit() {
  const { projectId } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [submissionRequirements, setSubmissionRequirements] = useState<SubmissionRequirement[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  const fetchProjectData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getProjectById(projectId ?? '')
      setProject(data)
      if (data?.courseId) {
        try {
          const requirement = await getRequirement(data.courseId)
          setSubmissionRequirements(requirement.submissionRequirements)
        } catch {
          setSubmissionRequirements([])
        }
      } else {
        setSubmissionRequirements([])
      }
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchProjectData()
  }, [fetchProjectData])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60 * 1000)
    return () => window.clearInterval(timer)
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center text-text-soft border-2 border-dashed border-border rounded-2xl bg-surface-soft/30 min-h-[300px]">
        <p className="font-medium text-sm">Đang tải dữ liệu nộp bài...</p>
      </div>
    )
  }

  if (!project) return <div className="p-8 text-center text-text-soft">Không tìm thấy thông tin đồ án.</div>

  const sortedSubmissions = [...(project.submissions || [])].sort((a, b) =>
    new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime()
  )
  const currentSubmissionRows = sortedSubmissions.filter((submission) => submission.groupId === project.groupId)
  const hasSubmissionRequirements = submissionRequirements.length > 0
  const requiredRequirementIds = new Set(submissionRequirements.map((requirement) => Number(requirement.id)))
  const submittedRequirementIds = new Set(
    currentSubmissionRows
      .map((submission) => submission.submissionRequirementId)
      .filter((id): id is number => id != null),
  )
  const completedSubmissionRows = hasSubmissionRequirements
    ? currentSubmissionRows.filter(
      (submission) => submission.submissionRequirementId != null && requiredRequirementIds.has(submission.submissionRequirementId),
    )
    : currentSubmissionRows
  const hasCompletedRequiredSubmissions = hasSubmissionRequirements
    ? submissionRequirements.every((requirement) => submittedRequirementIds.has(Number(requirement.id)))
    : currentSubmissionRows.length > 0
  const latestCompletedSubmission = hasCompletedRequiredSubmissions ? completedSubmissionRows[0] ?? null : null

  const formatDuration = (milliseconds: number) => {
    const totalMinutes = Math.max(1, Math.floor(Math.abs(milliseconds) / (1000 * 60)))
    const days = Math.floor(totalMinutes / (60 * 24))
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
    const minutes = totalMinutes % 60

    if (days > 0) return `${days} ngày ${hours} giờ`
    if (hours > 0) return `${hours} giờ ${minutes} phút`
    return `${minutes} phút`
  }

  const getSubmissionTiming = (endDateStr: string | null, submittedAt?: string | null) => {
    if (!endDateStr) return { label: 'Chưa cập nhật', tone: 'active' as const, deadlinePassed: false }

    const deadlineTime = new Date(`${endDateStr}T23:59:59`).getTime()
    const deadlinePassed = now > deadlineTime

    if (submittedAt) {
      const submittedTime = new Date(submittedAt).getTime()
      const diff = deadlineTime - submittedTime

      if (diff >= 0) {
        return { label: `Nộp sớm ${formatDuration(diff)}`, tone: 'submitted' as const, deadlinePassed }
      }

      return { label: `Quá hạn ${formatDuration(diff)}`, tone: 'overdue' as const, deadlinePassed }
    }

    if (deadlinePassed) {
      return { label: `Quá hạn ${formatDuration(now - deadlineTime)}`, tone: 'overdue' as const, deadlinePassed }
    }

    return { label: formatDuration(deadlineTime - now), tone: 'active' as const, deadlinePassed }
  }

  const submissionTiming = getSubmissionTiming(project.endDate ?? null, latestCompletedSubmission?.submittedAt)
  const hasCurrentSubmission = hasCompletedRequiredSubmissions
  const isOverdueWithoutSubmission = submissionTiming.deadlinePassed && !hasCurrentSubmission
  const isLocked = isOverdueWithoutSubmission || project.submissionLocked
  
  const currentSubmissions = currentSubmissionRows.map((submission) => ({
    id: submission.submissionId,
    name: submission.filePath?.split('/').pop() || 'Tệp đính kèm',
    url: submission.filePath?.startsWith('http') ? submission.filePath : `http://localhost:8080${submission.filePath}`,
    date: new Date(submission.submittedAt || '').toLocaleString('vi-VN'),
    submissionRequirementId: submission.submissionRequirementId,
  }))

  const handleSubmit = async (
    files: File[],
    deleteIds: number[],
    submissionRequirementId?: string | number | null,
    linkUrl?: string,
  ) => {
    if (!project.groupId) return toast.error('Nhóm của bạn chưa đăng ký đồ án!')

    setIsSubmitting(true)
    try {
      if (deleteIds.length > 0) {
        await Promise.all(deleteIds.map((id) => deleteSubmission(id)))
      }

      if ((files && files.length > 0) || linkUrl?.trim()) {
        const formData = new FormData()
        files.forEach((file) => formData.append('files', file))
        formData.append('groupId', project.groupId.toString())
        if (submissionRequirementId != null) {
          formData.append('submissionRequirementId', String(submissionRequirementId))
        }
        if (linkUrl?.trim()) {
          formData.append('linkUrl', linkUrl.trim())
        }

        await createSubmissionFormData(project.projectId, formData)
      }

      toast.success('Đã cập nhật bài nộp thành công!')
      fetchProjectData()
    } catch (err) {
      const apiErr = err as { message?: string }
      toast.error(apiErr?.message || 'Có lỗi xảy ra khi xử lý.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-text mb-2">Submission</h1>
        <p className="text-text-soft text-sm">
          Upload your finalized documents for review. Ensure all required files are included before final submission.
        </p>
      </div>

      <div className="space-y-6 animate-fade-in">
        <DueDateCard
          dueDate={project.endDate ?? 'Chưa cập nhật'}
          timeRemaining={submissionTiming.label}
          status={submissionTiming.tone}
        />

        {hasSubmissionRequirements ? (
          <div className="space-y-4">
            {submissionRequirements.map((requirement, index) => {
              const requirementSubmissions = currentSubmissions.filter(
                (submission) => submission.submissionRequirementId === Number(requirement.id),
              )

              return (
                <div key={requirement.id} className="space-y-3">
                  <div className="rounded-xl border border-border bg-surface p-4 shadow-soft">
                    <div className="flex items-start gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-sm font-bold text-text">{requirement.content}</h2>
                        {requirement.files && requirement.files.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {requirement.files.map((file) => (
                              <a
                                key={file.id}
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full border border-border bg-surface-soft px-3 py-1 text-xs font-semibold text-primary hover:border-primary"
                              >
                                {file.label}
                              </a>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <UploadFilesCard
                    onSubmit={(files, deleteIds, linkUrl) => handleSubmit(files, deleteIds, requirement.id, linkUrl)}
                    isSubmitting={isSubmitting}
                    isLocked={isLocked}
                    currentSubmissions={requirementSubmissions}
                    title={`Nộp file cho yêu cầu ${index + 1}`}
                  />
                </div>
              )
            })}
          </div>
        ) : (
          <UploadFilesCard
            onSubmit={(files, deleteIds, linkUrl) => handleSubmit(files, deleteIds, null, linkUrl)}
            isSubmitting={isSubmitting}
            isLocked={isLocked}
            currentSubmissions={currentSubmissions}
          />
        )}
      </div>
    </div>
  )
}
