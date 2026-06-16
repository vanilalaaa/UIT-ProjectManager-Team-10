import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import DueDateCard from '../../../components/ui/student/DueDateCard'
import UploadFilesCard from '../../../components/ui/student/UploadFilesCard'
import type { Project } from '../../../types/api/project'
import { getProjectById } from '../../../services/project.service'
import { createSubmissionFormData, deleteSubmission } from '../../../services/submission.service'

export default function ProjectSubmit() {
  const { projectId } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchProjectData = useCallback(() => {
    setLoading(true)
    getProjectById(projectId ?? '').then(data => {
      setProject(data)
      setLoading(false)
    })
  }, [projectId])

  useEffect(() => {
    fetchProjectData()
  }, [fetchProjectData])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center text-text-soft border-2 border-dashed border-border rounded-2xl bg-surface-soft/30 min-h-[300px]">
        <p className="font-medium text-sm">Đang tải dữ liệu nộp bài...</p>
      </div>
    )
  }

  if (!project) return <div className="p-8 text-center text-text-soft">Không tìm thấy thông tin đồ án.</div>

  const calculateTimeRemaining = (endDateStr: string | null) => {
    if (!endDateStr) return 'Chưa cập nhật'
    const end = new Date(`${endDateStr}T23:59:59`).getTime()
    const now = new Date().getTime()
    const diff = end - now
    if (diff < 0) return 'Quá hạn'
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    return `${days} ngày ${hours} giờ`
  }

  const timeRemaining = calculateTimeRemaining(project.endDate ?? null)
  const isLocked = timeRemaining === 'Quá hạn' || project.submissionLocked

  const sortedSubmissions = [...(project.submissions || [])].sort((a, b) =>
    new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime()
  )
  const currentSubmissionRows = sortedSubmissions.filter((submission) => submission.groupId === project.groupId)
  
  const currentSubmissions = currentSubmissionRows.map((submission) => ({
    id: submission.submissionId,
    name: submission.filePath?.split('/').pop() || 'Tệp đính kèm',
    url: submission.filePath?.startsWith('http') ? submission.filePath : `http://localhost:8080${submission.filePath}`,
    date: new Date(submission.submittedAt || '').toLocaleString('vi-VN'),
    rawDate: submission.submittedAt || undefined,
  }))

  const handleSubmit = async (files: File[], deleteIds: number[]) => {
    if (!project.groupId) return toast.error('Nhóm của bạn chưa đăng ký đồ án!')

    setIsSubmitting(true)
    try {
      if (deleteIds.length > 0) {
        await Promise.all(deleteIds.map((id) => deleteSubmission(id)))
      }

      if (files && files.length > 0) {
        const formData = new FormData()
        files.forEach((file) => formData.append('files', file))
        formData.append('groupId', project.groupId.toString())

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
          timeRemaining={timeRemaining}
        />

        <UploadFilesCard
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isLocked={isLocked}
          currentSubmissions={currentSubmissions}
          dueDate={project.endDate ?? null}
        />
      </div>
    </div>
  )
}