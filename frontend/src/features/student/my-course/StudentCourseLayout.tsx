/**
 * StudentCourseLayout.tsx  (Student)
 *
 * Wraps /my-course/:courseId with a tab mini-navbar.
 * Tabs: Project List | My Team | Members
 */
import NestedTabLayout, { type TabItem } from '../../../components/common/NestedTabLayout'

const TABS: TabItem[] = [
  { label: 'Danh sách Đồ án', to: 'project-list' },
  { label: 'Nhóm của tôi', to: 'my-team' },
  { label: 'Thành viên', to: 'members' },
]

export default function StudentCourseLayout() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <NestedTabLayout tabs={TABS} />
    </div>
  )
}
