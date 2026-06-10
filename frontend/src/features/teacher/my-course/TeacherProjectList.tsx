// src/pages/teacher/TeacherProjectList.tsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import ProjectCard from '../../../components/ui/student/ProjectCard'
import CourseRequirementCard from '../../../components/ui/teacher/CourseRequirementCard'
import ConfirmModal from '../../../components/ui/teacher/ConfirmModal'
import NotificationModal from '../../../components/ui/student/NotificationModal'
import ApprovalRequestSidebar from '../../../components/ui/teacher/ApprovalRequestSidebar'
import ProjectApprovalModal from '../../../components/ui/teacher/ProjectApprovalModal'
import { mockProjects, mockProjectRequests } from '../../../mocks/projects.mock'
import type { ProjectApprovalRequest } from '../../../mocks/projects.mock'
import { mockCourseRequirements } from '../../../mocks/tasks.mock'

export default function TeacherProjectList() {
  const { courseId } = useParams<{ courseId: string }>()
  const id = Number(courseId)
  const [loading, setLoading] = useState(true)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<any>(null)
  
  const [requests, setRequests] = useState<ProjectApprovalRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<ProjectApprovalRequest | null>(null)
  
  const [notification, setNotification] = useState({
    isOpen: false,
    title: '',
    message: ''
  })

  const courseProjects = mockProjects.filter(p => p.course.courseId === id)
  const courseInfo = courseProjects.length > 0 ? courseProjects[0].course : null
  const courseCategory = courseProjects.length > 0 ? courseProjects[0].category : null
  const courseRequirements = mockCourseRequirements[id] || null

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setRequests(mockProjectRequests)

    setTimeout(() => {
      if (isMounted) setLoading(false)
    }, 500)
    return () => { isMounted = false }
  }, [courseId])

  const triggerNotification = (title: string, message: string) => {
    setNotification({ isOpen: true, title, message })
  }

  const handleAcceptRequest = (requestId: number, title: string, e: React.MouseEvent) => {
    e.stopPropagation() 
    triggerNotification('Thành công', `Đã phê duyệt thành công đề tài: ${title}`)
    setRequests(prev => prev.filter(r => r.requestId !== requestId))
  }

  const handleDeclineRequest = (requestId: number, title: string, e: React.MouseEvent) => {
    e.stopPropagation() 
    triggerNotification('Thông báo', `Đã từ chối yêu cầu đăng ký: ${title}`)
    setRequests(prev => prev.filter(r => r.requestId !== requestId))
  }

  const handleDeleteConfirm = () => {
    triggerNotification('Thông báo', `Đã xóa vĩnh viễn đề tài thành công!`)
    setIsDeleteModalOpen(false)
  }

  if (loading) return <LoadingSpinner message="Đang tải danh sách đồ án..." />
  if (!courseInfo) return <div className="p-8 text-center text-text-soft font-medium">Không tìm thấy thông tin lớp học.</div>

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20 px-4 relative">
      
      <NotificationModal 
        isOpen={notification.isOpen}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
      />

      <CourseRequirementCard 
        course={courseInfo} 
        category={courseCategory} 
        requirements={courseRequirements} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-text">
            Danh sách Đồ án ({courseProjects.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courseProjects.map((project) => {
              const firstRegistration = project.registrations?.[0]
              const groupNameDisplay = firstRegistration ? `Nhóm ${firstRegistration.groupId}` : undefined

              return (
                <ProjectCard 
                  key={project.projectId} 
                  project={project} 
                  courseId={courseId || ''}
                  isTeacherView={true}
                  groupName={groupNameDisplay}
                  onDelete={() => {
                    if (new Date(project.endDate) < new Date()) {
                      triggerNotification('Lỗi hệ thống', "Đề tài đã quá hạn, không được phép xóa!")
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

        <ApprovalRequestSidebar 
          requests={requests}
          onSelectRequest={setSelectedRequest}
          onAccept={handleAcceptRequest}
          onDecline={handleDeclineRequest}
        />

      </div>

      <ProjectApprovalModal 
        selectedRequest={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onAccept={handleAcceptRequest}
        onDecline={handleDeclineRequest}
      />

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