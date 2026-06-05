import { useState } from 'react'
import Modal from './Modal'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => Promise<void> | void
  onClose: () => void
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Huỷ',
  destructive = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [submitting, setSubmitting] = useState(false)

  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} title={title} onClose={onClose} size="sm">
      {description ? <p className="text-sm text-text-soft">{description}</p> : null}
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-soft"
          disabled={submitting}
          onClick={onClose}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          className={`rounded-lg px-4 py-2 text-sm font-semibold text-surface disabled:opacity-60 ${
            destructive ? 'bg-red-500' : 'bg-primary'
          }`}
          disabled={submitting}
          onClick={handleConfirm}
        >
          {submitting ? 'Đang xử lý…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
