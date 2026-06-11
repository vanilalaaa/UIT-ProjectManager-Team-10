// src/components/ui/teacher/ProjectApprovalModal.tsx
import { useEffect, useState } from 'react'
import type { ProjectApprovalRequest } from '../../../mocks/projects.mock'
import Avatar from '../Avatar'

interface ProjectApprovalModalProps {
  selectedRequest: ProjectApprovalRequest | null
  onClose: () => void
  onAccept: (requestId: number, title: string, e: React.MouseEvent, note?: string) => void
  onDecline: (requestId: number, title: string, e: React.MouseEvent, note?: string) => void
}

export default function ProjectApprovalModal({
  selectedRequest,
  onClose,
  onAccept,
  onDecline
}: ProjectApprovalModalProps) {
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    setFeedback('')
  }, [selectedRequest?.requestId])

  if (!selectedRequest) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <span className="inline-block bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-md font-semibold mb-2 border border-amber-200">
              Đang chờ duyệt
            </span>
            <h2 className="text-lg font-bold text-gray-950 leading-snug">
              {selectedRequest.title}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Trưởng nhóm: <span className="font-semibold text-gray-800">{selectedRequest.leader.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
          >
            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-5">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mô tả đề tài</h4>
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-700 leading-relaxed max-h-[180px] overflow-y-auto whitespace-pre-line">
            {selectedRequest.description}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-4 mb-6">
          <div>
            <h5 className="text-sm font-bold text-gray-900">{selectedRequest.groupName}</h5>
            <p className="text-xs text-gray-500 mt-0.5">
              Thành viên: <span className="font-semibold text-blue-500">{selectedRequest.members.length}/{selectedRequest.maxMembers}</span>
            </p>
          </div>

          <div className="flex -space-x-2 overflow-hidden">
            {selectedRequest.members.map((member) => (
              <Avatar 
                key={member.userId}
                name={member.name}
                avatarUrl={member.userProfile?.avatarUrl}
                sizeClass="size-8"
                textClass="text-xs"
                className="ring-2 ring-white !bg-sky-50 !text-sky-500"
              />
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="approval-feedback" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Nhận xét của giảng viên <span className="font-normal normal-case text-gray-400">(tùy chọn)</span>
          </label>
          <textarea
            id="approval-feedback"
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Nhập nhận xét gửi kèm khi duyệt hoặc từ chối đề tài..."
            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm text-gray-700 leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={(e) => {
              onDecline(selectedRequest.requestId, selectedRequest.title, e, feedback)
              onClose()
            }}
            className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={(e) => {
              onAccept(selectedRequest.requestId, selectedRequest.title, e, feedback)
              onClose()
            }}
            className="px-5 py-2 text-sm font-bold bg-brand-gradient from-blue-500 to-cyan-400 text-white rounded-lg hover:opacity-90 shadow-md transition-all"
          >
            Accept
          </button>
        </div>

      </div>
    </div>
  )
}