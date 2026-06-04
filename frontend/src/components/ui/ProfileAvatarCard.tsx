interface ProfileAvatarCardProps {
  user: {
    firstName: string
    lastName: string
    email: string
    avatarUrl: string
  }
}

export default function ProfileAvatarCard({ user }: ProfileAvatarCardProps) {
  const fullName = `${user.firstName} ${user.lastName}`

  return (
    <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm flex flex-col items-center text-center">
      <div className="relative mb-4">
        <img 
          src={user.avatarUrl} 
          alt={fullName}
          className="w-32 h-32 rounded-full object-cover border-4 border-surface shadow-md bg-slate-100"
        />
      </div>
      
      <h2 className="text-xl font-bold text-text mb-1">{fullName}</h2>
      <p className="text-sm text-text-soft mb-6">{user.email}</p>

      <div className="flex items-center gap-3 w-full justify-center">
        <button className="bg-[#2DD4BF] hover:bg-[#14B8A6] text-white px-5 py-2 rounded-full text-sm font-semibold transition-colors">
          Upload New
        </button>
        <button className="bg-[#F1F5F9] hover:bg-[#E2E8F0] text-text-soft px-5 py-2 rounded-full text-sm font-semibold transition-colors">
          Remove
        </button>
      </div>
    </div>
  )
}