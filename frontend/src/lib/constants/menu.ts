/**
 * menu.ts — Config-based sidebar navigation per role.
 *
 * Rules (PROJECT_RULES §2): Avoid duplicated role checks.
 * Sidebar reads this map; it never hard-codes role conditions itself.
 */
import type { Role } from '../../mocks/types'

export type NavItem = {
  label: string
  to: string
  /** SVG path data (24×24 viewBox, stroke-based) */
  iconPath: string
  /** Used to detect "active" state for parent items. */
  activePath?: string
}

export const NAV_ITEMS: Record<Role, NavItem[]> = {
  STUDENT: [
    {
      label: 'Trang chủ',
      to: '/',
      iconPath: 'M3 10.5 12 3l9 7.5v8a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H4.5A1.5 1.5 0 0 1 3 18.5v-8Z',
      activePath: '/',
    },
    {
      label: 'Đồ án của tôi',
      to: '/my-project',
      iconPath:
        'M3 6.5A1.5 1.5 0 0 1 4.5 5h5l2 2.5h8A1.5 1.5 0 0 1 21 9v8.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11Z',
      activePath: '/my-project',
    },
    {
      label: 'Lớp học của tôi',
      to: '/my-course',
      iconPath:
        'M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5v-17Zm0 0v14A2.5 2.5 0 0 1 7.5 16H20',
      activePath: '/my-course',
    },
  ],

  TEACHER: [
    {
      label: 'Trang chủ',
      to: '/',
      iconPath: 'M3 10.5 12 3l9 7.5v8a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H4.5A1.5 1.5 0 0 1 3 18.5v-8Z',
      activePath: '/',
    },
    {
      label: 'Quản lý Lớp học',
      to: '/my-course',
      iconPath:
        'M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5v-17Zm0 0v14A2.5 2.5 0 0 1 7.5 16H20',
      activePath: '/my-course',
    },
  ],

  ADMIN: [
    {
      label: 'Quản lý User',
      to: '/admin/users',
      iconPath:
        'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 4v6m3-3h-6',
      activePath: '/admin/users',
    },
    {
      label: 'Quản lý Danh mục',
      to: '/admin/categories',
      iconPath: 'M4 6h16M4 12h16M4 18h7',
      activePath: '/admin/categories',
    },
    {
      label: 'Quản lý Lớp học',
      to: '/admin/courses',
      iconPath:
        'M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5v-17Zm0 0v14A2.5 2.5 0 0 1 7.5 16H20',
      activePath: '/admin/courses',
    },
  ],
}
