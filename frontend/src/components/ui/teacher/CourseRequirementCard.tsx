import { useState, useRef } from 'react'
import type { Course, Category } from '../../../mocks/types'
import type { CourseRequirement } from '../../../mocks/tasks.mock'

interface CourseRequirementCardProps {
  course: Course;
  category?: Category | null;
  requirements?: CourseRequirement | null;
}

export default function CourseRequirementCard({ category, requirements }: CourseRequirementCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const hasRequirement = !!requirements

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() 
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files)
      setSelectedFiles(prev => [...prev, ...newFiles]) 
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setSelectedFiles(prev => [...prev, ...newFiles])
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove))
  }

  return (
    <>
      <div className="bg-surface border border-border rounded-card p-6 shadow-soft relative">
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
            <div className="flex items-start gap-3">
              <div className="bg-primary-soft text-primary p-2.5 rounded-xl mt-0.5">
                <svg className="size-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-text">
                  Đề tài: {category?.name || 'Chưa phân loại'}
                </h2>
                <p className="text-sm text-text-soft mt-0.5">
                  {category?.description || 'Giảng viên chưa cập nhật mô tả đề tài.'}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-brand-gradient text-surface text-sm font-bold rounded-button shadow-sm hover:opacity-90 transition-opacity"
            >
              <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
              {hasRequirement ? 'Chỉnh sửa' : 'Tạo yêu cầu'}
            </button>
          </div>

          <div className="bg-surface-soft rounded-xl p-5 mb-5 text-[15px] text-text-soft leading-relaxed border border-border-soft">
            <span className="font-bold text-text block mb-1">Yêu cầu đồ án:</span>
            {requirements?.description || 'Chưa có yêu cầu nào được tạo cho lớp học này.'}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-text">Hạn nộp bài chung (Deadline):</span>
            <span className="text-[15px] font-bold text-primary">
              {requirements?.deadline ? new Date(requirements.deadline).toLocaleDateString('vi-VN') : 'Chưa thiết lập'}
            </span>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40">
          <div className="bg-surface rounded-2xl w-full max-w-xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{hasRequirement ? 'Chỉnh sửa' : 'Tạo'} yêu cầu đồ án</h2>
            
            <div className="space-y-4">
              <textarea 
                className="w-full p-3 border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors"
                rows={4}
                defaultValue={requirements?.description || ''}
                placeholder="Nhập yêu cầu đồ án..."
              />
              
              <input 
                type="date" 
                className="w-full p-3 border border-border rounded-xl text-sm outline-none focus:border-primary transition-colors"
                defaultValue={requirements?.deadline || ''}
              />

              <div className="pt-2">
                <label className="text-[14px] font-bold text-text block mb-2">Tài liệu đính kèm</label>
                
                <div 
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all flex flex-col items-center justify-center cursor-pointer
                    ${isDragging ? 'border-primary bg-primary-soft/30 scale-[1.02]' : 'border-border-soft hover:border-primary/50 bg-surface-soft/30'}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    multiple 
                    className="hidden" 
                    onChange={handleFileChange} 
                    accept=".pdf,.doc,.docx,.zip,.rar"
                  />
                  
                  <svg className="size-12 text-primary mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                  
                  <h4 className="text-[15px] font-bold text-text mb-1">Drag and drop files here</h4>
                  <p className="text-sm text-text-soft mb-4">or click to browse from your computer</p>
                  
                  <div className="px-3 py-1.5 bg-surface border border-border-soft rounded-full text-[11px] font-semibold text-text-soft uppercase tracking-wider">
                    PDF, DOCX, ZIP, RAR (MAX 50MB)
                  </div>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-[150px] overflow-y-auto pr-1">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-surface border border-border-soft rounded-lg group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <svg className="size-5 text-text-soft shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                          <span className="text-sm font-medium text-text truncate max-w-[200px] sm:max-w-[300px]">
                            {file.name}
                          </span>
                          <span className="text-xs text-text-soft shrink-0">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation(); 
                            removeFile(idx);
                          }}
                          className="p-1.5 text-text-soft hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                          title="Xóa file này"
                        >
                          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border-soft">
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedFiles([]); 
                }} 
                className="px-4 py-2 text-text-soft hover:bg-surface-soft rounded-lg font-bold transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={() => {
                  setIsModalOpen(false)
                }} 
                className="px-5 py-2 bg-brand-gradient text-white rounded-button font-bold hover:opacity-90 transition-opacity shadow-sm"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}