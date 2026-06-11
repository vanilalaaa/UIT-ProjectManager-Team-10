/**
 * StudentCourseLayout.tsx  (Student)
 *
 * Wraps /my-course/:courseId with a tab mini-navbar.
 * Tabs: Project List | My Team | Members
 */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import NestedTabLayout, { type TabItem } from '../../../components/common/NestedTabLayout'
import { mockProjects } from '../../../mocks/projects.mock'

const TABS: TabItem[] = [
  { label: 'Danh sách Đồ án', to: 'project-list' },
  { label: 'Nhóm của tôi', to: 'my-team' },
  { label: 'Thành viên', to: 'members' },
]

export default function StudentCourseLayout() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const [courseName, setCourseName] = useState<string>('Đang tải...')

  useEffect(() => {
    const courseIdNum = Number(courseId)
    const project = mockProjects.find(p => p.course.courseId === courseIdNum)
    
    if (project) {
      setCourseName(project.course.name)
    } else {
      setCourseName('Chi tiết khóa học') 
    }
  }, [courseId])

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      <div className="flex items-center gap-2 text-sm text-text-soft">
        <button 
          onClick={() => navigate('/my-course')} 
          className="hover:text-primary font-medium transition-colors"
        >
          My Course
        </button>
        <span className="hover:text-primary font-medium transition-colors">{'>'}</span>
        <span className="text-text font-semibold truncate max-w-[250px] sm:max-w-[400px]">
          {courseName}
        </span>
      </div>

      <NestedTabLayout tabs={TABS} />
    </div>
  )
}