import { useState, useEffect } from 'react'
import ProfileAvatarCard from '../../components/ui/ProfileAvatarCard'
import PasswordSettings from '../../components/ui/PasswordSettings'
import GeneralDetailsForm from '../../components/ui/GeneralDetailsForm'
import { MOCK_ME_RESPONSES } from '../../mocks/auth.mock'
import type { UserDto } from '../../mocks/types'

export default function ProfilePage() {
  const [user, setUser] = useState<UserDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const email = localStorage.getItem('userEmail') || 'student@gmail.com'
    const response = MOCK_ME_RESPONSES[email]
    
    if (response) {
      setUser(response.data) // Nhận đúng UserDto từ mock
    }
    setLoading(false)
  }, [])

  if (loading) return <div>Đang tải thông tin...</div>
  if (!user) return <div>Không tìm thấy người dùng.</div>

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">Personal Information</h1>
        <p className="text-text-soft text-sm">Update your profile details and public identity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 space-y-6">
          <ProfileAvatarCard user={user} />
          <PasswordSettings userEmail={user.email} />
        </div>
        <div className="lg:col-span-8">
          <GeneralDetailsForm user={user} />
        </div>
      </div>
    </div>
  )
}