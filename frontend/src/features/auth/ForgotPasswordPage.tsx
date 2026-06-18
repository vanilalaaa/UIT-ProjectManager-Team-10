/**
 * ForgotPasswordPage.tsx — Two-step password recovery.
 *
 *   Step 1 (email)  → POST /auth/forgot-password  → gửi OTP về email
 *   Step 2 (reset)  → POST /auth/reset-password   → email + otp + newPassword
 *
 * Backend OTP: 6 chữ số, hết hạn sau 10 phút, dùng một lần.
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { forgotPassword, resetPassword } from '../../services/auth.service'
import type { ApiError } from '../../lib/api/axiosClient'

// ── Schemas ─────────────────────────────────────────────────────────────────
const emailSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
})
type EmailFormValues = z.infer<typeof emailSchema>

const resetSchema = z
  .object({
    otp: z
      .string()
      .min(1, 'Vui lòng nhập mã OTP')
      .regex(/^\d{6}$/, 'OTP gồm 6 chữ số'),
    newPassword: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu nhập lại không khớp',
  })
type ResetFormValues = z.infer<typeof resetSchema>

const inputClass =
  'mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-primary aria-[invalid=true]:border-red-500'
const labelClass = 'block text-sm font-medium text-text'

function Spinner() {
  return (
    <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
    </svg>
  )
}

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'email' | 'reset'>('email')
  const [email, setEmail] = useState('')

  // ── Step 1: yêu cầu OTP ────────────────────────────────────────────────────
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  })

  const onSubmitEmail = async (values: EmailFormValues) => {
    try {
      await forgotPassword({ email: values.email })
      setEmail(values.email)
      setStep('reset')
      toast.success('Nếu email tồn tại, mã OTP đã được gửi tới hộp thư của bạn.')
    } catch (err) {
      const apiErr = err as ApiError
      if (apiErr?.status === 0) return
      toast.error(apiErr?.message || 'Không gửi được mã OTP. Vui lòng thử lại.')
    }
  }

  // ── Step 2: đặt lại mật khẩu ────────────────────────────────────────────────
  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { otp: '', newPassword: '', confirmPassword: '' },
  })

  const onSubmitReset = async (values: ResetFormValues) => {
    try {
      await resetPassword({ email, otp: values.otp, newPassword: values.newPassword })
      toast.success('Đặt lại mật khẩu thành công. Vui lòng đăng nhập.')
      navigate('/login', { replace: true })
    } catch (err) {
      const apiErr = err as ApiError
      if (apiErr?.status === 0) return

      const msg = apiErr?.message?.toLowerCase() ?? ''
      if (msg.includes('otp')) {
        resetForm.setError('otp', {
          type: 'server',
          message: msg.includes('expired') ? 'Mã OTP đã hết hạn.' : 'Mã OTP không đúng.',
        })
        return
      }
      toast.error(apiErr?.message || 'Đặt lại mật khẩu thất bại.')
    }
  }

  const resendOtp = async () => {
    try {
      await forgotPassword({ email })
      toast.success('Đã gửi lại mã OTP mới.')
    } catch {
      toast.error('Không gửi lại được mã OTP.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg px-4">
      <div className="w-full max-w-sm rounded-card border border-border bg-surface p-8 shadow-soft">
        <h1 className="text-2xl text-center font-semibold text-text">
          {step === 'email' ? 'Quên mật khẩu' : 'Đặt lại mật khẩu'}
        </h1>
        <p className="mt-2 text-center text-sm text-text-soft">
          {step === 'email'
            ? 'Nhập email của bạn để nhận mã OTP đặt lại mật khẩu.'
            : `Nhập mã OTP đã gửi tới ${email} và mật khẩu mới.`}
        </p>

        {step === 'email' ? (
          <form
            className="mt-6 space-y-4"
            onSubmit={emailForm.handleSubmit(onSubmitEmail)}
            noValidate
          >
            <div>
              <label className={labelClass} htmlFor="fp-email">
                Email
              </label>
              <input
                {...emailForm.register('email')}
                aria-invalid={!!emailForm.formState.errors.email}
                autoComplete="email"
                className={inputClass}
                id="fp-email"
                placeholder="you@example.com"
                type="email"
              />
              {emailForm.formState.errors.email ? (
                <p className="mt-1 text-xs text-red-500" role="alert">
                  {emailForm.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <button
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-surface shadow-soft transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
              disabled={emailForm.formState.isSubmitting}
              type="submit"
            >
              {emailForm.formState.isSubmitting ? (
                <>
                  <Spinner />
                  Đang gửi…
                </>
              ) : (
                'Gửi mã OTP'
              )}
            </button>
          </form>
        ) : (
          <form
            className="mt-6 space-y-4"
            onSubmit={resetForm.handleSubmit(onSubmitReset)}
            noValidate
          >
            <div>
              <label className={labelClass} htmlFor="fp-otp">
                Mã OTP
              </label>
              <input
                {...resetForm.register('otp')}
                aria-invalid={!!resetForm.formState.errors.otp}
                autoComplete="one-time-code"
                className={`${inputClass} tracking-[0.5em]`}
                id="fp-otp"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                type="text"
              />
              {resetForm.formState.errors.otp ? (
                <p className="mt-1 text-xs text-red-500" role="alert">
                  {resetForm.formState.errors.otp.message}
                </p>
              ) : null}
            </div>

            <div>
              <label className={labelClass} htmlFor="fp-new-password">
                Mật khẩu mới
              </label>
              <input
                {...resetForm.register('newPassword')}
                aria-invalid={!!resetForm.formState.errors.newPassword}
                autoComplete="new-password"
                className={inputClass}
                id="fp-new-password"
                placeholder="••••••••"
                type="password"
              />
              {resetForm.formState.errors.newPassword ? (
                <p className="mt-1 text-xs text-red-500" role="alert">
                  {resetForm.formState.errors.newPassword.message}
                </p>
              ) : null}
            </div>

            <div>
              <label className={labelClass} htmlFor="fp-confirm-password">
                Nhập lại mật khẩu
              </label>
              <input
                {...resetForm.register('confirmPassword')}
                aria-invalid={!!resetForm.formState.errors.confirmPassword}
                autoComplete="new-password"
                className={inputClass}
                id="fp-confirm-password"
                placeholder="••••••••"
                type="password"
              />
              {resetForm.formState.errors.confirmPassword ? (
                <p className="mt-1 text-xs text-red-500" role="alert">
                  {resetForm.formState.errors.confirmPassword.message}
                </p>
              ) : null}
            </div>

            <button
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-surface shadow-soft transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
              disabled={resetForm.formState.isSubmitting}
              type="submit"
            >
              {resetForm.formState.isSubmitting ? (
                <>
                  <Spinner />
                  Đang đặt lại…
                </>
              ) : (
                'Đặt lại mật khẩu'
              )}
            </button>

            <div className="flex items-center justify-between text-xs">
              <button
                className="font-medium text-primary hover:underline disabled:opacity-60"
                disabled={resetForm.formState.isSubmitting}
                onClick={resendOtp}
                type="button"
              >
                Gửi lại mã OTP
              </button>
              <button
                className="font-medium text-text-soft hover:underline"
                onClick={() => setStep('email')}
                type="button"
              >
                Đổi email
              </button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-text-soft">
          <Link className="font-medium text-primary hover:underline" to="/login">
            Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
