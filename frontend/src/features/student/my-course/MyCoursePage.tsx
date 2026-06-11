import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import CourseCard, { type CourseCardData } from '../../../components/ui/student/CourseCard'
import JoinCourseModal from '../../../components/ui/student/JoinCourseModal' 
import type { User, Project } from '../../../mocks/types'

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

      const allCourseUsers: User[] = []
      const courseGroups = course.groups || []
      
      courseGroups.forEach((group) => {
        if (group.members) {
          group.members.forEach((m) => {
            const member = m as User
            if (member && !allCourseUsers.some(u => u.userId === member.userId)) {
              allCourseUsers.push(member)
            }
          })
        }
      })

      const totalActualMembers = mockCourseMembersMap[course.courseId]?.length || allCourseUsers.length
      
      const memberAvatars = (mockCourseMembersMap[course.courseId] || allCourseUsers)
        .map(user => ({
          name: user.name,
          avatarUrl: user.userProfile?.avatarUrl || null 
        }))
        .slice(0, 3)

      uniqueCoursesMap.set(course.courseId, {
        id: course.courseId,
        code: courseCode,
        name: courseName,
        lecturer: course.lecturer?.name || 'Chưa phân công',
        semester: 'Fall Semester 2026',
        projectsCount: projects.filter((p) => p.course.courseId === course.courseId).length,
        membersCount: totalActualMembers,
        memberAvatars: memberAvatars, 
        extraMembers: totalActualMembers > 3 ? totalActualMembers - 3 : 0,
        _maxStudents: course.maxStudents || 120 
      } as CourseCardData & { _maxStudents: number })
    }
  })
  
  return Array.from(uniqueCoursesMap.values())
}

export default function MyCoursePage() {
  const [courses, setCourses] = useState<CourseCardData[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [joinError, setJoinError] = useState('')

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    setTimeout(() => {
      if (isMounted) {
        setCourses(transformProjectsToCourses(mockProjects))
        setLoading(false)
      }
    }, 500)
    
    return () => { isMounted = false }
  }, [])

  const handleJoinCourseSubmit = (code: string) => {
    setJoinError('')
    const codeToJoin = code.trim().toUpperCase()

    if (!codeToJoin) {
      setJoinError('Chưa nhập mã lớp!')
      return
    }

    const allDatabaseCourses = transformProjectsToCourses(mockProjects) as Array<CourseCardData & { _maxStudents: number }>
    const targetCourse = allDatabaseCourses.find(c => c.code.toUpperCase() === codeToJoin || c.id.toString() === codeToJoin)

    if (!targetCourse) {
      setJoinError('Mã lớp không tồn tại!')
      return
    }

    if (courses.some(c => c.id === targetCourse.id)) {
      setJoinError('Bạn đã tham gia lớp học này rồi!')
      return
    }

    if (targetCourse.membersCount >= targetCourse._maxStudents) {
      setJoinError(`Lớp này đã đạt sĩ số tối đa (${targetCourse._maxStudents} SV). Rất tiếc!`)
      return
    }

    toast.success(`Đã vào lớp ${targetCourse.code} thành công!`)
    setCourses(prev => [...prev, targetCourse])
    setIsJoinModalOpen(false)
  }

  if (loading) return <LoadingSpinner message="Đang tải danh sách khóa học..." />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text">Lớp học của tôi</h2>
        <button
          onClick={() => setIsJoinModalOpen(true)}
          className="bg-brand-gradient flex items-center gap-2 rounded-button px-5 py-2.5 text-sm font-semibold text-surface shadow-soft hover:opacity-90 transition-opacity"
          type="button"
        >
          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tham gia lớp mới
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      <JoinCourseModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onConfirm={handleJoinCourseSubmit}
        error={joinError}
        setError={setJoinError}
      />
    </div>
  )
}