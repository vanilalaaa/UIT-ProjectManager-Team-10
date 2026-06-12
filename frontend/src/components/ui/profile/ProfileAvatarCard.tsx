import { useState } from 'react'
import Avatar from '../Avatar'
import type { UserDto } from '../../../mocks/types'

export default function ProfileAvatarCard({ user }: { user: UserDto }) {
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
    <div className="glass-panel rounded-[var(--radius-card)] p-8 flex flex-col items-center text-center">
      
      <Avatar 
        name={user.name} 
        avatarUrl={avatar}
        sizeClass="size-32 mb-4 border-4 border-surface shadow-md" 
        textClass="text-5xl" 
      />

      <h2 className="text-xl font-bold text-text mb-1">{user.name}</h2>
      <p className="text-sm text-text-soft mb-6">{user.email}</p>

      <div className="flex items-center gap-3 w-full justify-center">
        <input type="file" id="avatar-upload" hidden accept="image/*" onChange={handleFileChange} />
        
        <label 
          htmlFor="avatar-upload" 
          className="cursor-pointer bg-brand-gradient flex items-center gap-2 rounded-button px-5 py-2.5 text-sm font-semibold text-surface shadow-soft hover:opacity-90 transition-opacity"
        >
          Upload New
        </label>
        
        {avatar && (
          <button 
            onClick={() => setAvatar('')} 
            className="cursor-pointer bg-surface-soft hover:bg-border-soft text-text-soft px-5 py-2 rounded-button text-sm font-semibold transition-colors"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  )
}