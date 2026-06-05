import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { login as authLogin } from '../../services/auth.service'
import type { ApiError } from '../../lib/api/axiosClient'
import { useAuth } from './useAuth'

const loginSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

type LoginFormValues = z.infer<typeof loginSchema>

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const res = await authLogin(values)
      await login(res.data)
      toast.success('Đăng nhập thành công.')
      navigate('/', { replace: true })
    } catch (err) {
      const apiErr = err as ApiError
      const message = apiErr?.message ?? 'Đăng nhập thất bại.'

      if (apiErr?.fieldErrors) {
        for (const [field, msg] of Object.entries(apiErr.fieldErrors)) {
          if (field === 'email' || field === 'password') {
            setError(field, { type: 'server', message: msg })
          }
        }
      } else if (apiErr?.status === 429) {
        toast.error('Bạn thử đăng nhập quá nhiều lần. Vui lòng chờ vài phút.')
      } else if (apiErr?.status !== 0 && apiErr?.status !== 401 && apiErr?.status !== 403) {
        // 0/401/403 đã có toast từ axiosClient.
        toast.error(message)
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg px-4">
      <div className="w-full max-w-sm rounded-card border border-border bg-surface p-8 shadow-soft">
        <h1 className="text-2xl font-semibold text-text">Đăng nhập</h1>
        <p className="mt-1 text-sm text-text-soft">EduCollaborate — Quản lý đồ án</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label className="block text-sm font-medium text-text" htmlFor="login-email">
              Email
            </label>
            <input
              {...register('email')}
              aria-invalid={!!errors.email}
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-primary aria-[invalid=true]:border-red-500"
              id="login-email"
              placeholder="you@example.com"
              type="email"
            />
            {errors.email ? (
              <p className="mt-1 text-xs text-red-500" role="alert">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-text" htmlFor="login-password">
              Mật khẩu
            </label>
            <input
              {...register('password')}
              aria-invalid={!!errors.password}
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-primary aria-[invalid=true]:border-red-500"
              id="login-password"
              placeholder="••••••••"
              type="password"
            />
            {errors.password ? (
              <p className="mt-1 text-xs text-red-500" role="alert">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-surface shadow-soft transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? (
              <>
                <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                </svg>
                Đang đăng nhập…
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        {import.meta.env.DEV ? (
          <p className="mt-4 text-xs text-text-soft">
            Dev seed: admin@gmail.com · teacher@gmail.com · student@gmail.com · password
            <code className="ml-1 rounded bg-surface-soft px-1 py-0.5">123123</code>
          </p>
        ) : null}
      </div>
    </div>
  )
}

export default LoginPage
