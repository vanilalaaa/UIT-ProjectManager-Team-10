import { useState, useEffect } from 'react'

export interface ProjectFormData {
  title: string
  description: string
  maxMembers: number
  endDate: string
}

interface ProjectFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ProjectFormData) => void
  initialData?: ProjectFormData | null
  currentRegisteredMembers?: number 
}

export default function ProjectFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  currentRegisteredMembers = 0
}: ProjectFormModalProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    maxMembers: 5,
    endDate: ''
  })
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData)
      } else {
        setFormData({ title: '', description: '', maxMembers: 5, endDate: '' })
      }
      setError('')
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.title.trim() || !formData.description.trim() || !formData.endDate) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc.')
      return
    }

    if (formData.maxMembers < 1) {
      setError('Số thành viên tối đa phải lớn hơn 0.')
      return
    }

    if (initialData && formData.maxMembers < currentRegisteredMembers) {
      setError(`Không thể giảm xuống dưới ${currentRegisteredMembers} vì đã có nhóm đăng ký đạt số lượng này.`)
      return
    }

    if (formData.endDate < today) {
      setError('Deadline nộp bài không được nằm trong quá khứ.')
      return
    }

    onSubmit(formData)
  }

  const isEditing = !!initialData

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-xl rounded-2xl shadow-xl border border-border animate-fade-in-up">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h3 className="text-lg font-bold text-text">
            {isEditing ? 'Sửa Đề tài' : 'Tạo Đề tài mới'}
          </h3>
          <button onClick={onClose} className="p-1.5 text-text-soft hover:text-text hover:bg-surface-soft rounded-full transition-colors">
            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-warning-soft text-warning text-sm font-semibold rounded-lg border border-warning/20">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-text-soft uppercase tracking-wider mb-1.5">
              Tên Đề tài <span className="text-warning">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Website quản lý đồ án"
              className="w-full border border-border rounded-lg bg-surface px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-soft uppercase tracking-wider mb-1.5">
              Mô tả chi tiết <span className="text-warning">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Nhập mô tả yêu cầu đề tài..."
              className="w-full border border-border rounded-lg bg-surface px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-soft uppercase tracking-wider mb-1.5">
                Số thành viên tối đa (Nhóm) <span className="text-warning">*</span>
              </label>
              <input
                type="number"
                min="1"
                className="w-full border border-border rounded-lg bg-surface px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                value={formData.maxMembers}
                onChange={(e) => setFormData({ ...formData, maxMembers: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-soft uppercase tracking-wider mb-1.5">
                Deadline nộp bài <span className="text-warning">*</span>
              </label>
              <input
                type="date"
                min={today}
                className="w-full border border-border rounded-lg bg-surface px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-text-soft hover:text-text transition-colors">Hủy</button>
            <button type="submit" className="bg-primary hover:bg-primary/95 text-surface font-semibold px-6 py-2 rounded-button shadow-soft transition-colors text-sm flex items-center gap-2">
              {isEditing ? 'Lưu thay đổi' : 'Tạo đề tài'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}