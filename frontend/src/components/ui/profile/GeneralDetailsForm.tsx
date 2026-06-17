import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { updateMe } from '../../../services/auth.service'
import type { ApiError } from '../../../lib/api/axiosClient'
import type { UpdateMeRequest, UserDto } from '../../../types/api/auth'

const schema = z.object({
  firstName: z.string().min(1, 'Bắt buộc'),
  lastName: z.string().optional().or(z.literal('')),
  summary: z.string().max(500, 'Tối đa 500 ký tự').optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

type Props = {
  user: UserDto
  newAvatar: string | null
  onUpdated?: (next: UserDto) => void
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length <= 1) return { firstName: parts[0] ?? '', lastName: '' }
  const lastName = parts.pop() as string
  return { firstName: parts.join(' '), lastName }
}

export default function GeneralDetailsForm({ user, newAvatar, onUpdated }: Props) {
  const initial = splitName(user.name)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const hasAvatarChanged = newAvatar !== null

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: initial.firstName, lastName: initial.lastName, summary: '' },
  })

  useEffect(() => {
    const next = splitName(user.name)
    reset({ firstName: next.firstName, lastName: next.lastName, summary: '' })
  }, [user.name, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      const payload: UpdateMeRequest = {
        name: `${values.firstName} ${values.lastName}`.trim(),
        firstName: values.firstName,
        lastName: values.lastName,
        summary: values.summary || '',
        avatarUrl: newAvatar === null ? undefined : newAvatar, // '' = xóa avatar
      }
      const res = await updateMe(payload)
      
      setShowSuccessModal(true)
      setTimeout(() => setShowSuccessModal(false), 3000)
      
      onUpdated?.(res.data)
      reset({ ...values }) 
    } catch (err) {
      const apiErr = err as ApiError
      if (apiErr?.status !== 0 && apiErr?.status !== 401 && apiErr?.status !== 403) {
        toast.error(apiErr?.message ?? 'Cập nhật thất bại.')
      }
    }
  }

  return (
    <>
      <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-text mb-4">General Details</h2>
        <hr className="border-border mb-6" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-text-soft mb-1.5">First Name</label>
              <input
                {...register('firstName')}
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]/50 focus:border-[#2DD4BF]"
              />
              {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-text-soft mb-1.5">Last Name</label>
              <input
                {...register('lastName')}
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]/50 focus:border-[#2DD4BF]"
              />
              {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-text-soft mb-1.5">UID (MSSV / Mã GV)</label>
              <input
                disabled
                value={user.uid}
                className="w-full bg-surface-soft border border-border rounded-lg px-4 py-2.5 text-sm text-text-soft cursor-not-allowed outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-soft mb-1.5">Email</label>
              <input
                disabled
                value={user.email}
                className="w-full bg-surface-soft border border-border rounded-lg px-4 py-2.5 text-sm text-text-soft cursor-not-allowed outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-soft mb-1.5">Bio</label>
            <textarea
              rows={4}
              {...register('summary')}
              placeholder="Tell us about yourself..."
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]/50 focus:border-[#2DD4BF] resize-none"
            />
            {errors.summary && <p className="mt-1 text-xs text-red-500">{errors.summary.message}</p>}
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || (!isDirty && !hasAvatarChanged)}
              className={`flex items-center gap-2 rounded-button px-5 py-2.5 text-sm font-semibold text-surface shadow-soft transition-all duration-200 ${
                (isDirty || hasAvatarChanged) && !isSubmitting
                  ? 'bg-brand-gradient cursor-pointer hover:opacity-90' 
                  : 'bg-brand-gradient opacity-40 cursor-not-allowed shadow-none'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-text/20 backdrop-blur-sm animate-fade-in px-4">
          <div className="w-full max-w-md overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-card">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary">
                  <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="pt-1">
                  <h3 className="text-lg font-bold text-text">Cập nhật thành công!</h3>
                  <p className="mt-2 text-sm text-text-soft leading-relaxed">
                    Thông tin hồ sơ của bạn đã được cập nhật vào hệ thống.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-surface-soft px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="cursor-pointer rounded-lg bg-brand-gradient px-6 py-2 text-sm font-semibold text-surface shadow-soft hover:opacity-90 transition-opacity"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}