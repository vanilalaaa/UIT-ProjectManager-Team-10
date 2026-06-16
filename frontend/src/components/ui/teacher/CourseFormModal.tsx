import { useState, useEffect } from 'react'

export interface CourseFormData {
  name: string;
  code: string;
  maxStudents: number;
  startDate: string;
  endDate: string;
}

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CourseFormData) => void;
  initialData?: CourseFormData | null;
}

const EMPTY: CourseFormData = { name: '', code: '', maxStudents: 100, startDate: '', endDate: '' }

export default function CourseFormModal({ isOpen, onClose, onSubmit, initialData }: CourseFormModalProps) {
  const [formData, setFormData] = useState<CourseFormData>(EMPTY)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setError(null)
    setFormData(initialData ?? EMPTY)
  }, [initialData, isOpen])

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxStudents' ? Number(value) : name === 'code' ? value.toUpperCase() : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return setError('Vui lòng nhập tên môn học.')
    if (!initialData && !formData.code.trim()) return setError('Vui lòng nhập mã lớp.')
    if (!formData.startDate || !formData.endDate) return setError('Vui lòng chọn thời gian bắt đầu và kết thúc.')
    if (formData.startDate > formData.endDate) return setError('Ngày kết thúc phải sau ngày bắt đầu.')
    setError(null)
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in">
      <div className="bg-surface rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">

        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-text">
            {initialData ? 'Chỉnh sửa Lớp học' : 'Tạo Lớp học mới'}
          </h2>
          <button onClick={onClose} type="button" className="text-text-soft hover:text-text transition-colors">
            <svg className="size-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
            <div>
              <label className="block text-xs font-bold text-text-soft mb-1.5 uppercase tracking-wider">Tên môn học *</label>
              <input
                type="text" name="name" value={formData.name} onChange={handleChange} required
                placeholder="VD: Công nghệ phần mềm"
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-soft mb-1.5 uppercase tracking-wider">Mã lớp {initialData ? '' : '*'}</label>
              <input
                type="text" name="code" value={formData.code ?? ''} onChange={handleChange}
                disabled={!!initialData} required={!initialData}
                placeholder="VD: SE330"
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text disabled:bg-surface-soft/50 disabled:text-text-soft uppercase"
              />
              <p className="mt-1.5 text-xs text-text-soft">
                {initialData
                  ? 'Mã lớp không thể thay đổi sau khi tạo lớp.'
                  : 'Nhập mã lớp (sẽ kiểm tra trùng).'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-soft mb-1.5 uppercase tracking-wider">Sĩ số tối đa *</label>
              <input
                type="number" name="maxStudents" value={formData.maxStudents} onChange={handleChange} required min="1"
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-soft mb-1.5 uppercase tracking-wider">Ngày bắt đầu *</label>
                <input
                  type="date" name="startDate" value={formData.startDate} onChange={handleChange} required
                  className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-soft mb-1.5 uppercase tracking-wider">Ngày kết thúc *</label>
                <input
                  type="date" name="endDate" value={formData.endDate} onChange={handleChange} required
                  className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text"
                />
              </div>
            </div>

            {error ? <p className="text-sm text-red-500 font-medium">{error}</p> : null}
          </div>

          <div className="p-6 border-t border-border flex items-center justify-end gap-3 bg-surface-soft/30">
            <button
              type="button" onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-text-soft hover:text-text transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-brand-gradient hover:bg-[#209CE8] text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
            >
              {initialData ? 'Lưu thay đổi' : 'Tạo lớp học'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
