import { useParams } from 'react-router-dom'
import { mockProjects } from '../../../mocks/projects.mock'
import ProjectCard from '../../../components/ui/ProjectCard'

export default function StudentProjectList() {
  const { courseId } = useParams<{ courseId: string }>()

  const currentCourseProjects = mockProjects.filter(
    (p) => p.course.courseId === Number(courseId) || courseId === '1'
  )

  const groupNamesMap: Record<number, string> = {
    1: 'Nhóm 01 - Phoenix',
    2: 'Nhóm 02 - Aster',
    3: 'Nhóm 03 - Nimbus',
    4: 'Nhóm 04 - Orion',
    5: 'Nhóm 05 - Lumos',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text">
          Project list {courseId === '2' ? 'PM301' : 'SE330'}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {currentCourseProjects.map((project) => {
          const registration = project.registrations?.[0]
          const groupName = registration ? (groupNamesMap[registration.groupId] || `Nhóm ${registration.groupId}`) : undefined

          return (
            <ProjectCard 
              key={project.projectId} 
              project={project} 
              courseId={courseId || '1'} 
              groupName={groupName}
            />
          )
        })}
      </div>
    </div>
  )
}