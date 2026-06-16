// src/pages/teacher/TeacherProjectList.tsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import ProjectCard from '../../../components/ui/student/ProjectCard'
import CourseRequirementCard from '../../../components/ui/teacher/CourseRequirementCard'
import NotificationModal from '../../../components/ui/student/NotificationModal'
import ApprovalRequestSidebar from '../../../components/ui/teacher/ApprovalRequestSidebar'
import ProjectApprovalModal from '../../../components/ui/teacher/ProjectApprovalModal'
import type { Project } from '../../../types/api/project'
import type { PendingRegistration } from '../../../types/api/registration'
import { getCourseProjects } from '../../../services/project.service'
import {
  approveRegistration,
  getPendingRegistrations,
  rejectRegistration,
} from '../../../services/registration.service'

export default function TeacherProjectList() {
  const { courseId } = useParams<{ courseId: string }>()
  const id = Number(courseId)
  const [loading, setLoading] = useState(true)

  const [requests, setRequests] = useState<PendingRegistration[]>([])
  const [selectedRequest, setSelectedRequest] = useState<PendingRegistration | null>(null)
  
  const [notification, setNotification] = useState({
    isOpen: false,
    title: '',
    message: ''
  })

  const [courseProjects, setCourseProjects] = useState<Project[]>([])

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    Promise.all([getCourseProjects(id), getPendingRegistrations(id)]).then(([projects, reqs]) => {
      if (!isMounted) return
      setCourseProjects(projects)
      setRequests(reqs)
      setLoading(false)
    })
    return () => { isMounted = false }
  }, [courseId, id])

  const triggerNotification = (title: string, message: string) => {
    setNotification({ isOpen: true, title, message })
  }

  const handleAcceptRequest = (registrationId: number, title: string, e: React.MouseEvent, note?: string) => {
    e.stopPropagation()
    setRequests((prev) => prev.filter((r) => r.registrationId !== registrationId))
    approveRegistration(registrationId, note)
      .then(() => {
        const noteSuffix = note?.trim() ? `\nNhận xét: "${note.trim()}"` : ''
        triggerNotification('Thành công', `Đã phê duyệt thành công đề tài: ${title}${noteSuffix}`)
        // Đề tài vừa duyệt giờ đã có nhóm → tải lại danh sách để hiển thị.
        return getCourseProjects(id).then(setCourseProjects)
      })
      .catch(() => triggerNotification('Lỗi', 'Không duyệt được yêu cầu đăng ký.'))
  }

  const handleDeclineRequest = (registrationId: number, title: string, e: React.MouseEvent, note?: string) => {
    e.stopPropagation()
    setRequests((prev) => prev.filter((r) => r.registrationId !== registrationId))
    rejectRegistration(registrationId, note)
      .then(() => {
        const noteSuffix = note?.trim() ? `\nNhận xét: "${note.trim()}"` : ''
        triggerNotification('Thông báo', `Đã từ chối yêu cầu đăng ký: ${title}${noteSuffix}`)
      })
      .catch(() => triggerNotification('Lỗi', 'Không từ chối được yêu cầu đăng ký.'))
  }

  // Giáo viên chỉ xem các đồ án đã có nhóm đăng ký (đã được duyệt).
  const projectsWithGroup = courseProjects.filter((p) => p.groupId != null)

  if (loading) return <LoadingSpinner message="Đang tải danh sách đồ án..." />

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20 px-4 relative">
      
      <NotificationModal 
        isOpen={notification.isOpen}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
      />

      <CourseRequirementCard courseId={id} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-text">
            Danh sách Đồ án ({projectsWithGroup.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projectsWithGroup.map((project) => {
              const groupNameDisplay = project.groupName ?? undefined

              return (
                <ProjectCard 
                  key={project.projectId} 
                  project={project} 
                  courseId={courseId || ''}
                  isTeacherView={true}
                  groupName={groupNameDisplay}
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
    </div>
  )
}