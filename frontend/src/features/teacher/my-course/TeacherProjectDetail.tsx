import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import type { Project } from '../../../mocks/types'
import { mockProjects } from '../../../mocks/projects.mock'
import FileAttachment from '../../../components/ui/student/FileAttachment'
import StatusBadge from '../../../components/ui/student/StatusBadge'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'

export default function TeacherProjectDetail() {
  const { projectId } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const found = mockProjects.find((p: Project) => p.projectId.toString() === projectId)
    setTimeout(() => {
      setProject(found || null)
      setLoading(false)
    }, 500)
  }, [projectId])

  if (loading) return <LoadingSpinner message="Đang tải dữ liệu..." />
  if (!project) return <div className="p-8 text-center text-text-soft">Không tìm thấy đồ án.</div>

  const members = project.registrations?.map(r => r.groupMember).filter(Boolean) || []
  const uniqueMembers = Array.from(new Set(members.map(m => m?.userId)))
    .map(id => members.find(m => m?.userId === id))

  return (
    <div className="grid grid-cols-12 gap-6 animate-fade-in">
      <div className="col-span-8 space-y-6">
        <div className="bg-surface p-8 rounded-2xl border border-border shadow-soft">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-text">{project.title}</h1>
              <p className="text-sm text-text-soft mt-1 font-medium">{project.course?.name}</p>
            </div>
            <StatusBadge status={project.status} />
          </div>

          <p className="text-text mt-6 leading-relaxed">
            {project.description}
          </p>

          <div className="mt-8 p-6 bg-surface-soft/50 rounded-xl border border-border">
            <h4 className="text-sm font-bold text-text mb-4">Project Files</h4>
            <div className="flex flex-wrap gap-3">
              {project.submissions && project.submissions.length > 0 ? (
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
              <p className="text-sm font-semibold text-text mt-2 flex items-center gap-2">
                <svg className="size-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.138v.008H12v-.008ZM15.75 15h.008v.008H15.75V15Zm0 2.138v.008H15.75v-.008ZM8.25 15h.008v.008H8.25V15Zm0 2.138v.008H8.25v-.008Z" />
                </svg>
                {project.endDate}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-soft font-bold uppercase tracking-wider">Lecturer</p>
              <p className="text-sm font-semibold text-text mt-2 flex items-center gap-2">
                <svg className="size-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                {project.course?.lecturer?.name || 'Chưa phân công'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-4">
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-soft">
          <h3 className="font-bold text-text mb-6">Team Members</h3>
          <div className="space-y-4">
            {uniqueMembers.length > 0 ? (
              uniqueMembers.map((member) => (
                <div key={member?.userId} className="flex items-center gap-3">
                  <img 
                    src={member?.userProfile?.avatarUrl || `https://ui-avatars.com/api/?name=${member?.name}&background=random`} 
                    alt={member?.name}
                    className="size-10 rounded-full object-cover border border-border"
                  />
                  <div>
                    <p className="text-sm font-bold text-text">{member?.name}</p>
                    <p className="text-xs text-text-soft">{member?.uid}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-text-soft italic">Chưa có thành viên.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}