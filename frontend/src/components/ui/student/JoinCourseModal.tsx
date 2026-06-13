import { useState, useEffect } from 'react'

interface JoinCourseModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (code: string) => void
  error?: string
  setError?: (error: string) => void
}

export default function JoinCourseModal({
  isOpen,
  onClose,
  onConfirm,
  error,
  setError
}: JoinCourseModalProps) {
  const [joinCode, setJoinCode] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setJoinCode('')
      if (setError) setError('')
    }
  }, [isOpen, setError])

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(joinCode)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-surface w-[320px] rounded-[24px] shadow-2xl overflow-hidden relative border border-border">
        
        <div className="h-3 w-full bg-brand-gradient absolute top-0 left-0"></div>
        
        <div className="pt-8 pb-6 px-6 flex flex-col items-center">
          <h2 className="text-[24px] font-medium text-text mb-4">Nhập mã lớp</h2>
          
          <hr className="w-4/5 border-t border-border-soft mb-6" />
          
          <input
            type="text"
            placeholder="***************"
            value={joinCode}
            onChange={(e) => {
              setJoinCode(e.target.value)
              if (setError) setError('') 
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit()
            }}
            className={`w-full bg-[#E5E7EB] text-center text-text font-mono py-2.5 rounded-full outline-none focus:ring-2 focus:ring-primary/50 transition-all tracking-[0.2em] placeholder:tracking-[0.2em] placeholder:text-text-soft/50 ${
              error ? 'border-2 border-red-400' : 'border-2 border-transparent'
            }`}
          />
          
          {error && (
            <p className="text-red-500 text-[13px] mt-3 font-medium text-center animate-fade-in">
              {error}
            </p>
          )}

          <div className="flex w-full gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full font-semibold text-text-soft hover:bg-surface-soft transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 py-2.5 rounded-full font-semibold text-surface bg-brand-gradient shadow-soft hover:opacity-90 transition-opacity"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}