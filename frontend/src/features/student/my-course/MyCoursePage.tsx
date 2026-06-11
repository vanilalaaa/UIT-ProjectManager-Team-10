import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import CourseCard, { type CourseCardData } from '../../../components/ui/student/CourseCard'
import JoinCourseModal from '../../../components/ui/student/JoinCourseModal'
import { listStudentCourseCards, requestJoinCourse } from '../../../services/course.service'
import type { ApiError } from '../../../lib/api/axiosClient'

export default function MyCoursePage() {
  const [courses, setCourses] = useState<CourseCardData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [joinError, setJoinError] = useState('')

  const fetchCourses = () => {
    setLoading(true)
    setError(null)
    listStudentCourseCards()
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

  const handleJoinCourseSubmit = async (code: string) => {
    setJoinError('')
    const codeToJoin = code.trim()
    if (!codeToJoin) {
      setJoinError('Chưa nhập mã lớp!')
      return
    }
    try {
      await requestJoinCourse({ code: codeToJoin })
      toast.success('Đã gửi yêu cầu tham gia lớp. Vui lòng chờ giảng viên duyệt.')
      setIsJoinModalOpen(false)
    } catch (err) {
      const apiErr = err as ApiError
      if (apiErr?.status !== 0 && apiErr?.status !== 401 && apiErr?.status !== 403) {
        setJoinError(apiErr?.message || 'Tham gia lớp thất bại.')
      }
    }
  }

  if (loading) return <LoadingSpinner message="Đang tải danh sách khóa học..." />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text">Lớp học của tôi</h2>
        <button
          onClick={() => setIsJoinModalOpen(true)}
          className="bg-brand-gradient flex items-center gap-2 rounded-button px-5 py-2.5 text-sm font-semibold text-surface shadow-soft hover:opacity-90 transition-opacity"
          type="button"
        >
          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tham gia lớp mới
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
      ) : courses.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-border rounded-2xl shadow-sm">
          <p className="text-text font-semibold">Bạn chưa tham gia lớp học nào</p>
          <p className="text-sm text-text-soft mt-1">Nhấn “Tham gia lớp mới” và nhập mã lớp từ giảng viên.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

      <JoinCourseModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onConfirm={handleJoinCourseSubmit}
        error={joinError}
        setError={setJoinError}
      />
    </div>
  )
}
