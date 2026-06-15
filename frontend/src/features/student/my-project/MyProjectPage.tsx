import { useEffect, useState } from 'react'
import ProjectWorkspaceCard from '../../../components/ui/student/ProjectWorkspaceCard'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import { getMyProjects } from '../../../services/project.service'
import type { Project } from '../../../types/api/project'

export default function MyProjectPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    let alive = true
    getMyProjects().then((data) => {
      if (!alive) return
      setProjects(data)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [])

  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return true 

    const projectTitle = project.title?.toLowerCase() || ''

    const courseName = project.courseName?.toLowerCase() || ''

    const courseId = project.courseId?.toString() || ''

    return (
      projectTitle.includes(query) || 
      courseName.includes(query) ||
      courseId.includes(query)
    )
  })

  if (loading) return <LoadingSpinner message="Đang tải đồ án..." />

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text">My Projects</h2>
          <p className="text-sm text-text-soft mt-1">
            Manage and track your active academic collaborations.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-soft">
            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search projects by title or course ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border rounded-button pl-10 pr-4 py-2 text-sm text-text placeholder:text-text-soft focus:outline-none focus:border-primary transition-colors shadow-soft"
          />
        </div>
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectWorkspaceCard key={project.projectId} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-surface border border-border rounded-2xl shadow-soft">
          <p className="text-text-soft font-medium">Không tìm thấy đồ án hoặc lớp học nào phù hợp.</p>
        </div>
      )}
    </div>
  )
}