function getInitials(name = '') {
  const cleanName = name.trim()
  if (!cleanName) return 'U'
  return cleanName
    .split(/\s+/)
    .slice(-2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
}

interface AvatarProps {
  name?: string
  avatarUrl?: string | null
  sizeClass?: string 
  textClass?: string 
  className?: string 
}

export default function Avatar({ 
  name = 'User', 
  avatarUrl, 
  sizeClass = 'size-10', 
  textClass = 'text-sm',
  className = ''
}: AvatarProps) {
  const initials = getInitials(name)
  const hasRealAvatar = avatarUrl && !avatarUrl.includes('ui-avatars.com')

  if (hasRealAvatar) {
    return (
      <img 
        src={avatarUrl} 
        alt={name}
        className={`${sizeClass} rounded-full object-cover shrink-0 ${className}`}
        title={name}
      />
    )
  }

  return (
    <div 
      className={`${sizeClass} rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold tracking-tight shrink-0 ${textClass} ${className}`}
      title={name}
    >
      {initials}
    </div>
  )
}