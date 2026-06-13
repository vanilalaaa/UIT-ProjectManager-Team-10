import { useState } from 'react'

interface CreateTeamModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (teamName: string, description: string) => void
}

export default function CreateTeamModal({ isOpen, onClose, onSubmit }: CreateTeamModalProps) {
  const [teamName, setTeamName] = useState('')
  const [description, setDescription] = useState('')

  if (!isOpen) return null

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamName.trim()) return
    onSubmit(teamName, description)
    setTeamName('')
    setDescription('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-surface p-6 rounded-2xl w-full max-w-md shadow-xl border border-border animate-fade-in">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
          <h3 className="text-lg font-bold text-text">Tạo nhóm mới</h3>
          <button 
            onClick={onClose} 
            className="p-1 text-text-soft hover:text-text hover:bg-surface-soft rounded-full transition-colors"
          >
            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-soft uppercase mb-1.5">Tên nhóm <span className="text-warning">*</span></label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Nhóm 05 - Phoenix"
              className="w-full border border-border rounded-lg bg-surface px-4 py-2.5 text-sm text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-text-soft/60"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-soft uppercase mb-1.5">Mô tả nhóm</label>
            <textarea
              rows={3}
              placeholder="Nhập mục tiêu hoặc mô tả ngắn gọn về nhóm của bạn..."
              className="w-full border border-border rounded-lg bg-surface px-4 py-2.5 text-sm text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none placeholder:text-text-soft/60"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="text-sm font-semibold text-text-soft hover:text-text px-4 py-2 transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="bg-primary hover:bg-primary/95 text-surface font-semibold px-5 py-2.5 rounded-button shadow-soft transition-colors text-sm"
            >
              Tạo nhóm
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}