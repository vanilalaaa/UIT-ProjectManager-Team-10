import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import DueDateCard from '../../../components/ui/student/DueDateCard'
import UploadFilesCard from '../../../components/ui/student/UploadFilesCard'
import ProjectStatusCard from '../../../components/ui/student/ProjectStatusCard'
import PreviousVersionsCard, { type Version } from '../../../components/ui/student/PreviousVersionsCard'
import type { Project } from '../../../mocks/types'

import { mockProjects } from '../../../mocks/projects.mock'

const fetchProjectData = async (projectId: string | undefined): Promise<Project | null> => {
  const project = mockProjects.find(p => p.projectId.toString() === projectId)
  return new Promise(resolve => setTimeout(() => resolve(project || null), 500))
}

export default function ProjectSubmit() {
  const { projectId } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    fetchProjectData(projectId).then(data => {
      if (isMounted) {
        setProject(data)
        setLoading(false)
      }
    })
    return () => { isMounted = false }
  }, [projectId])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center text-text-soft border-2 border-dashed border-border rounded-2xl bg-surface-soft/30 min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <svg className="size-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="font-medium text-sm">Đang tải dữ liệu nộp bài...</p>
        </div>
      </div>
    )
  }

  if (!project) return <div className="p-8 text-center text-text-soft">Không tìm thấy thông tin đồ án.</div>

  const versions: Version[] = project.submissions?.map((sub, idx) => ({
    id: sub.submissionId,
    title: `Lần nộp ${idx + 1} (${sub.status})`,
    date: new Date(sub.submittedAt).toLocaleString('vi-VN'),
    file: sub.filePath.split('/').pop() || 'document.pdf',
    isDraft: sub.status === 'DRAFT'
  })) || []

  const calculateTimeRemaining = (endDateStr: string) => {
    const end = new Date(endDateStr).getTime()
    const now = new Date().getTime()
    const diff = end - now
    if (diff < 0) return 'Quá hạn'
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    return `${days} ngày ${hours} giờ`
  }

  const handleSubmit = () => {
    console.log('Đã bấm nộp bài cho đồ án ID:', project.projectId)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">Submission</h1>
        <p className="text-text-soft text-sm max-w-2xl">
          Upload your finalized documents for review. Ensure all required files are included before final submission.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <DueDateCard 
            dueDate={project.endDate} 
            timeRemaining={calculateTimeRemaining(project.endDate)} 
          />
          <UploadFilesCard onSubmit={handleSubmit} />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <ProjectStatusCard status={project.status} />
          {versions.length > 0 && <PreviousVersionsCard versions={versions} />}
        </div>
      </div>
    </div>
  )
}