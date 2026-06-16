import { useState } from 'react'
import { toast } from 'sonner'

import AdminToolbar from './components/AdminToolbar'
import AdminPagination from './components/AdminPagination'
import { AdminEmpty, AdminError, AdminLoading } from './components/AdminStates'
import UserFormModal from './users/UserFormModal'
import { useAdminUsers } from './hooks/useAdminUsers'
import type { ApiError } from '../../lib/api/axiosClient'
import type { AdminUserListItem } from '../../types/api/user'
import type { Role } from '../../types/api/auth'

const ROLES: ReadonlyArray<Role | ''> = ['', 'ADMIN', 'TEACHER', 'STUDENT']

export default function ManageUsersPage() {
  const { data, isLoading, error, query, setQuery, refetch, create, update, toggleStatus } =
    useAdminUsers()
  const [editing, setEditing] = useState<AdminUserListItem | null>(null)
  const [openForm, setOpenForm] = useState(false)

  const handleToggleActive = async (user: AdminUserListItem) => {
    try {
      await toggleStatus(user.id, !user.isActive)
    } catch (err) {
      const apiErr = err as ApiError
      if (apiErr?.status !== 0 && apiErr?.status !== 401 && apiErr?.status !== 403) {
        toast.error(apiErr?.message ?? 'Không cập nhật được trạng thái.')
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text">Quản lý người dùng</h1>
          <p className="text-sm text-text-soft">
            Quản trị tài khoản admin / giảng viên / sinh viên.
          </p>
        </div>
      </div>

      <AdminToolbar
        search={query.search ?? ''}
        onSearchChange={(v) => setQuery({ search: v })}
        searchPlaceholder="Tìm theo tên hoặc email…"
        createLabel="Tạo người dùng"
        onCreate={() => {
          setEditing(null)
          setOpenForm(true)
        }}
        filters={
          <>
            <select
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              value={query.role ?? ''}
              onChange={(e) => setQuery({ role: e.target.value as Role | '' })}
            >
              {ROLES.map((r) => (
                <option key={r || 'all'} value={r}>
                  {r ? r : 'Tất cả vai trò'}
                </option>
              ))}
            </select>

            <select
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              value={String(query.isActive ?? '')}
              onChange={(e) => {
                const value = e.target.value
                setQuery({ isActive: value === '' ? '' : value === 'true' })
              }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Đang hoạt động</option>
              <option value="false">Đã khoá</option>
            </select>
          </>
        }
      />

      <div className="rounded-card border border-border bg-surface shadow-soft">
        {isLoading ? (
          <AdminLoading message="Đang tải danh sách người dùng…" />
        ) : error ? (
          <AdminError message={error} onRetry={refetch} />
        ) : !data || data.content.length === 0 ? (
          <AdminEmpty
            title="Chưa có người dùng nào khớp bộ lọc"
            hint="Thử bỏ bớt filter hoặc tạo người dùng mới."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-border bg-surface-soft text-left text-xs uppercase tracking-wide text-text-soft">
                  <tr>
                    <th className="px-4 py-3">UID</th>
                    <th className="px-4 py-3">Họ tên</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Vai trò</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((user) => (
                    <tr key={user.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-mono text-xs text-text-soft">{user.uid}</td>
                      <td className="px-4 py-3 font-medium text-text">{user.name}</td>
                      <td className="px-4 py-3 text-text-soft">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            user.isActive
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Locked'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            className="rounded-md border border-border px-3 py-1 text-xs hover:bg-surface-soft"
                            onClick={() => {
                              setEditing(user)
                              setOpenForm(true)
                            }}
                            type="button"
                          >
                            Sửa
                          </button>
                          <button
                            className="rounded-md border border-border px-3 py-1 text-xs hover:bg-surface-soft"
                            onClick={() => handleToggleActive(user)}
                            type="button"
                          >
                            {user.isActive ? 'Khoá' : 'Mở khoá'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <AdminPagination
              page={data.number}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              pageSize={data.size}
              onPageChange={(p) => setQuery({ page: p })}
            />
          </>
        )}
      </div>

      <UserFormModal
        open={openForm}
        initial={editing}
        onClose={() => setOpenForm(false)}
        onCreate={create}
        onUpdate={update}
      />
    </div>
  )
}
