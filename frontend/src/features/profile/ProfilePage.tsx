import ProfileAvatarCard from '../../components/ui/ProfileAvatarCard'
import PasswordSettings from '../../components/ui/PasswordSettings'
import GeneralDetailsForm from '../../components/ui/GeneralDetailsForm'
import { AdminLoading, AdminError } from '../admin/components/AdminStates'
import { useAuth } from '../auth/useAuth'

export default function ProfilePage() {
  const { currentUser, isLoading } = useAuth()

  if (isLoading) return <AdminLoading message="Đang tải thông tin…" />
  if (!currentUser) return <AdminError message="Không tìm thấy người dùng." />

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">Personal Information</h1>
        <p className="text-text-soft text-sm">Update your profile details and public identity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 space-y-6">
          <ProfileAvatarCard user={currentUser} />
          <PasswordSettings />
        </div>
        <div className="lg:col-span-8">
          <GeneralDetailsForm user={currentUser} />
        </div>
      </div>
    </div>
  )
}
