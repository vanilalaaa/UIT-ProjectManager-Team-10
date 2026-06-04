import { useState } from 'react'
import type { UserDto } from '../../mocks/types'

export default function ProfileAvatarCard({ user }: { user: UserDto }) {
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2DD4BF&color=fff&size=256`
  const [avatar, setAvatar] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => setAvatar(event.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm flex flex-col items-center text-center">
      <img 
        src={avatar || defaultAvatar} 
        alt={user.name}
        className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-surface shadow-md bg-slate-100"
      />
      <h2 className="text-xl font-bold text-text mb-1">{user.name}</h2>
      <p className="text-sm text-text-soft mb-6">{user.email}</p>

      <div className="flex items-center gap-3 w-full justify-center">
        <input type="file" id="avatar-upload" hidden accept="image/*" onChange={handleFileChange} />
        <label htmlFor="avatar-upload" className="bg-brand-gradient flex items-center gap-2 rounded-button px-5 py-2.5 text-sm font-semibold text-surface shadow-soft hover:opacity-90 transition-opacity">
          Upload New
        </label>
        {avatar && (
          <button onClick={() => setAvatar('')} className="bg-[#F1F5F9] hover:bg-[#E2E8F0] text-text-soft px-5 py-2 rounded-full text-sm font-semibold transition-colors">
            Remove
          </button>
        )}
      </div>
    </div>
  )
}