import type { ProjectApprovalRequest } from '../../../mocks/projects.mock'
import Avatar from '../Avatar'

interface ApprovalRequestSidebarProps {
  requests: ProjectApprovalRequest[]
  onSelectRequest: (req: ProjectApprovalRequest) => void
  onAccept: (requestId: number, title: string, e: React.MouseEvent, note?: string) => void
  onDecline: (requestId: number, title: string, e: React.MouseEvent, note?: string) => void
}

export default function ApprovalRequestSidebar({
  requests,
  onSelectRequest,
  onAccept,
  onDecline
}: ApprovalRequestSidebarProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900">Yêu cầu chờ duyệt</h3>
        <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
          {requests.length}
        </span>
      </div>

      <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
        {requests.map((req) => (
          <div
            key={req.requestId}
            onClick={() => onSelectRequest(req)}
            className="bg-gray-50 border border-gray-100 hover:border-blue-300 rounded-xl p-4 transition-all cursor-pointer hover:shadow-md group relative"
          >
            <div className="flex items-start gap-3">
              <Avatar 
                name={req.leader.name}
                avatarUrl={req.leader.userProfile?.avatarUrl}
                sizeClass="size-9"
                textClass="text-sm"
                className="ring-2 ring-sky-100/50 !bg-sky-50 !text-sky-500"
              />

              <div className="overflow-hidden w-full">
                <h4 className="font-bold text-gray-900 text-sm truncate">{req.leader.name}</h4>
                <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                  {req.title}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-3 pt-2.5 border-t border-gray-200/60">
              <button
                onClick={(e) => onDecline(req.requestId, req.title, e)}
                className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={(e) => onAccept(req.requestId, req.title, e)}
                className="text-xs font-bold bg-brand-gradient text-surface px-4 py-1.5 rounded-full hover:bg-primary/90 transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-8">Không có yêu cầu nào cần duyệt.</p>
        )}
      </div>
    </div>
  )
}