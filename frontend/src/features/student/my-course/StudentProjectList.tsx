import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ProjectCard from '../../../components/ui/student/ProjectCard'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import CourseRequirementCard from '../../../components/ui/teacher/CourseRequirementCard'
import { getCourseProjectsWithGroup, type ProjectWithGroup } from '../../../services/project.service'

export default function StudentProjectList() {
  const { courseId } = useParams<{ courseId: string }>()
  const [projects, setProjects] = useState<ProjectWithGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    getCourseProjectsWithGroup(courseId ?? '').then((data) => {
      if (isMounted) {
        setProjects(data)
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [courseId])

  if (loading) return <LoadingSpinner message="Đang tải danh sách đồ án..." />

  return (
    <div className="space-y-6">
      {courseId ? <CourseRequirementCard courseId={Number(courseId)} readOnly /> : null}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.projectId}
            project={project}
            courseId={courseId || '1'}
            groupName={project.groupName ?? undefined}
          />
        ))}
      </div>
    </div>
  )
}
