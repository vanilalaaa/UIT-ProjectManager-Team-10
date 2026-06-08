import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import ProjectCard from '../../../components/ui/ProjectCard'
import CourseRequirementCard from '../../../components/ui/CourseRequirementCard'
import ConfirmModal from '../../../components/ui/ConfirmModal'
import { mockProjects } from '../../../mocks/projects.mock'
import { mockCourseRequirements } from '../../../mocks/tasks.mock'

export default function TeacherProjectList() {
  const { courseId } = useParams<{ courseId: string }>()
  const id = Number(courseId)
  const [loading, setLoading] = useState(true)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<any>(null)
  
  const courseProjects = mockProjects.filter(p => p.course.courseId === id)
  const courseInfo = courseProjects.length > 0 ? courseProjects[0].course : null
  const courseCategory = courseProjects.length > 0 ? courseProjects[0].category : null
  const courseRequirements = mockCourseRequirements[id] || null

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setTimeout(() => {
      if (isMounted) setLoading(false)
    }, 500)
    return () => { isMounted = false }
  }, [courseId])

  const handleDeleteConfirm = () => {
    console.log("Xóa dự án:", projectToDelete?.projectId)
    setIsDeleteModalOpen(false)
  }

  if (loading) return <LoadingSpinner message="Đang tải danh sách đồ án..." />
  if (!courseInfo) return <div className="p-8 text-center text-text-soft font-medium">Không tìm thấy thông tin lớp học.</div>

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
      
      <CourseRequirementCard 
        course={courseInfo} 
        category={courseCategory} 
        requirements={courseRequirements} 
      />

      <div>
        <h3 className="text-lg font-bold text-text mb-4">
          Danh sách Đồ án ({courseProjects.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courseProjects.map((project) => {
            const firstRegistration = project.registrations?.[0]
            const groupNameDisplay = firstRegistration 
              ? `Nhóm ${firstRegistration.groupId}` 
              : undefined

            return (
              <ProjectCard 
                key={project.projectId} 
                project={project} 
                courseId={courseId || ''}
                isTeacherView={true}
                groupName={groupNameDisplay}
                onDelete={() => {
                  if (new Date(project.endDate) < new Date()) {
                    alert("Đề tài đã quá hạn, không được phép xóa!")
                  } else {
                    setProjectToDelete(project)
                    setIsDeleteModalOpen(true)
                  }
                }}
              />
            )
          })}
        </div>
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        title="Xác nhận xóa đề tài"
        message={
          <>
            Bạn có chắc chắn muốn xóa đồ án <strong>{projectToDelete?.title}</strong>? 
            Hành động này sẽ xóa vĩnh viễn dữ liệu và không thể hoàn tác.
          </>
        }
        confirmText="Xóa đề tài"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteModalOpen(false)}
        isDestructive={true} 
      />
    </div>
  )
}