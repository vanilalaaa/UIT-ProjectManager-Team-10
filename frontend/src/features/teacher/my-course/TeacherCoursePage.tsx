import { useState, useEffect } from 'react'
import CourseCard, { type CourseCardData } from '../../../components/ui/CourseCard'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import CourseFormModal, { type CourseFormData } from '../../../components/ui/CourseFormModal'
import ConfirmModal from '../../../components/ui/ConfirmModal'
import type { Project } from '../../../mocks/types'
import { mockProjects } from '../../../mocks/projects.mock'
import { mockCourseMembersMap } from '../../../mocks/tasks.mock' 

const transformProjectsToCourses = (projects: Project[]): CourseCardData[] => {
  const uniqueCoursesMap = new Map<number, CourseCardData>()
  projects.forEach((project) => {
    const course = project.course
    if (course && !uniqueCoursesMap.has(course.courseId)) {
      const nameParts = course.name.split(' - ')
      const courseCode = nameParts[0] || 'COURSE'
      const courseName = nameParts[1] || course.name
      const allMembersInClass = mockCourseMembersMap[course.courseId] || []
      const totalActualMembers = allMembersInClass.length
      const actualAvatars = allMembersInClass
        .map(user => user.userProfile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`)
        .slice(0, 3)

      uniqueCoursesMap.set(course.courseId, {
        id: course.courseId,
        code: courseCode,
        name: courseName,
        lecturer: course.lecturer?.name || 'Chưa phân công',
        semester: 'Fall Semester 2026',
        projectsCount: projects.filter((p) => p.course.courseId === course.courseId).length,
        membersCount: totalActualMembers > 0 ? totalActualMembers : (course.maxStudents || 120),
        avatars: actualAvatars,
        extraMembers: totalActualMembers > 3 ? totalActualMembers - 3 : 0,
      })
    }
  })
  return Array.from(uniqueCoursesMap.values())
}

export default function TeacherCoursePage() {
  const [courses, setCourses] = useState<CourseCardData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<CourseCardData | null>(null)

  useEffect(() => {
    setCourses(transformProjectsToCourses(mockProjects))
    setLoading(false)
  }, [])

  const handleOpenCreate = () => { setSelectedCourse(null); setIsFormModalOpen(true); }
  const handleOpenEdit = (id: number) => { 
    setSelectedCourse(courses.find(c => c.id === id) || null); 
    setIsFormModalOpen(true); 
  }
  const handleOpenDelete = (id: number) => { 
    setSelectedCourse(courses.find(c => c.id === id) || null); 
    setIsDeleteModalOpen(true); 
  }

  const handleSave = (data: CourseFormData) => {
    if (selectedCourse) {
      setCourses(prev => prev.map(c => c.id === selectedCourse.id ? { ...c, name: data.name, code: data.courseCode } : c))
    } else {
      setCourses(prev => [{ id: Math.random(), ...data, code: data.courseCode, lecturer: 'Bạn', semester: 'Fall 2026', projectsCount: 0, membersCount: data.maxStudents, avatars: [], extraMembers: 0 }, ...prev])
    }
    setIsFormModalOpen(false)
  }

  const handleDelete = () => {
    setCourses(prev => prev.filter(c => c.id !== selectedCourse?.id))
    setIsDeleteModalOpen(false)
  }

  if (loading) return <LoadingSpinner message="Đang tải danh sách lớp học..." />

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text">Quản lý Lớp học</h2>
          <p className="text-sm text-text-soft mt-1">Quản lý danh sách các lớp học do bạn phụ trách.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-brand-gradient flex items-center gap-2 rounded-button px-6 py-2.5 text-sm font-semibold text-surface shadow-soft hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tạo lớp học mới
        </button>
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course}  
              basePath="/teacher/my-course"
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-surface border border-border rounded-2xl shadow-sm">
          <p className="text-text-soft">Bạn chưa tạo lớp học nào.</p>
        </div>
      )}

      <CourseFormModal 
        isOpen={isFormModalOpen} 
        onClose={() => setIsFormModalOpen(false)} 
        onSubmit={handleSave}
        initialData={selectedCourse ? { 
          courseCode: selectedCourse.code, 
          name: selectedCourse.name, 
          maxStudents: selectedCourse.membersCount, 
          groupDeadline: '',
          categoryName: '',
          categoryDescription: '',
          projectDeadline: ''
        } : null}
      />

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        title="Xóa lớp học?"
        message={
          <>
            Bạn đang chuẩn bị xóa lớp <strong>{selectedCourse?.name}</strong>. Toàn bộ dữ liệu sinh viên join lớp sẽ bị gỡ bỏ. Hành động này không thể hoàn tác.
          </>
        }
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        confirmText="Xóa lớp học"
      />
    </div>
  )
}