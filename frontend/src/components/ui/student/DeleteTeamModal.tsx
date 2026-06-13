interface DeleteTeamModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteTeamModal({ isOpen, onClose, onConfirm }: DeleteTeamModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="bg-surface rounded-3xl p-6 w-full max-w-sm shadow-xl transform transition-all">
        <h3 className="text-xl font-bold text-text mb-3">Xác nhận xóa nhóm</h3>
        <p className="text-sm text-text-soft mb-8">
          Hành động này sẽ bị xóa vĩnh viễn và không thể hoàn tác. Bạn chắc chắn chứ?
        </p>
        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose} 
            className="px-5 py-2 text-sm font-semibold text-text-soft hover:bg-surface-soft rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button 
            onClick={onConfirm} 
            className="bg-danger-gradient text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md hover:opacity-95 hover:shadow-lg active:scale-95 transition-all"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  )
}