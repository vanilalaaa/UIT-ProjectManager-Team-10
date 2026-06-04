import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { updatePassword } from '../../services/auth.service'
import type { ApiError } from '../../lib/api/axiosClient'

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Bắt buộc'),
    newPassword: z
      .string()
      .min(8, 'Tối thiểu 8 ký tự')
      .regex(/[a-z]/, 'Cần ít nhất 1 chữ thường')
      .regex(/[A-Z]/, 'Cần ít nhất 1 chữ hoa')
      .regex(/\d/, 'Cần ít nhất 1 chữ số'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export default function PasswordSettings() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await updatePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      toast.success('Đã đổi mật khẩu.')
      reset()
    } catch (err) {
      const apiErr = err as ApiError
      if (apiErr?.status !== 0 && apiErr?.status !== 401 && apiErr?.status !== 403) {
        toast.error(apiErr?.message ?? 'Đổi mật khẩu thất bại.')
      }
    }
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
      <h3 className="text-base font-bold text-text mb-4">Đổi mật khẩu</h3>

      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <input
            {...register('currentPassword')}
            placeholder="Mật khẩu hiện tại"
            type="password"
            autoComplete="current-password"
            className="w-full border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
          />
          {errors.currentPassword ? (
            <p className="mt-1 text-xs text-red-500">{errors.currentPassword.message}</p>
          ) : null}
        </div>

        <div>
          <input
            {...register('newPassword')}
            placeholder="Mật khẩu mới"
            type="password"
            autoComplete="new-password"
            className="w-full border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
          />
          {errors.newPassword ? (
            <p className="mt-1 text-xs text-red-500">{errors.newPassword.message}</p>
          ) : null}
        </div>

        <div>
          <input
            {...register('confirmPassword')}
            placeholder="Nhập lại mật khẩu mới"
            type="password"
            autoComplete="new-password"
            className="w-full border border-border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
          />
          {errors.confirmPassword ? (
            <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-gradient flex items-center justify-center gap-2 rounded-button px-5 py-2.5 text-sm font-semibold text-surface shadow-soft hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {isSubmitting ? 'Đang xử lý…' : 'Cập nhật mật khẩu'}
        </button>
      </form>
    </div>
  )
}
