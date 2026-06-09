import { useEffect } from 'react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string | React.ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  isDestructive?: boolean 
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Xóa',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
  isDestructive = true
}: ConfirmModalProps) {
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-md rounded-2xl shadow-xl border border-border animate-fade-in overflow-hidden">
        
        <div className="p-6">
          <div className="flex items-start gap-4 mb-2">
            {isDestructive ? (
              <div className="size-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600 mt-1 border border-red-200">
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            ) : (
              <div className="size-10 rounded-full bg-primary-soft flex items-center justify-center shrink-0 text-primary mt-1 border border-primary/20">
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-text">{title}</h3>
              <div className="text-sm text-text-soft leading-relaxed mt-2">
                {message}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-soft px-6 py-4 flex items-center justify-end gap-3 border-t border-border">
          <button 
            onClick={onCancel} 
            className="px-4 py-2 text-sm font-semibold text-text-soft hover:text-text bg-surface border border-border rounded-lg shadow-sm transition-colors hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`px-5 py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition-colors flex items-center justify-center ${
              isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {confirmText}
          </button>
        </div>
        
      </div>
    </div>
  )
}