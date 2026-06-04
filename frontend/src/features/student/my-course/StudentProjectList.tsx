import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ProjectCard from '../../../components/ui/ProjectCard'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import type { Project } from '../../../mocks/types'
import { mockProjects } from '../../../mocks/projects.mock'
import { groupPhoenix, groupAster, groupNimbus, groupOrion } from '../../../mocks/tasks.mock'

type EnrichedProject = Project & { groupName?: string }

const fetchProjectsByCourse = async (courseId: string | undefined): Promise<EnrichedProject[]> => {
  const courseIdNum = Number(courseId)
  
  const projects = mockProjects.filter(p => p.course.courseId === courseIdNum)
  const allGroups = [groupPhoenix, groupAster, groupNimbus, groupOrion]

  const enrichedProjects = projects.map(project => {
    const registration = project.registrations?.[0]
    const group = registration ? allGroups.find(g => g.groupId === registration.groupId) : null
    
    return {
      ...project,
      groupName: group?.name
    }
  })

  return new Promise((resolve) => {
    setTimeout(() => resolve(enrichedProjects), 500)
  })
}

export default function StudentProjectList() {
  const { courseId } = useParams<{ courseId: string }>()
  const [projects, setProjects] = useState<EnrichedProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    
    fetchProjectsByCourse(courseId).then(data => {
      if (isMounted) {
        setProjects(data)
        setLoading(false)
      }
    })

    return () => { isMounted = false }
  }, [courseId])

  if (loading) return <LoadingSpinner message="Đang tải danh sách đồ án..." />

  const courseName = projects.length > 0 ? projects[0].course.name : 'Danh sách đồ án'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text">
          {courseName}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard 
            key={project.projectId} 
            project={project} 
            courseId={courseId || '1'} 
            groupName={project.groupName}
          />
        ))}
      </div>
    </div>
  )
}