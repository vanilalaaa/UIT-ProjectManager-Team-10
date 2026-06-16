import { NavLink, Outlet } from 'react-router-dom'
import type { NavLinkRenderProps } from 'react-router-dom'

export type TabItem = {
  label: string
  /** Relative path segment (no leading slash) */
  to: string
}

type Props = {
  tabs: TabItem[]
}

const tabClass = ({ isActive }: NavLinkRenderProps) =>
  [
    'whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
    isActive
      ? 'border-primary text-primary'
      : 'border-transparent text-text-soft hover:border-border hover:text-text',
  ].join(' ')

function NestedTabLayout({ tabs }: Props) {
  return (
    <div className="flex flex-col">
      {/* ── Mini Navbar (tab bar) ─────────────────────────────────────────── */}
      <nav
        aria-label="Tab navigation"
        className="flex gap-1 overflow-x-auto border-b border-border bg-surface px-4"
      >
        {tabs.map((tab) => (
          <NavLink className={tabClass} end key={tab.to} to={tab.to}>
            {tab.label}
          </NavLink>
        ))}
      </nav>

      {/* ── Child route content ───────────────────────────────────────────── */}
      <div className="p-4 md:p-6 lg:p-8">
        <Outlet />
      </div>
    </div>
  )
}

export default NestedTabLayout
