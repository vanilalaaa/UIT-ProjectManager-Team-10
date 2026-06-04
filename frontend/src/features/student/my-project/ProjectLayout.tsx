/**
 * ProjectLayout.tsx  (Student)
 *
 * Wraps /my-project/:projectId with a tab mini-navbar.
 * Tabs: Overview | Members | Kanban | Submit | Grades
 */
import NestedTabLayout, { type TabItem } from '../../../components/common/NestedTabLayout'

const TABS: TabItem[] = [
  { label: 'Tổng quan', to: 'overview' },
  { label: 'Thành viên', to: 'members' },
  { label: 'Kanban', to: 'kanban' },
  { label: 'Nộp bài', to: 'submit' },
  { label: 'Điểm số', to: 'grades' },
]

function ProjectLayout() {
  return <NestedTabLayout tabs={TABS} />
}

export default ProjectLayout
