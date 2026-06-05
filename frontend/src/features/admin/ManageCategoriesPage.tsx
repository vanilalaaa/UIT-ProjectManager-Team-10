import { useState } from 'react'
import { toast } from 'sonner'

import AdminToolbar from './components/AdminToolbar'
import AdminPagination from './components/AdminPagination'
import { AdminEmpty, AdminError, AdminLoading } from './components/AdminStates'
import CategoryFormModal from './categories/CategoryFormModal'
import { useAdminCategories } from './hooks/useAdminCategories'
import type { ApiError } from '../../lib/api/axiosClient'
import type { Category } from '../../types/api/category'

export default function ManageCategoriesPage() {
  const { data, isLoading, error, query, setQuery, refetch, create, update, toggleStatus } =
    useAdminCategories()
  const [editing, setEditing] = useState<Category | null>(null)
  const [openForm, setOpenForm] = useState(false)

  const handleToggleActive = async (item: Category) => {
    try {
      await toggleStatus(item.categoryId, !item.isActive)
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
          <h1 className="text-2xl font-semibold text-text">Quản lý danh mục</h1>
          <p className="text-sm text-text-soft">Phân loại đồ án theo lĩnh vực / chủ đề.</p>
        </div>
      </div>

      <AdminToolbar
        search={query.search ?? ''}
        onSearchChange={(v) => setQuery({ search: v })}
        searchPlaceholder="Tìm theo tên danh mục…"
        createLabel="Tạo danh mục"
        onCreate={() => {
          setEditing(null)
          setOpenForm(true)
        }}
        filters={
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
            <option value="false">Đã ẩn</option>
          </select>
        }
      />

      <div className="rounded-card border border-border bg-surface shadow-soft">
        {isLoading ? (
          <AdminLoading message="Đang tải danh mục…" />
        ) : error ? (
          <AdminError message={error} onRetry={refetch} />
        ) : !data || data.content.length === 0 ? (
          <AdminEmpty title="Chưa có danh mục nào" hint="Tạo danh mục đầu tiên để gắn vào đồ án." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-border bg-surface-soft text-left text-xs uppercase tracking-wide text-text-soft">
                  <tr>
                    <th className="px-4 py-3">Tên</th>
                    <th className="px-4 py-3">Mô tả</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((item) => (
                    <tr key={item.categoryId} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-text">{item.name}</td>
                      <td className="px-4 py-3 text-text-soft">{item.description}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            item.isActive
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {item.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            className="rounded-md border border-border px-3 py-1 text-xs hover:bg-surface-soft"
                            onClick={() => {
                              setEditing(item)
                              setOpenForm(true)
                            }}
                            type="button"
                          >
                            Sửa
                          </button>
                          <button
                            className="rounded-md border border-border px-3 py-1 text-xs hover:bg-surface-soft"
                            onClick={() => handleToggleActive(item)}
                            type="button"
                          >
                            {item.isActive ? 'Ẩn' : 'Hiện'}
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

      <CategoryFormModal
        open={openForm}
        initial={editing}
        onClose={() => setOpenForm(false)}
        onCreate={create}
        onUpdate={update}
      />
    </div>
  )
}
