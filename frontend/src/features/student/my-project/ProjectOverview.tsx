import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getProjects } from '../../../services/project.service'
import type { Project } from '../../../mocks/types'
import FileAttachment from '../../../components/ui/FileAttachment'
import StatusBadge from '../../../components/ui/StatusBadge'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'

export default function ProjectOverview() {
  const { projectId } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjectDetail = async () => {
      setLoading(true)
      const response = await getProjects()
      const found = response?.data?.find((p: Project) => p.projectId.toString() === projectId)
      setProject(found || null)
      setLoading(false)
    }
    fetchProjectDetail()
  }, [projectId])

  if (loading) return <LoadingSpinner message="Đang tải dữ liệu..." />
  if (!project) return <div className="p-8 text-center text-text-soft">Không tìm thấy đồ án.</div>

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-8 space-y-6">
        <div className="bg-surface p-8 rounded-2xl border border-border shadow-soft">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-text">{project.title}</h1>
              <p className="text-sm text-text-soft mt-1">{project.course?.name}</p>
            </div>
            <StatusBadge status={project.status} />
          </div>

          <p className="text-text mt-6 leading-relaxed">
            {project.description}
          </p>

          <div className="mt-8 p-6 bg-surface-soft/50 rounded-xl border border-border">
            <h4 className="text-sm font-bold text-text mb-4">Project Files</h4>
            <div className="flex flex-wrap gap-3">
              {project.submissions?.length > 0 ? (
                project.submissions.map((sub, idx) => (
                  <FileAttachment key={idx} fileName={sub.filePath.split('/').pop() || 'file'} />
                ))
              ) : (
                <p className="text-sm text-text-soft italic">Chưa có tệp đính kèm.</p>
              )}
            </div>
          </div>

          <div className="flex gap-12 mt-8 pt-8 border-t border-border">
            <div>
              <p className="text-xs text-text-soft font-bold uppercase tracking-wider">Deadline</p>
              <p className="text-sm font-semibold text-text mt-2 flex items-center gap-2">📅 {project.endDate}</p>
            </div>
            <div>
              <p className="text-xs text-text-soft font-bold uppercase tracking-wider">Team Members</p>
              <div className="flex -space-x-2 mt-2">
                <div className="size-8 rounded-full bg-primary-soft text-primary flex items-center justify-center text-xs font-bold border-2 border-surface">AN</div>
                <div className="size-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold border-2 border-surface">VY</div>
                <div className="size-8 rounded-full bg-surface-soft border-2 border-surface flex items-center justify-center text-xs font-bold text-text-soft">+2</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-4">
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-soft">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-text">Recent Activity</h3>
            <button className="text-sm text-primary font-bold hover:underline">View All →</button>
          </div>
          <div className="text-center py-10 text-sm text-text-soft border-2 border-dashed border-border rounded-xl">
            Chưa có hoạt động gần đây.
          </div>
        </div>
      </div>
    </div>
  )
}