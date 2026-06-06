import { useState } from 'react'
import type { Course, Category } from '../../mocks/types'
import type { CourseRequirement } from '../../mocks/tasks.mock'

interface CourseRequirementCardProps {
  course: Course;
  category?: Category | null;
  requirements?: CourseRequirement | null;
}

export default function CourseRequirementCard({ category, requirements }: CourseRequirementCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const hasRequirement = !!requirements

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
          <div className="bg-surface rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">{hasRequirement ? 'Chỉnh sửa' : 'Tạo'} yêu cầu đồ án</h2>
            <div className="space-y-4">
              <textarea 
                className="w-full p-3 border border-border rounded-xl text-sm"
                rows={4}
                defaultValue={requirements?.description || ''}
              />
              <input 
                type="date" 
                className="w-full p-3 border border-border rounded-xl text-sm"
                defaultValue={requirements?.deadline || ''}
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-text-soft font-bold">Hủy</button>
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-primary text-white rounded-button font-bold">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}