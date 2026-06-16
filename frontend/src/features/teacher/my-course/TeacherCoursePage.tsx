import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import CourseCard, { type CourseCardData } from '../../../components/ui/student/CourseCard'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import CourseFormModal, { type CourseFormData } from '../../../components/ui/teacher/CourseFormModal'
import ConfirmModal from '../../../components/ui/teacher/ConfirmModal'
import {
  createCourse,
  deleteCourse,
  listTeacherCourseCards,
  updateCourse,
} from '../../../services/course.service'
import type { ApiError } from '../../../lib/api/axiosClient'

const isBusinessError = (apiErr: ApiError) =>
  apiErr?.status !== 0 && apiErr?.status !== 401 && apiErr?.status !== 403

export default function TeacherCoursePage() {
  const [courses, setCourses] = useState<CourseCardData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<CourseCardData | null>(null)

  const fetchCourses = () => {
    setLoading(true)
    setError(null)
    listTeacherCourseCards()
      .then(setCourses)
      .catch((err) => {
        const apiErr = err as ApiError
        setError(apiErr?.message ?? 'Không tải được danh sách lớp.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleOpenCreate = () => {
    setSelectedCourse(null)
    setIsFormModalOpen(true)
  }
  const handleOpenEdit = (id: number) => {
    setSelectedCourse(courses.find((c) => c.id === id) || null)
    setIsFormModalOpen(true)
  }
  const handleOpenDelete = (id: number) => {
    setSelectedCourse(courses.find((c) => c.id === id) || null)
    setIsDeleteModalOpen(true)
  }

  const handleSave = async (data: CourseFormData) => {
    const payload = {
      name: data.name,
      maxStudents: data.maxStudents,
      startDate: data.startDate,
      endDate: data.endDate,
    }
    try {
      if (selectedCourse) {
        await updateCourse(selectedCourse.id, { ...payload, code: data.code.trim() })
        toast.success('Đã cập nhật lớp học.')
      } else {
        await createCourse({ ...payload, code: data.code.trim() })
        toast.success('Đã tạo lớp học.')
      }
      setIsFormModalOpen(false)
      fetchCourses()
    } catch (err) {
      const apiErr = err as ApiError
      if (isBusinessError(apiErr)) toast.error(apiErr?.message ?? 'Lưu lớp học thất bại.')
    }
  }

  const handleDelete = async () => {
    if (!selectedCourse) return
    try {
      await deleteCourse(selectedCourse.id)
      toast.success('Đã xóa lớp học.')
      setIsDeleteModalOpen(false)
      fetchCourses()
    } catch (err) {
      const apiErr = err as ApiError
      if (isBusinessError(apiErr)) toast.error(apiErr?.message ?? 'Xóa lớp học thất bại.')
    }
  }

  if (loading) return <LoadingSpinner message="Đang tải danh sách lớp học..." />

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text">Quản lý Lớp học</h2>
          <p className="text-sm text-text-soft mt-1">Quản lý danh sách các lớp học do bạn phụ trách.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-brand-gradient flex items-center gap-2 rounded-button px-6 py-2.5 text-sm font-semibold text-surface shadow-soft hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tạo lớp học mới
        </button>
      </div>

      {error ? (
        <div className="text-center py-16 bg-surface border border-border rounded-2xl shadow-sm space-y-3">
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={fetchCourses}
            className="rounded-md border border-border px-4 py-1.5 text-sm hover:bg-surface-soft"
            type="button"
          >
            Thử lại
          </button>
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              basePath="/teacher/my-course"
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-surface border border-border rounded-2xl shadow-sm">
          <p className="text-text font-semibold">Bạn chưa tạo lớp học nào</p>
          <p className="text-sm text-text-soft mt-1">Nhấn “Tạo lớp học mới” để bắt đầu.</p>
        </div>
      )}

      <CourseFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSave}
        initialData={
          selectedCourse
            ? {
                name: selectedCourse.name,
                code: selectedCourse.code,
                maxStudents: selectedCourse.maxStudents ?? selectedCourse.membersCount,
                startDate: selectedCourse.startDate ?? '',
                endDate: selectedCourse.endDate ?? '',
              }
            : null
        }
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Xóa lớp học?"
        message={
          <>
            Bạn đang chuẩn bị xóa lớp <strong>{selectedCourse?.name}</strong>. Toàn bộ dữ liệu sinh viên join lớp sẽ bị gỡ bỏ. Hành động này không thể hoàn tác.
          </>
        }
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        confirmText="Xóa lớp học"
      />
    </div>
  )
}
