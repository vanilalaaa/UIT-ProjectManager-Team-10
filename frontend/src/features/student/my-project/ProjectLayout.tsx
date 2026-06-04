/**
 * ProjectLayout.tsx  (Student)
 *
 * Wraps /my-projects/:projectId with a tab mini-navbar.
 * Tabs: Overview | Members | Kanban | Submit | Grades
 */
import NestedTabLayout, { type TabItem } from '../../../components/common/NestedTabLayout'

const TABS: TabItem[] = [
  { label: 'Overview', to: 'overview' },
  { label: 'Kanban', to: 'kanban' },
  { label: 'Members', to: 'members' },
  { label: 'Submit', to: 'submit' },
  { label: 'Grades', to: 'grades' },
];

function ProjectLayout() {
  return <NestedTabLayout tabs={TABS} />
}

export default ProjectLayout