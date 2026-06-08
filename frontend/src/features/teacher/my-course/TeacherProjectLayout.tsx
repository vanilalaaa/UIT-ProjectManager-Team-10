import NestedTabLayout, { type TabItem } from '../../../components/common/NestedTabLayout'

const TABS: TabItem[] = [
  { label: 'Project detail', to: 'projectdetail' },
  { label: 'Submit', to: 'submit' },
  { label: 'Grades', to: 'grades' },
]

function TeacherProjectLayout() {
  return <NestedTabLayout tabs={TABS} />
}

export default TeacherProjectLayout