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
import type { ProjectApprovalRequest } from '../../../mocks/projects.mock'
import type { Project } from '../../../types/api/project'
import {
  addApprovedProject,
  getCourseApprovalRequests,
  getCourseProjects,
  markRequestHandled,
} from '../../../services/project.service'
import { addActivity } from '../../../services/activity.service'

export default function TeacherProjectList() {
  const { courseId } = useParams<{ courseId: string }>()
  const id = Number(courseId)
  const [loading, setLoading] = useState(true)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  
  const [requests, setRequests] = useState<ProjectApprovalRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<ProjectApprovalRequest | null>(null)
  
  const [notification, setNotification] = useState({
    isOpen: false,
    title: '',
    message: ''
  })

  const [courseProjects, setCourseProjects] = useState<Project[]>([])

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    Promise.all([getCourseProjects(id), getCourseApprovalRequests(id)]).then(([projects, reqs]) => {
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

  const handleAcceptRequest = (requestId: number, title: string, e: React.MouseEvent, note?: string) => {
    e.stopPropagation()
    const noteSuffix = note?.trim() ? `\nNhận xét: "${note.trim()}"` : ''
    triggerNotification('Thành công', `Đã phê duyệt thành công đề tài: ${title}${noteSuffix}`)
    addActivity({
      kind: 'APPROVAL',
      title: `Đề tài "${title}" đã được DUYỆT`,
      note: note?.trim() || undefined,
      actorName: 'Giảng viên',
      scope: 'STUDENT',
    })

    // Duyệt → tạo Project từ yêu cầu đăng ký rồi đưa vào danh sách đồ án của lớp.
    const accepted = requests.find((r) => r.requestId === requestId)
    const base = courseProjects[0]
    if (accepted && base) {
      const newProject: Project = {
        projectId: Date.now(),
        title: accepted.title,
        description: accepted.description,
        status: 'IN_PROGRESS',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: base.endDate,
        courseId: base.courseId,
        courseName: base.courseName,
        lecturerName: base.lecturerName,
        categoryId: base.categoryId,
        categoryName: base.categoryName,
        groupId: null,
        groupName: accepted.groupName,
        members: accepted.members.map((m) => ({
          id: m.userId,
          name: m.name,
          avatar: m.userProfile?.avatarUrl ?? null,
        })),
        submissions: [],
        memberCount: accepted.members.length,
        submissionCount: 0,
      }
      addApprovedProject(id, newProject)
      setCourseProjects((prev) => [newProject, ...prev])
    }

    markRequestHandled(id, requestId)
    setRequests((prev) => prev.filter((r) => r.requestId !== requestId))
  }

  const handleDeclineRequest = (requestId: number, title: string, e: React.MouseEvent, note?: string) => {
    e.stopPropagation()
    const noteSuffix = note?.trim() ? `\nNhận xét: "${note.trim()}"` : ''
    triggerNotification('Thông báo', `Đã từ chối yêu cầu đăng ký: ${title}${noteSuffix}`)
    addActivity({
      kind: 'APPROVAL',
      title: `Đề tài "${title}" đã bị TỪ CHỐI`,
      note: note?.trim() || undefined,
      actorName: 'Giảng viên',
      scope: 'STUDENT',
    })
    markRequestHandled(id, requestId)
    setRequests((prev) => prev.filter((r) => r.requestId !== requestId))
  }

  const handleDeleteConfirm = () => {
    triggerNotification('Thông báo', `Đã xóa vĩnh viễn đề tài thành công!`)
    setIsDeleteModalOpen(false)
  }

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
            Danh sách Đồ án ({courseProjects.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courseProjects.map((project) => {
              const groupNameDisplay = project.groupName ?? undefined

              return (
                <ProjectCard 
                  key={project.projectId} 
                  project={project} 
                  courseId={courseId || ''}
                  isTeacherView={true}
                  groupName={groupNameDisplay}
                  onDelete={() => {
                    if (project.endDate && new Date(project.endDate) < new Date()) {
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