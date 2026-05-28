import { useEffect, useState } from 'react'
import { getProjects } from '../../../services/project.service'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import CourseCard, { type CourseCardData } from '../../../components/ui/CourseCard'
import type { User } from '../../../mocks/types'

export default function MyCoursePage() {
  const [courses, setCourses] = useState<CourseCardData[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchCoursesAndMembers = async () => {
      setLoading(true)
      const response = await getProjects()
      
      if (response && response.data) {
        const uniqueCoursesMap = new Map<number, CourseCardData>()
        const allProjects = response.data

        allProjects.forEach((project) => {
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
                  if (!allCourseUsers.some(u => u.userId === member.userId)) {
                    allCourseUsers.push(member)
                  }
                })
              }
            })

            const totalActualMembers = allCourseUsers.length

            const actualAvatars = allCourseUsers
              .map(user => user.userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop')
              .slice(0, 3)

            uniqueCoursesMap.set(course.courseId, {
              id: course.courseId,
              code: courseCode,
              name: courseName,
              lecturer: course.lecturer?.name || 'Chưa phân công',
              semester: 'Fall Semester 2024',
              projectsCount: allProjects.filter((p) => p.course.courseId === course.courseId).length,
              membersCount: totalActualMembers > 0 ? totalActualMembers : (course.maxStudents || 120),
              avatars: actualAvatars,
              extraMembers: totalActualMembers > 3 ? totalActualMembers - 3 : 0,
            })
          }
        })
        setCourses(Array.from(uniqueCoursesMap.values()))
      }
      setLoading(false)
    }

    fetchCoursesAndMembers()
  }, [])

  if (loading) return <LoadingSpinner message="Đang tải danh sách khóa học..." />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text">My Courses</h2>
        <button
          className="bg-brand-gradient flex items-center gap-2 rounded-button px-5 py-2.5 text-sm font-semibold text-surface shadow-soft hover:opacity-90 transition-opacity"
          type="button"
        >
          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Join new course
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  )
}