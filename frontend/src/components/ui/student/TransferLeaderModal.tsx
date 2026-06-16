import type { TeamMember } from '../../../types/api/team'

interface TransferLeaderModalProps {
  isOpen: boolean
  onClose: () => void
  members: TeamMember[]
  onTransfer: (newLeaderId: number) => void
}

export default function TransferLeaderModal({ isOpen, onClose, members, onTransfer }: TransferLeaderModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-surface p-6 rounded-2xl w-full max-w-md shadow-xl border border-border animate-fade-in">
        <h3 className="text-lg font-bold text-text mb-2">Chuyển quyền Trưởng nhóm</h3>
        <p className="text-sm text-text-soft mb-4">Bạn phải chọn một thành viên khác làm Leader trước khi rời đi.</p>
        <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
          {members.map(m => (
            <div key={m.userId} className="flex items-center justify-between p-3 border border-border rounded-xl hover:bg-surface-soft/50 transition-colors">
              <span className="text-sm font-bold text-text">{m.name}</span>
              <button 
                onClick={() => onTransfer(m.userId)} 
                className="text-xs bg-primary-soft text-primary px-3 py-1.5 rounded-lg font-bold hover:bg-primary hover:text-surface transition-colors"
              >
                Giao quyền
              </button>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="w-full py-2 text-sm font-semibold text-text-soft border border-border rounded-button">
          Hủy bỏ
        </button>
      </div>
    </div>
  )
}