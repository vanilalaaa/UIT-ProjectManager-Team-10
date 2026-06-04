/**
 * LoginPage.tsx  — temporary placeholder.
 * Replace with the real login form (react-hook-form + zod) when ready.
 *
 * The form calls authService.login(), then useAuth().login(authResponse).
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as authLogin } from '../../services/auth.service'
import { useAuth } from './AuthContext'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const res = await authLogin({ email, password })
      await login(res.data)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Đăng nhập thất bại.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg px-4">
      <div className="w-full max-w-sm rounded-card border border-border bg-surface p-8 shadow-soft">
        <h1 className="text-2xl font-semibold text-text">Đăng nhập</h1>
        <p className="mt-1 text-sm text-text-soft">EduCollaborate — Quản lý đồ án</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-text" htmlFor="login-email">
              Email
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-primary"
              id="login-email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gmail.com"
              required
              type="email"
              value={email}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text" htmlFor="login-password">
              Mật khẩu
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-soft focus:outline-none focus:ring-2 focus:ring-primary"
              id="login-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              type="password"
              value={password}
            />
          </div>

          {error ? (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          ) : null}

          {/* Disabled while submitting — PROJECT_RULES §5 */}
          <button
            className="w-full rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-surface shadow-soft disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>

        {/* Dev hint — remove before production */}
        <p className="mt-4 text-xs text-text-soft">
          Mock: admin@gmail.com / admin123 · teacher@gmail.com / teacher123 · student@gmail.com / student123
        </p>
      </div>
    </div>
  )
}

export default LoginPage
