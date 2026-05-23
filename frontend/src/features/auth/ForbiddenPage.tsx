/**
 * ForbiddenPage.tsx
 * Shown when a user is authenticated but their role is not in allowedRoles.
 */
import { useNavigate } from 'react-router-dom'

function ForbiddenPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-app-bg px-4 text-center">
      <p className="text-6xl font-bold text-primary">403</p>
      <h1 className="text-xl font-semibold text-text">Không có quyền truy cập</h1>
      <p className="text-sm text-text-soft">Tài khoản của bạn không có quyền xem trang này.</p>
      <button
        className="rounded-lg bg-brand-gradient px-5 py-2 text-sm font-semibold text-surface shadow-soft"
        onClick={() => navigate(-1)}
        type="button"
      >
        Quay lại
      </button>
    </div>
  )
}

export default ForbiddenPage
