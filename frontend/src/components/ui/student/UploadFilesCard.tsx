import { useState, useRef, useEffect, type ChangeEvent, type DragEvent } from 'react'

type SubmittedFile = {
  id: number
  url: string
  name: string
  date: string
}

interface UploadFilesCardProps {
  onSubmit: (files: File[], deleteIds: number[]) => void
  isSubmitting?: boolean
  isLocked?: boolean
  currentSubmissions?: SubmittedFile[]
}

const MAX_FILES = 5
const MAX_TOTAL_SIZE = 50 * 1024 * 1024
const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'zip', 'rar']

export default function UploadFilesCard({
  onSubmit,
  isSubmitting = false,
  isLocked = false,
  currentSubmissions = [],
}: UploadFilesCardProps) {
  const [files, setFiles] = useState<File[]>([])
  const [deleteIds, setDeleteIds] = useState<number[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (currentSubmissions.length === 0) {
      setIsEditing(false)
      setFiles([])
      setDeleteIds([])
      setError(null)
    }
  }, [currentSubmissions.length])

  const keptSubmissions = currentSubmissions.filter((submission) => !deleteIds.includes(submission.id))
  const selectedTotalSize = files.reduce((sum, file) => sum + file.size, 0)
  const hasChanges = files.length > 0 || deleteIds.length > 0

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const validateAndSetFiles = (selectedFiles: FileList | File[]) => {
    if (isLocked) return
    setError(null)

    const mergedFiles = [...files]
    Array.from(selectedFiles).forEach((file) => {
      const isDuplicate = mergedFiles.some(
        (existing) =>
          existing.name === file.name &&
          existing.size === file.size &&
          existing.lastModified === file.lastModified,
      )
      if (!isDuplicate) mergedFiles.push(file)
    })

    if (keptSubmissions.length + mergedFiles.length > MAX_FILES) {
      return setError(`Chỉ được nộp tối đa ${MAX_FILES} file.`)
    }

    const invalidFile = mergedFiles.find((file) => {
      const extension = file.name.split('.').pop()?.toLowerCase()
      return !extension || !ALLOWED_EXTENSIONS.includes(extension)
    })
    if (invalidFile) {
      return setError('Chỉ chấp nhận định dạng PDF, DOCX, ZIP, hoặc RAR.')
    }

    const totalSize = mergedFiles.reduce((sum, file) => sum + file.size, 0)
    if (totalSize > MAX_TOTAL_SIZE) {
      return setError(`Tổng dung lượng file mới vượt quá ${formatFileSize(MAX_TOTAL_SIZE)}.`)
    }

    setFiles(mergedFiles)
  }

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!isLocked) setIsDragging(true)
  }

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (!isLocked && e.dataTransfer.files.length > 0) {
      validateAndSetFiles(e.dataTransfer.files)
    }
  }

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isLocked && e.target.files && e.target.files.length > 0) {
      validateAndSetFiles(e.target.files)
      e.target.value = ''
    }
  }

  const removeNewFile = (e: React.MouseEvent, fileName: string) => {
    e.stopPropagation()
    setError(null)
    setFiles((prev) => prev.filter((file) => file.name !== fileName))
  }

  const toggleDeleteExisting = (id: number) => {
    setError(null)
    setDeleteIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id])
  }

  const resetEditing = () => {
    setIsEditing(false)
    setFiles([])
    setDeleteIds([])
    setError(null)
  }

  const startEditing = () => {
    setIsEditing(true)
    setFiles([])
    setDeleteIds([])
    setError(null)
  }

  const renderSubmittedList = (editable: boolean) => (
    <div className="space-y-2">
      {currentSubmissions.map((submission) => {
        const markedForDelete = deleteIds.includes(submission.id)

        return (
          <div
            key={submission.id}
            className={`flex items-center gap-4 overflow-hidden rounded-lg bg-surface px-4 py-3 border transition-colors ${
              markedForDelete ? 'border-rose-200 bg-rose-50/70 opacity-75' : 'border-border/70'
            }`}
          >
            <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${
              markedForDelete ? 'bg-rose-100 text-rose-600' : 'bg-primary-soft text-primary'
            }`}>
              <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={markedForDelete ? 'M6 18L18 6M6 6l12 12' : 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'} />
              </svg>
            </div>
            <div className="min-w-0 flex-1 text-left">
              <a
                href={submission.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`font-bold text-sm hover:underline truncate block ${markedForDelete ? 'text-rose-600 line-through' : 'text-primary'}`}
              >
                {submission.name}
              </a>
              <p className="text-xs text-text-soft mt-1">
                {markedForDelete ? 'Sẽ xóa sau khi xác nhận' : `Đã nộp lúc: ${submission.date}`}
              </p>
            </div>
            {editable && (
              <button
                type="button"
                onClick={() => toggleDeleteExisting(submission.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                  markedForDelete
                    ? 'bg-surface text-text-soft border border-border hover:bg-surface-soft'
                    : 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100'
                }`}
              >
                {markedForDelete ? 'Giữ lại' : 'Xóa'}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )

  if (currentSubmissions.length > 0 && !isEditing) {
    return (
      <div className="bg-surface border border-primary/20 rounded-[18px] p-6 shadow-soft transition-all">
        <h2 className="text-base font-bold text-text mb-4 flex items-center gap-2">
          <span className="size-2 rounded-full bg-secondary animate-pulse block"></span>
          Bài đã nộp
        </h2>

        <div className="w-full bg-surface-soft p-5 rounded-xl border border-border space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-sm font-bold text-text">{currentSubmissions.length} file đã nộp</p>
          </div>
          {renderSubmittedList(false)}
        </div>

        {!isLocked && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={startEditing}
              className="px-6 py-2 rounded-full font-bold text-sm border-2 border-primary text-primary hover:bg-primary-soft transition-all"
            >
              Chỉnh sửa bài nộp
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-surface border rounded-[18px] p-6 shadow-soft transition-colors ${isLocked ? 'border-warning/50 bg-warning-soft/10 opacity-70' : 'border-border'}`}>
      <h2 className={`text-base font-bold mb-4 ${isLocked ? 'text-warning' : 'text-text'}`}>
        {isLocked ? 'Bài nộp đã khóa' : (isEditing ? 'Cập nhật bài nộp' : 'Upload Files')}
      </h2>

      {isEditing && currentSubmissions.length > 0 && (
        <div className="mb-4 rounded-xl border border-border bg-surface-soft p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-text">{keptSubmissions.length} file sẽ giữ lại</p>
            <span className="text-xs font-semibold text-text-soft">{deleteIds.length} file sẽ xóa</span>
          </div>
          {renderSubmittedList(true)}
        </div>
      )}

      <div
        className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all min-h-[220px]
          ${isLocked ? 'border-warning/30 bg-warning-soft/5 cursor-not-allowed' :
            isDragging ? 'border-primary bg-primary-soft/10 cursor-pointer' :
            error ? 'border-warning bg-warning-soft/10 cursor-pointer' : 'border-border bg-surface-soft hover:border-primary/50 cursor-pointer'}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => files.length === 0 && !isLocked && fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.docx,.zip,.rar" multiple onChange={onFileChange} />

        {files.length > 0 ? (
          <div className="w-full bg-surface p-4 rounded-lg border border-primary shadow-sm cursor-default" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 border-b border-border pb-3 mb-3">
              <div className="text-left">
                <p className="font-bold text-sm text-text">{files.length} file mới đã chọn</p>
                <p className="text-xs text-text-soft">Tổng dung lượng: {formatFileSize(selectedTotalSize)}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }} className="text-xs font-bold text-primary hover:text-primary/80">
                Thêm tệp
              </button>
            </div>

            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {files.map((file) => (
                <div key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center justify-between gap-3 rounded-lg bg-surface-soft px-3 py-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
                      <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-left min-w-0">
                      <p className="font-semibold text-sm text-text truncate">{file.name}</p>
                      <p className="text-xs text-text-soft">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button onClick={(e) => removeNewFile(e, file.name)} className="p-1.5 text-warning hover:bg-warning-soft rounded-full transition-colors shrink-0">
                    <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <svg className={`size-12 mb-4 ${isLocked ? 'text-warning/50' : error ? 'text-warning' : 'text-primary'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {isLocked ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              )}
            </svg>
            <h3 className={`font-bold text-lg mb-1 ${isLocked ? 'text-warning' : error ? 'text-warning' : 'text-text'}`}>
              {isLocked ? 'Hết hạn nộp bài' : error ? 'Upload không hợp lệ' : 'Drag and drop files here'}
            </h3>
            <p className={`text-sm mb-4 ${isLocked ? 'text-warning/80' : error ? 'text-warning/80' : 'text-text-soft'}`}>
              {isLocked ? 'Vui lòng liên hệ giảng viên.' : error || 'or click to browse from your computer'}
            </p>
            {!isLocked && <span className="px-3 py-1 bg-surface border border-border text-text-soft font-bold text-[10px] rounded-full uppercase">PDF, DOCX, ZIP, RAR (Max 5 files, 50MB total)</span>}
          </>
        )}
      </div>

      {!isLocked && (isEditing || files.length > 0) && (
        <div className="mt-6 flex justify-end gap-3">
          {isEditing && (
            <button onClick={resetEditing} className="px-6 py-2.5 rounded-full font-semibold text-sm text-text-soft hover:bg-surface-soft transition-all">
              Hủy sửa
            </button>
          )}

          <button
            onClick={() => onSubmit(files, deleteIds)}
            disabled={!hasChanges || isSubmitting}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-soft
              ${isSubmitting || !hasChanges
                ? 'bg-surface-soft text-text-soft border border-border cursor-not-allowed opacity-70'
                : 'bg-primary text-white hover:opacity-90 border border-primary shadow-md'}`}
          >
            {isSubmitting ? 'Đang xử lý...' : (isEditing ? 'Xác nhận' : 'Submit Work')}
          </button>
        </div>
      )}
    </div>
  )
}
