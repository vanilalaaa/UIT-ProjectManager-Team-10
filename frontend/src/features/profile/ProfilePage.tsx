import React from 'react'
import { MOCK_ME_RESPONSES } from '../../mocks/auth.mock'

import ProfileAvatarCard from '../../components/ui/ProfileAvatarCard'
import PasswordSettings from '../../components/ui/PasswordSettings'
import GeneralDetailsForm from '../../components/ui/GeneralDetailsForm'

export default function ProfilePage() {
  const authUser = MOCK_ME_RESPONSES['student@gmail.com'].data

  const nameParts = authUser.name.split(' ')
  const lastName = nameParts.pop() || ''
  const firstName = nameParts.join(' ')

  const currentUserProfile = {
    firstName: firstName,
    lastName: lastName,
    email: authUser.email,
    studentId: authUser.uid,
    
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.name)}&background=2DD4BF&color=fff&size=256`,
    
    major: 'Kỹ thuật phần mềm',
    className: 'KTPM2022',
    bio: 'Đam mê UI/UX design và phát triển front-end. Đang tìm kiếm đồng đội làm dự án mã nguồn mở.'
  }

  return (
    <div className="max-w-7xl mx-auto pb-10">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">Personal Information</h1>
        <p className="text-text-soft text-sm">
          Update your profile details and public identity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 space-y-6">
          <ProfileAvatarCard user={currentUserProfile} />
          <PasswordSettings />
        </div>

        <div className="lg:col-span-8">
          <GeneralDetailsForm user={currentUserProfile} />
        </div>
      </div>

    </div>
  )
}