import { useState, useEffect } from 'react'

export interface CourseFormData {
  courseCode: string;
  name: string;
  maxStudents: number;
  groupDeadline: string;
  categoryName: string;       
  categoryDescription: string; 
  projectDeadline: string;
}

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CourseFormData) => void;
  initialData?: CourseFormData | null;
}

export default function CourseFormModal({ isOpen, onClose, onSubmit, initialData }: CourseFormModalProps) {
  const [formData, setFormData] = useState<CourseFormData>({
    courseCode: '',
    name: '',
    maxStudents: 100,
    groupDeadline: '',
    categoryName: '',
    categoryDescription: '',
    projectDeadline: ''
  })

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData(initialData)
    } else if (isOpen) {
      setFormData({
        courseCode: '',
        name: '',
        maxStudents: 100,
        groupDeadline: '',
        categoryName: '',
        categoryDescription: '',
        projectDeadline: ''
      })
    }
  }, [initialData, isOpen])

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxStudents' ? Number(value) : value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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
            
            {/* THÔNG TIN LỚP HỌC */}
            <div>
              <label className="block text-xs font-bold text-text-soft mb-1.5 uppercase tracking-wider">Tên môn học *</label>
              <input 
                type="text" name="name" value={formData.name} onChange={handleChange} required
                placeholder="VD: Công nghệ phần mềm"
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-soft mb-1.5 uppercase tracking-wider">Mã lớp (ID) *</label>
                <input 
                  type="text" name="courseCode" value={formData.courseCode} onChange={handleChange} required
                  placeholder="VD: SE330.O21"
                  className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-soft mb-1.5 uppercase tracking-wider">Sĩ số tối đa *</label>
                <input 
                  type="number" name="maxStudents" value={formData.maxStudents} onChange={handleChange} required min="1"
                  className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-soft mb-1.5 uppercase tracking-wider">Deadline lập nhóm *</label>
              <input 
                type="date" name="groupDeadline" value={formData.groupDeadline} onChange={handleChange} required
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text text-text-soft"
              />
              <p className="text-[12px] text-text-soft mt-1.5">Sau ngày này, sinh viên sẽ không thể tự tạo nhóm mới.</p>
            </div>

            <hr className="border-border" />

            <div>
              <label className="block text-xs font-bold text-text-soft mb-1.5 uppercase tracking-wider">Tên đề tài chung *</label>
              <input 
                type="text" name="categoryName" value={formData.categoryName} onChange={handleChange} required
                placeholder="VD: Ứng dụng Web / Ứng dụng Di động"
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-soft mb-1.5 uppercase tracking-wider">Mô tả đề tài chung *</label>
              <textarea 
                name="categoryDescription" value={formData.categoryDescription} onChange={handleChange} required
                placeholder="Nhập yêu cầu và mô tả cho đề tài..."
                rows={3}
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-soft mb-1.5 uppercase tracking-wider">Deadline nộp đồ án *</label>
              <input 
                type="date" name="projectDeadline" value={formData.projectDeadline} onChange={handleChange} required
                className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-text text-text-soft"
              />
            </div>

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