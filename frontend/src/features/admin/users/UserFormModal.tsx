import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import Modal from '../../../components/ui/Modal'
import type { ApiError } from '../../../lib/api/axiosClient'
import type {
  AdminUserCreateRequest,
  AdminUserListItem,
  AdminUserUpdateRequest,
} from '../../../types/api/user'

const ROLE_OPTIONS = ['ADMIN', 'TEACHER', 'STUDENT'] as const

const baseSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  name: z.string().min(2, 'Tối thiểu 2 ký tự'),
  role: z.enum(ROLE_OPTIONS),
  isActive: z.boolean(),
  password: z.string().min(6, 'Tối thiểu 6 ký tự').optional().or(z.literal('')),
})

type FormValues = z.infer<typeof baseSchema>

type UserFormModalProps = {
  open: boolean
  initial?: AdminUserListItem | null
  onClose: () => void
  onCreate: (payload: AdminUserCreateRequest) => Promise<void>
  onUpdate: (id: number, payload: AdminUserUpdateRequest) => Promise<void>
}

export default function UserFormModal({
  open,
  initial,
  onClose,
  onCreate,
  onUpdate,
}: UserFormModalProps) {
  const isEdit = !!initial

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      email: '',
      name: '',
      role: 'STUDENT',
      isActive: true,
      password: '',
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      email: initial?.email ?? '',
      name: initial?.name ?? '',
      role: initial?.role ?? 'STUDENT',
      isActive: initial?.isActive ?? true,
      password: '',
    })
  }, [open, initial, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && initial) {
        await onUpdate(initial.id, {
          name: values.name,
          email: values.email,
          role: values.role,
        })
      } else {
        if (!values.password) {
          toast.error('Vui lòng nhập mật khẩu cho tài khoản mới.')
          return
        }
        await onCreate({
          email: values.email,
          name: values.name,
          password: values.password,
          role: values.role,
        })
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
    <Modal open={open} title={isEdit ? 'Chỉnh sửa người dùng' : 'Tạo người dùng mới'} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label className="block text-sm font-medium text-text">Email</label>
          <input
            {...register('email')}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            type="email"
          />
          {errors.email ? <p className="mt-1 text-xs text-red-500">{errors.email.message}</p> : null}
        </div>

        <div>
          <label className="block text-sm font-medium text-text">Họ tên</label>
          <input
            {...register('name')}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            type="text"
          />
          {errors.name ? <p className="mt-1 text-xs text-red-500">{errors.name.message}</p> : null}
        </div>

        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-text">Mật khẩu</label>
            <input
              {...register('password')}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              type="password"
            />
            {errors.password ? (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            ) : null}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-text">Vai trò</label>
          <select
            {...register('role')}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-text">
          <input type="checkbox" {...register('isActive')} className="size-4 rounded border-border" />
          Đang hoạt động
        </label>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <button
            type="button"
            className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-soft"
            onClick={onClose}
            disabled={isSubmitting}
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
