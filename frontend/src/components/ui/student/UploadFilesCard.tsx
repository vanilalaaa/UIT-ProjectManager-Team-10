import { useState, useRef, type DragEvent, type ChangeEvent } from 'react'

interface UploadFilesCardProps {
  onSubmit: (file: File | null) => void
}

export default function UploadFilesCard({ onSubmit }: UploadFilesCardProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const MAX_FILE_SIZE = 50 * 1024 * 1024
  const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'zip', 'rar']

  const validateAndSetFile = (selectedFile: File) => {
    setError(null)
    
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File vượt quá dung lượng cho phép (Max 50MB).')
      return
    }

    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      setError('Chỉ chấp nhận định dạng PDF, DOCX, ZIP, hoặc RAR.')
      return
    }

    setFile(selectedFile)
  }

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="bg-surface border border-border rounded-[18px] p-6 shadow-soft">
      <h2 className="text-base font-bold text-text mb-4">Upload Files</h2>
      
      <div 
        className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer min-h-[200px]
          ${isDragging ? 'border-primary bg-primary-soft/10' : error ? 'border-warning bg-warning-soft/10' : 'border-border bg-surface-soft hover:border-primary/50'}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !file && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".pdf,.docx,.zip,.rar"
          onChange={onFileChange}
        />

        {file ? (
          <div className="w-full flex items-center justify-between bg-surface p-4 rounded-lg border border-border shadow-sm">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="size-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div className="text-left overflow-hidden">
                <p className="font-semibold text-sm text-text truncate">{file.name}</p>
                <p className="text-xs text-text-soft">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button 
              onClick={handleRemoveFile}
              className="p-2 text-text-soft hover:text-warning hover:bg-warning-soft rounded-full transition-colors shrink-0"
            >
              <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        ) : (
          <>
            <svg className={`size-12 mb-4 ${error ? 'text-warning' : 'text-primary'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <h3 className={`font-bold text-lg mb-1 ${error ? 'text-warning' : 'text-text'}`}>
              {error ? 'Upload không hợp lệ' : 'Drag and drop files here'}
            </h3>
            <p className={`text-sm mb-4 ${error ? 'text-warning/80' : 'text-text-soft'}`}>
              {error || 'or click to browse from your computer'}
            </p>
            <span className="px-3 py-1 bg-surface border border-border text-text-soft font-bold text-[10px] rounded-full uppercase">
              PDF, DOCX, ZIP, RAR (Max 50MB)
            </span>
          </>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button 
          onClick={() => onSubmit(file)}
          disabled={!file}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-soft
            ${file ? 'bg-primary text-surface hover:bg-primary/90' : 'bg-surface-soft text-text-soft border border-border cursor-not-allowed opacity-70'}`}
        >
          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
          Submit Work
        </button>
      </div>
    </div>
  )
}