import type { ReactNode } from 'react'
import { useState } from 'react'
import { NavLink, useLocation, type NavLinkRenderProps } from 'react-router-dom'

type IconName = 'home' | 'folder' | 'book'
type AccordionKey = 'projects' | 'courses'

type SidebarLink = {
  label: string
  to: string
}

type AccordionItem = {
  key: AccordionKey
  label: string
  icon: IconName
  activePath: string
  links: SidebarLink[]
}

type SidebarIconProps = {
  name: IconName
}

type SidebarAccordionProps = {
  item: AccordionItem
  isOpen: boolean
  isActive: boolean
  onToggle: (key: AccordionKey) => void
}

const recentProjectLinks: SidebarLink[] = [
  { label: 'Website quản lý đồ án', to: '/projects/1' },
  { label: 'Điểm danh lớp học QR', to: '/projects/2' },
  { label: 'Dashboard tiến độ', to: '/projects/5' },
]

const frequentCourseLinks: SidebarLink[] = [
  { label: 'SE330 - Công nghệ phần mềm', to: '/courses/1' },
  { label: 'PM301 - Quản lý dự án', to: '/courses/2' },
  { label: 'CS301 - Cấu trúc dữ liệu', to: '/courses/3' },
]

const accordionItems: AccordionItem[] = [
  {
    key: 'projects',
    label: 'Đồ án',
    icon: 'folder',
    activePath: '/projects',
    links: recentProjectLinks,
  },
  {
    key: 'courses',
    label: 'Môn học',
    icon: 'book',
    activePath: '/courses',
    links: frequentCourseLinks,
  },
]

const sidebarIcons: Record<IconName, ReactNode> = {
  home: (
    <path d="M3 10.5 12 3l9 7.5v8a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H4.5A1.5 1.5 0 0 1 3 18.5v-8Z" />
  ),
  folder: (
    <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h5l2 2.5h8A1.5 1.5 0 0 1 21 9v8.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11Z" />
  ),
  book: (
    <path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5v-17Zm0 0v14A2.5 2.5 0 0 1 7.5 16H20" />
  ),
}

const navLinkClass = ({ isActive }: NavLinkRenderProps) =>
  [
    'flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-primary-soft text-primary'
      : 'text-text-soft hover:bg-surface-soft hover:text-text',
  ].join(' ')

const accordionButtonClass = (isActive: boolean) =>
  [
    'flex w-full items-center justify-between rounded-lg px-4 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-primary-soft text-primary'
      : 'text-text-soft hover:bg-surface-soft hover:text-text',
  ].join(' ')

const subLinkClass = ({ isActive }: NavLinkRenderProps) =>
  [
    'block rounded-lg px-3 py-2 text-sm transition-colors',
    isActive
      ? 'bg-primary-soft text-primary'
      : 'text-text-soft hover:bg-surface-soft hover:text-text',
  ].join(' ')

function SidebarIcon({ name }: SidebarIconProps) {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {sidebarIcons[name]}
    </svg>
  )
}

function ChevronDown({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={[
        'size-4 shrink-0 transition-transform',
        isOpen ? 'rotate-180' : 'rotate-0',
      ].join(' ')}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function SidebarAccordion({ item, isOpen, isActive, onToggle }: SidebarAccordionProps) {
  const panelId = `sidebar-${item.key}-panel`

  return (
    <div>
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        className={accordionButtonClass(isActive)}
        onClick={() => onToggle(item.key)}
        type="button"
      >
        <span className="flex items-center gap-3">
          <SidebarIcon name={item.icon} />
          <span>{item.label}</span>
        </span>
        <ChevronDown isOpen={isOpen} />
      </button>

      {isOpen ? (
        <div className="mt-1 space-y-1 pl-11 pr-2" id={panelId}>
          {item.links.map((link) => (
            <NavLink key={link.to} className={subLinkClass} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function Sidebar() {
  const location = useLocation()
  const [openMenus, setOpenMenus] = useState<Record<AccordionKey, boolean>>({
    projects: location.pathname.startsWith('/projects'),
    courses: location.pathname.startsWith('/courses'),
  })

  const toggleMenu = (key: AccordionKey) => {
    setOpenMenus((current) => ({
      ...current,
      [key]: !current[key],
    }))
  }

  return (
    <aside className="flex shrink-0 flex-col border-b border-border bg-surface px-4 py-4 shadow-soft lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r lg:py-6">
      <div className="px-2">
        <NavLink className="block text-2xl font-semibold tracking-normal text-primary" to="/">
          EduCollaborate
        </NavLink>
        <p className="mt-1 hidden text-sm text-text-soft lg:block">Academic Workspace</p>
      </div>

      <NavLink
        className="mt-6 hidden items-center justify-center rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-surface shadow-soft lg:flex"
        to="/projects/new"
      >
        Tạo đồ án mới
      </NavLink>

      <nav aria-label="Điều hướng chính" className="mt-4 flex flex-col gap-1 lg:mt-6">
        <NavLink className={navLinkClass} end to="/">
          <SidebarIcon name="home" />
          <span>Trang chủ</span>
        </NavLink>

        {accordionItems.map((item) => (
          <SidebarAccordion
            isActive={location.pathname.startsWith(item.activePath)}
            isOpen={openMenus[item.key]}
            item={item}
            key={item.key}
            onToggle={toggleMenu}
          />
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
