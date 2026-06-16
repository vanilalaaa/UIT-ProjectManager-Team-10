import { useState, useRef, useEffect, type DragEvent, type ChangeEvent } from 'react'

interface UploadFilesCardProps {
  onSubmit: (file: File | null) => void
  isSubmitting?: boolean 
  isLocked?: boolean
  currentSubmission?: { id: number, url: string, name: string, date: string, rawDate?: string } | null
  dueDate?: string | null
}

export default function UploadFilesCard({ onSubmit, isSubmitting = false, isLocked = false, currentSubmission, dueDate }: UploadFilesCardProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [isEditing, setIsEditing] = useState(false)
  const [showDragDrop, setShowDragDrop] = useState(false) 
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const MAX_FILE_SIZE = 50 * 1024 * 1024
  const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'zip', 'rar']

  useEffect(() => {
    if (!currentSubmission) {
      setIsEditing(false)
      setShowDragDrop(false)
      setFile(null)
      setError(null)
    }
  }, [currentSubmission])

  const validateAndSetFile = (selectedFile: File) => {
    if (isLocked) return;
    setError(null)
    if (selectedFile.size > MAX_FILE_SIZE) return setError('File vượt quá dung lượng cho phép (Max 50MB).')
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) return setError('Chỉ chấp nhận định dạng PDF, DOCX, ZIP, hoặc RAR.')
    setFile(selectedFile)
  }

  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); if(!isLocked) setIsDragging(true) }
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false) }
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setIsDragging(false)
    if (!isLocked && e.dataTransfer.files && e.dataTransfer.files.length > 0) validateAndSetFile(e.dataTransfer.files[0])
  }
  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isLocked && e.target.files && e.target.files.length > 0) validateAndSetFile(e.target.files[0])
  }
  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation(); setFile(null); setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const renderEarlyTime = () => {
    if (!currentSubmission?.rawDate || !dueDate) return null;
    const subTime = new Date(currentSubmission.rawDate).getTime();
    const dueTime = new Date(`${dueDate}T23:59:59`).getTime();
    const diff = dueTime - subTime;

    if (diff > 0) {
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      let timeStr = '';
      if (d > 0) timeStr += `${d} ngày `;
      if (h > 0) timeStr += `${h} giờ `;
      timeStr += `${m} phút`;

      return (
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full">
          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Nộp sớm: {timeStr}
        </div>
      )
    }
    return null;
  }

  if (currentSubmission && !isEditing) {
    return (
      <div className="bg-surface border border-primary/20 rounded-[18px] p-6 shadow-soft transition-all">
        <h2 className="text-base font-bold text-text mb-4 flex items-center gap-2">
          <span className="size-2 rounded-full bg-secondary animate-pulse block"></span>
          Bài Đã Nộp
        </h2>
        <div className="w-full bg-surface-soft p-5 rounded-xl border border-border">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="size-12 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
              <svg className="size-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div className="text-left overflow-hidden">
              <a 
                href={currentSubmission.url} 
                target="_blank" rel="noopener noreferrer"
                className="font-bold text-sm text-primary hover:underline truncate block"
              >
                {currentSubmission.name}
              </a>
              <p className="text-xs text-text-soft mt-1">Đã nộp lúc: {currentSubmission.date}</p>
              {renderEarlyTime()}
            </div>
          </div>
        </div>

        {!isLocked && (
          <div className="mt-6 flex justify-end">
            <button 
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 rounded-full font-bold text-sm border-2 border-primary text-primary hover:bg-primary-soft transition-all"
            >
              Chỉnh sửa bài nộp
            </button>
          </div>
        )}
      </div>
    )
  }

  const isDeletingEmpty = isEditing && showDragDrop && !file && currentSubmission;

  return (
    <div className={`bg-surface border rounded-[18px] p-6 shadow-soft transition-colors ${isLocked ? 'border-warning/50 bg-warning-soft/10 opacity-70' : 'border-border'}`}>
      <h2 className={`text-base font-bold mb-4 ${isLocked ? 'text-warning' : 'text-text'}`}>
        {isLocked ? 'Bài nộp đã khóa' : (isEditing ? 'Cập nhật bài nộp mới' : 'Upload Files')}
      </h2>
      
      <div 
        className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all min-h-[200px]
          ${isLocked ? 'border-warning/30 bg-warning-soft/5 cursor-not-allowed' : 
            isDragging ? 'border-primary bg-primary-soft/10 cursor-pointer' : 
            error ? 'border-warning bg-warning-soft/10 cursor-pointer' : 'border-border bg-surface-soft hover:border-primary/50 cursor-pointer'}`}
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
        onClick={() => !file && !isLocked && (!isEditing || showDragDrop) && fileInputRef.current?.click()}
      >
        <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx,.zip,.rar" onChange={onFileChange}/>

        {isEditing && !showDragDrop && !file ? (
          <div className="w-full flex items-center justify-between bg-surface p-4 rounded-lg border border-primary/30 shadow-sm cursor-default" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="size-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <div className="text-left overflow-hidden">
                <p className="font-semibold text-sm text-primary truncate">{currentSubmission?.name}</p>
                <p className="text-xs text-text-soft">Bài nộp hiện tại</p>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowDragDrop(true); }} 
              className="p-2 text-warning hover:bg-warning-soft rounded-full transition-colors shrink-0"
              title="Xóa bài này để chọn file mới"
            >
              <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

        ) : file ? (
          <div className="w-full flex items-center justify-between bg-surface p-4 rounded-lg border border-primary shadow-sm cursor-default" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="size-10 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div className="text-left overflow-hidden">
                <p className="font-semibold text-sm text-text truncate">{file.name}</p>
                <p className="text-xs text-text-soft">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button onClick={handleRemoveFile} className="p-2 text-warning hover:bg-warning-soft rounded-full transition-colors shrink-0">
              <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>

        ) : (
          <>
            <svg className={`size-12 mb-4 ${isLocked ? 'text-warning/50' : error ? 'text-warning' : 'text-primary'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {isLocked ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              )}
            </svg>
            <h3 className={`font-bold text-lg mb-1 ${isLocked ? 'text-warning' : error ? 'text-warning' : 'text-text'}`}>
              {isLocked ? 'Hết hạn nộp bài' : error ? 'Upload không hợp lệ' : 'Drag and drop files here'}
            </h3>
            <p className={`text-sm mb-4 ${isLocked ? 'text-warning/80' : error ? 'text-warning/80' : 'text-text-soft'}`}>
              {isLocked ? 'Vui lòng liên hệ giảng viên.' : error || 'or click to browse from your computer'}
            </p>
            {!isLocked && <span className="px-3 py-1 bg-surface border border-border text-text-soft font-bold text-[10px] rounded-full uppercase">PDF, DOCX, ZIP, RAR (Max 50MB)</span>}
          </>
        )}
      </div>

      {!isLocked && (isEditing || file) && (
        <div className="mt-6 flex justify-end gap-3">
          {isEditing && (
            <button 
              onClick={() => { setIsEditing(false); setShowDragDrop(false); setFile(null); setError(null); }}
              className="px-6 py-2.5 rounded-full font-semibold text-sm text-text-soft hover:bg-surface-soft transition-all"
            >
              Hủy sửa
            </button>
          )}
          
          <button 
            onClick={() => onSubmit(file)}
            disabled={(!file && !isDeletingEmpty) || isSubmitting}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-soft
              ${isSubmitting 
                  ? 'bg-surface-soft text-text-soft border border-border cursor-not-allowed opacity-70'
                  : isDeletingEmpty 
                    ? 'bg-red-500 text-white hover:bg-red-600 border border-red-500 shadow-md' 
                    : (file ? 'bg-primary text-white hover:opacity-90 border border-primary shadow-md' : 'bg-surface-soft text-text-soft border border-border cursor-not-allowed opacity-70')}`}
          >
            {isSubmitting ? 'Đang xử lý...' : (isDeletingEmpty ? 'Xác nhận xóa bài' : (isEditing ? 'Xác nhận' : 'Submit Work'))}
          </button>
        </div>
      )}
    </div>
  )
}