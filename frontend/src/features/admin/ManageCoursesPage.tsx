import { useState } from 'react'
import { toast } from 'sonner'

import AdminToolbar from './components/AdminToolbar'
import { AdminEmpty, AdminError, AdminLoading } from './components/AdminStates'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import CourseFormModal from './courses/CourseFormModal'
import { useAdminCourses } from './hooks/useAdminCourses'
import type { ApiError } from '../../lib/api/axiosClient'
import type { AdminCourseListItem } from '../../types/api/course'

const formatDate = (iso: string) => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function ManageCoursesPage() {
  const { data, isLoading, error, search, setSearch, refetch, create, update, remove } =
    useAdminCourses()
  const [editing, setEditing] = useState<AdminCourseListItem | null>(null)
  const [deleting, setDeleting] = useState<AdminCourseListItem | null>(null)
  const [openForm, setOpenForm] = useState(false)

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await remove(deleting.courseId)
    } catch (err) {
      const apiErr = err as ApiError
      if (apiErr?.status !== 0 && apiErr?.status !== 401 && apiErr?.status !== 403) {
        toast.error(apiErr?.message ?? 'Xoá thất bại.')
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text">Quản lý lớp học</h1>
          <p className="text-sm text-text-soft">
            BE hiện yêu cầu role TEACHER để CRUD lớp học. Trang này dành để xem & quản trị; thao tác
            tạo/sửa có thể bị từ chối nếu bạn đang đăng nhập bằng tài khoản ADMIN.
          </p>
        </div>
      </div>

      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo tên lớp…"
        createLabel="Tạo lớp học"
        onCreate={() => {
          setEditing(null)
          setOpenForm(true)
        }}
      />

      <div className="rounded-card border border-border bg-surface shadow-soft">
        {isLoading ? (
          <AdminLoading message="Đang tải lớp học…" />
        ) : error ? (
          <AdminError message={error} onRetry={refetch} />
        ) : !data || data.length === 0 ? (
          <AdminEmpty title="Chưa có lớp học nào" hint="Bắt đầu bằng việc tạo lớp đầu tiên." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-border bg-surface-soft text-left text-xs uppercase tracking-wide text-text-soft">
                <tr>
                  <th className="px-4 py-3">Mã lớp</th>
                  <th className="px-4 py-3">Tên lớp</th>
                  <th className="px-4 py-3">Lecturer ID</th>
                  <th className="px-4 py-3">Sĩ số</th>
                  <th className="px-4 py-3">Bắt đầu</th>
                  <th className="px-4 py-3">Kết thúc</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {data.map((c) => (
                  <tr key={c.courseId} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-text-soft">{c.code}</td>
                    <td className="px-4 py-3 font-medium text-text">{c.name}</td>
                    <td className="px-4 py-3 text-text-soft">
                      {c.lecturer ?? <span className="italic text-text-soft">—</span>}
                    </td>
                    <td className="px-4 py-3">{c.maxStudents}</td>
                    <td className="px-4 py-3 text-text-soft">{formatDate(c.startDate)}</td>
                    <td className="px-4 py-3 text-text-soft">{formatDate(c.endDate)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded-md border border-border px-3 py-1 text-xs hover:bg-surface-soft"
                          onClick={() => {
                            setEditing(c)
                            setOpenForm(true)
                          }}
                          type="button"
                        >
                          Sửa
                        </button>
                        <button
                          className="rounded-md border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                          onClick={() => setDeleting(c)}
                          type="button"
                        >
                          Xoá
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CourseFormModal
        open={openForm}
        initial={editing}
        onClose={() => setOpenForm(false)}
        onCreate={create}
        onUpdate={update}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Xác nhận xoá lớp học"
        description={
          deleting ? `Bạn có chắc chắn muốn xoá lớp "${deleting.name}"? Hành động không thể hoàn tác.` : ''
        }
        confirmLabel="Xoá"
        destructive
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  )
}
