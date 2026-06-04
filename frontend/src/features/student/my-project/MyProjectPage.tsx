import { useEffect, useState } from 'react'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import ProjectWorkspaceCard from '../../../components/ui/ProjectWorkspaceCard'
import type { Project } from '../../../mocks/types'
import { mockProjects } from '../../../mocks/projects.mock'
import { useAuth } from '../../../features/auth/useAuth'

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  
  const { currentUser } = useAuth()

  useEffect(() => {
    if (!currentUser) return;

    const myOwnProjects = mockProjects.filter((project) => 
      project.registrations?.some((reg) => {
        const member = reg.groupMember;
        return member?.uid === currentUser.uid || member?.email === currentUser.email;
      })
    );

    const timer = setTimeout(() => {
      setProjects(myOwnProjects)
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [currentUser]) 

  if (loading) return <LoadingSpinner message="Đang tải danh sách đồ án..." />

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">My Projects</h1>
          <p className="text-text-soft mt-1">Manage and track your active academic collaborations.</p>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="size-4 text-text-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <input
              placeholder="Search projects..."
              className="border border-border rounded-full pl-10 pr-4 py-2 w-64 bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button className="border border-border rounded-full px-6 py-2 flex items-center gap-2 hover:bg-surface-soft">
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
          </button>
        </div>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectWorkspaceCard key={project.projectId} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-text-soft">
          <p>Tài khoản <span className="font-bold text-primary">{currentUser?.name}</span> chưa tham gia đồ án nào.</p>
        </div>
      )}
    </div>
  )
}