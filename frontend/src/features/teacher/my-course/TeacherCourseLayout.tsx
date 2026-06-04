/**
 * TeacherCourseLayout.tsx  (Teacher)
 *
 * Wraps /my-course/:courseId with a tab mini-navbar.
 * Tabs: Project List | Teams | Members
 */
import NestedTabLayout, { type TabItem } from '../../../components/common/NestedTabLayout'

const TABS: TabItem[] = [
  { label: 'Danh sách Đồ án', to: 'project-list' },
  { label: 'Nhóm', to: 'teams' },
  { label: 'Thành viên', to: 'members' },
]

function TeacherCourseLayout() {
  return <NestedTabLayout tabs={TABS} />
}

export default TeacherCourseLayout
