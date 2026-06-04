import { useState } from 'react'
import type { User, Task } from '../../mocks/types'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (task: Partial<Task>) => void
  members: User[]
}

export default function CreateTaskModal({ isOpen, onClose, onSubmit, members }: CreateTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [assigneeId, setAssigneeId] = useState<string>('')

  if (!isOpen) return null

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !assigneeId) return

    const assignedUser = members.find(m => m.userId.toString() === assigneeId)
    if (!assignedUser) return

    onSubmit({
      title,
      description,
      deadline: new Date(deadline).toISOString(),
      assignedTo: assignedUser
    })

    // Reset form
    setTitle('')
    setDescription('')
    setDeadline('')
    setAssigneeId('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-surface p-6 rounded-2xl w-full max-w-lg shadow-xl border border-border animate-fade-in-up">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-5">
          <h3 className="text-lg font-bold text-text">Thêm Task Mới</h3>
          <button onClick={onClose} className="p-1 text-text-soft hover:text-text hover:bg-surface-soft rounded-full transition-colors">
            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-soft uppercase mb-1.5">Tên Task <span className="text-warning">*</span></label>
            <input
              type="text"
              required
              className="w-full border border-border rounded-lg bg-surface px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-soft uppercase mb-1.5">Mô tả chi tiết</label>
            <textarea
              rows={3}
              className="w-full border border-border rounded-lg bg-surface px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-soft uppercase mb-1.5">Deadline <span className="text-warning">*</span></label>
              <input
                type="date"
                required
                className="w-full border border-border rounded-lg bg-surface px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-soft uppercase mb-1.5">Gán cho <span className="text-warning">*</span></label>
              <select
                required
                className="w-full border border-border rounded-lg bg-surface px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                <option value="" disabled>-- Chọn thành viên --</option>
                {members.map(m => (
                  <option key={m.userId} value={m.userId}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
            <button type="button" onClick={onClose} className="text-sm font-semibold text-text-soft hover:text-text px-4 py-2 transition-colors">
              Hủy
            </button>
            <button type="submit" className="bg-primary hover:bg-primary/95 text-surface font-semibold px-6 py-2.5 rounded-button shadow-soft transition-colors text-sm">
              Tạo Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}