import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import Modal from '../../../components/ui/Modal'
import { useTeacherOptions } from '../hooks/useTeacherOptions'
import type { ApiError } from '../../../lib/api/axiosClient'
import type {
  AdminCourseCreateRequest,
  AdminCourseListItem,
  AdminCourseUpdateRequest,
} from '../../../types/api/course'

const schema = z
  .object({
    name: z.string().min(2, 'Tối thiểu 2 ký tự'),
    lecturerId: z.number().int().positive('Chọn giảng viên'),
    maxStudents: z.number().int().min(1, 'Tối thiểu 1').max(500, 'Tối đa 500'),
    startDate: z.string().min(1, 'Chọn ngày bắt đầu'),
    endDate: z.string().min(1, 'Chọn ngày kết thúc'),
  })
  .refine((v) => v.startDate <= v.endDate, {
    message: 'Ngày kết thúc phải sau ngày bắt đầu',
    path: ['endDate'],
  })

type FormValues = z.infer<typeof schema>

type Props = {
  open: boolean
  initial?: AdminCourseListItem | null
  onClose: () => void
  onCreate: (payload: AdminCourseCreateRequest) => Promise<void>
  onUpdate: (id: number, payload: AdminCourseUpdateRequest) => Promise<void>
}

export default function CourseFormModal({ open, initial, onClose, onCreate, onUpdate }: Props) {
  const isEdit = !!initial
  const { options: teachers, isLoading: loadingTeachers, error: teacherError } =
    useTeacherOptions(open)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      lecturerId: 0,
      maxStudents: 40,
      startDate: '',
      endDate: '',
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      name: initial?.name ?? '',
      lecturerId: initial?.lecturer?.userId ?? initial?.lecturerId ?? 0,
      maxStudents: initial?.maxStudents ?? 40,
      startDate: initial?.startDate ?? '',
      endDate: initial?.endDate ?? '',
    })
  }, [open, initial, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && initial) {
        await onUpdate(initial.courseId, values)
      } else {
        await onCreate(values)
      }
      onClose()
    } catch (err) {
      const apiErr = err as ApiError
      if (apiErr?.status !== 0 && apiErr?.status !== 401 && apiErr?.status !== 403) {
        toast.error(apiErr?.message ?? 'Lưu thất bại.')
      }
    }
  }

  return (
    <Modal open={open} title={isEdit ? 'Chỉnh sửa lớp học' : 'Tạo lớp học mới'} onClose={onClose} size="lg">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label className="block text-sm font-medium text-text">Tên lớp học</label>
          <input
            {...register('name')}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            type="text"
          />
          {errors.name ? <p className="mt-1 text-xs text-red-500">{errors.name.message}</p> : null}
        </div>

        <div>
          <label className="block text-sm font-medium text-text">Giảng viên phụ trách</label>
          <select
            {...register('lecturerId', { valueAsNumber: true })}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            disabled={loadingTeachers}
          >
            <option value={0}>{loadingTeachers ? 'Đang tải…' : '— Chọn giảng viên —'}</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.email})
              </option>
            ))}
          </select>
          {teacherError ? <p className="mt-1 text-xs text-red-500">{teacherError}</p> : null}
          {errors.lecturerId ? (
            <p className="mt-1 text-xs text-red-500">{errors.lecturerId.message}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-text">Sĩ số tối đa</label>
            <input
              {...register('maxStudents', { valueAsNumber: true })}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              min={1}
              type="number"
            />
            {errors.maxStudents ? (
              <p className="mt-1 text-xs text-red-500">{errors.maxStudents.message}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-text">Ngày bắt đầu</label>
            <input
              {...register('startDate')}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              type="date"
            />
            {errors.startDate ? (
              <p className="mt-1 text-xs text-red-500">{errors.startDate.message}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-text">Ngày kết thúc</label>
            <input
              {...register('endDate')}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              type="date"
            />
            {errors.endDate ? (
              <p className="mt-1 text-xs text-red-500">{errors.endDate.message}</p>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <button
            type="button"
            className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-soft"
            disabled={isSubmitting}
            onClick={onClose}
          >
            Huỷ
          </button>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-surface disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang lưu…' : isEdit ? 'Lưu' : 'Tạo'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
