import { useState } from 'react'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (title: string, description: string) => void
}

export default function CreateProjectModal({ isOpen, onClose, onSubmit }: CreateProjectModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit(title, description)
    setTitle('')
    setDescription('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-surface p-6 rounded-2xl w-full max-w-md shadow-xl border border-border animate-fade-in">
        <h3 className="text-lg font-bold text-text mb-4">Đăng ký nội dung Project</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-soft uppercase mb-1.5">Tên đề tài</label>
            <input 
              type="text" required value={title} onChange={e => setTitle(e.target.value)}
              className="w-full border border-border rounded-lg bg-surface px-4 py-2.5 text-sm text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="Nhập tên đề tài nghiên cứu/đồ án..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-soft uppercase mb-1.5">Mô tả tóm tắt</label>
            <textarea 
              rows={4} value={description} onChange={e => setDescription(e.target.value)}
              className="w-full border border-border rounded-lg bg-surface px-4 py-2.5 text-sm text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
              placeholder="Mô tả ngắn gọn về mục tiêu và công nghệ sử dụng..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-text-soft hover:bg-surface-soft rounded-button">
              Hủy
            </button>
            <button type="submit" className="px-5 py-2 text-sm font-bold bg-primary text-surface rounded-button shadow-soft hover:bg-primary/90">
              Gửi duyệt
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}