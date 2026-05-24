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

function StudentCourseLayout() {
  return <NestedTabLayout tabs={TABS} />
}

export default StudentCourseLayout
