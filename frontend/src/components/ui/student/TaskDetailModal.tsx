import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import Modal from '../Modal'
import Avatar from '../Avatar'
import type { BoardGroup, Task, TaskResource, UserLite } from '../../../types/api/task'
import { updateTask } from '../../../services/task.service'
import {
  listTaskResources,
  uploadTaskFile,
  addTaskLink,
  deleteTaskResource,
} from '../../../services/task-resource.service'

interface TaskDetailModalProps {
  open: boolean
  task: Task | null
  group: BoardGroup | null
  currentUser: UserLite | null
  onClose: () => void
  onUpdated: (task: Task) => void
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
  TODO: { label: 'Cần làm', cls: 'bg-surface-soft text-text-soft' },
  IN_PROGRESS: { label: 'Đang làm', cls: 'bg-sky-100 text-sky-700' },
  REVIEW: { label: 'Chờ kiểm tra', cls: 'bg-primary-soft text-primary' },
  DONE: { label: 'Hoàn thành', cls: 'bg-secondary-soft text-secondary' },
  BLOCKED: { label: 'Tạm dừng', cls: 'bg-amber-100 text-amber-700' },
}

const apiMessage = (e: unknown, fallback: string) =>
  (e as { message?: string })?.message || fallback

export default function TaskDetailModal({
  open,
  task,
  group,
  currentUser,
  onClose,
  onUpdated,
}: TaskDetailModalProps) {
  // Parent gắn key=taskId nên mỗi lần mở task là một instance mới: state seed
  // thẳng từ prop, sau đó modal tự quản lý bản sao "current" (cập nhật tại chỗ
  // khi đổi trạng thái / tài nguyên) mà không bị prop ghi đè.
  const [current, setCurrent] = useState<Task | null>(task)
  const [resources, setResources] = useState<TaskResource[]>(task?.resources ?? [])
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [busy, setBusy] = useState(false)

  // Form chỉnh sửa
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [validatorId, setValidatorId] = useState('')

  // Thêm tài nguyên + nhận xét review
  const [linkUrl, setLinkUrl] = useState('')
  const [reviewNote, setReviewNote] = useState(task?.comment ?? '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Lấy lại tài nguyên mới nhất từ server khi mở (chạy 1 lần cho mỗi task).
  useEffect(() => {
    if (!task) return
    listTaskResources(task.taskId)
      .then(setResources)
      .catch(() => undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!current) return null

  const members = group?.members ?? []
  const isLeader = Boolean(group && currentUser && group.leaderId === currentUser.id)
  const isAssignee = Boolean(currentUser && current.assignee?.id === currentUser.id)
  const isValidator = Boolean(currentUser && current.validator?.id === currentUser.id)
  const canEdit = isLeader || isAssignee || isValidator
  const canManageRoles = isLeader
  const canReview = isLeader || isValidator
  const canEditResources = isLeader || isAssignee || isValidator
  const status = current.status
  const statusMeta = STATUS_META[status] ?? { label: status, cls: 'bg-surface-soft text-text-soft' }

  const applyUpdated = (next: Task) => {
    const merged = { ...next, priority: current.priority }
    setCurrent(merged)
    setResources(next.resources ?? resources)
    onUpdated(merged)
  }

  const refreshResources = async (overrideComment?: string) => {
    const fresh = await listTaskResources(current.taskId)
    setResources(fresh)
    const merged: Task = {
      ...current,
      resources: fresh,
      comment: overrideComment ?? current.comment,
    }
    setCurrent(merged)
    onUpdated(merged)
  }

  const startEditing = () => {
    setTitle(current.title)
    setDescription(current.description ?? '')
    setDeadline(current.deadline ? current.deadline.slice(0, 10) : '')
    setAssigneeId(current.assignee ? String(current.assignee.id) : '')
    setValidatorId(current.validator ? String(current.validator.id) : '')
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    if (!title.trim()) {
      toast.error('Tên công việc không được để trống.')
      return
    }
    const payload: Parameters<typeof updateTask>[1] = {
      title: title.trim(),
      description: description.trim(),
    }
    // Chỉ gửi deadline khi đổi (BE chặn deadline < hiện tại).
    const originalDate = current.deadline ? current.deadline.slice(0, 10) : ''
    if (deadline && deadline !== originalDate) {
      payload.deadline = `${deadline}T23:59:00`
    }
    if (canManageRoles) {
      const newAssignee = assigneeId ? Number(assigneeId) : null
      const newValidator = validatorId ? Number(validatorId) : null
      if (newAssignee && newAssignee !== (current.assignee?.id ?? null)) {
        payload.assignedToId = newAssignee
      }
      if (newValidator !== (current.validator?.id ?? null)) {
        payload.validatorId = newValidator
      }
    }

    setSaving(true)
    try {
      const res = await updateTask(current.taskId, payload)
      applyUpdated(res.data)
      setIsEditing(false)
      toast.success('Đã cập nhật công việc.')
    } catch (e) {
      toast.error(apiMessage(e, 'Không cập nhật được công việc.'))
    } finally {
      setSaving(false)
    }
  }

  const changeStatus = async (next: string, comment?: string, successMsg?: string) => {
    setBusy(true)
    try {
      const res = await updateTask(current.taskId, comment !== undefined ? { status: next, comment } : { status: next })
      applyUpdated(res.data)
      if (successMsg) toast.success(successMsg)
    } catch (e) {
      toast.error(apiMessage(e, 'Không cập nhật được trạng thái.'))
    } finally {
      setBusy(false)
    }
  }

  const handleUploadFile = async (file: File | null) => {
    if (!file) return
    setBusy(true)
    try {
      await uploadTaskFile(current.taskId, file)
      await refreshResources()
      toast.success('Đã tải tệp lên.')
    } catch (e) {
      toast.error(apiMessage(e, 'Tải tệp lên thất bại.'))
    } finally {
      setBusy(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleAddLink = async () => {
    const url = linkUrl.trim()
    if (!url) return
    setBusy(true)
    try {
      await addTaskLink(current.taskId, url)
      setLinkUrl('')
      await refreshResources()
      toast.success('Đã thêm liên kết.')
    } catch (e) {
      toast.error(apiMessage(e, 'Thêm liên kết thất bại.'))
    } finally {
      setBusy(false)
    }
  }

  const handleDeleteResource = async (resourceId: number) => {
    setBusy(true)
    try {
      await deleteTaskResource(current.taskId, resourceId)
      await refreshResources()
      toast.success('Đã xóa tài nguyên.')
    } catch (e) {
      toast.error(apiMessage(e, 'Xóa tài nguyên thất bại.'))
    } finally {
      setBusy(false)
    }
  }

  const handleSubmitReview = () => changeStatus('REVIEW', undefined, 'Đã gửi công việc để kiểm tra.')

  const handleReviewDecision = (approved: boolean) => {
    const note = reviewNote.trim()
    changeStatus(
      approved ? 'DONE' : 'IN_PROGRESS',
      note || undefined,
      approved ? 'Đã duyệt công việc.' : 'Đã yêu cầu chỉnh sửa lại.',
    )
  }

  const formatDeadline = (value: string | null) =>
    value ? new Date(value).toLocaleString('vi-VN') : 'Chưa đặt hạn'

  const canSubmitReview = (isAssignee || isLeader) && status !== 'REVIEW' && status !== 'DONE'
  const showReviewBox = canReview && status === 'REVIEW'

  return (
    <Modal open={open} title={isEditing ? 'Chỉnh sửa công việc' : 'Chi tiết công việc'} onClose={onClose} size="lg">
      <div className="max-h-[72vh] overflow-y-auto pr-1 -mr-1 space-y-5">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-soft uppercase mb-1.5">Tên công việc</label>
              <input
                type="text"
                className="w-full border border-border rounded-lg bg-surface px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-soft uppercase mb-1.5">Mô tả</label>
              <textarea
                rows={3}
                className="w-full border border-border rounded-lg bg-surface px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-soft uppercase mb-1.5">Deadline</label>
              <input
                type="date"
                className="w-full border border-border rounded-lg bg-surface px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            {canManageRoles && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-soft uppercase mb-1.5">Người thực hiện</label>
                  <select
                    className="w-full border border-border rounded-lg bg-surface px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                  >
                    <option value="">-- Chưa giao --</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-soft uppercase mb-1.5">Người kiểm tra</label>
                  <select
                    className="w-full border border-border rounded-lg bg-surface px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
                    value={validatorId}
                    onChange={(e) => setValidatorId(e.target.value)}
                  >
                    <option value="">-- Không chỉ định --</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-sm font-semibold text-text-soft hover:text-text px-4 py-2 transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={saving}
                className="bg-primary hover:bg-primary/95 text-surface font-semibold px-6 py-2.5 rounded-button shadow-soft transition-colors text-sm disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${statusMeta.cls}`}>{statusMeta.label}</span>
                  {current.priority && (
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-surface-soft text-text-soft">
                      Ưu tiên: {current.priority}
                    </span>
                  )}
                </div>
                <h3 className="mt-2 text-lg font-bold text-text break-words">{current.title}</h3>
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={startEditing}
                  className="shrink-0 flex items-center gap-1.5 rounded-button border border-border px-3 py-2 text-sm font-semibold text-text-soft hover:border-primary hover:text-primary transition-colors"
                >
                  <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                  </svg>
                  Chỉnh sửa
                </button>
              )}
            </div>

            <p className="text-sm text-text-soft whitespace-pre-line">
              {current.description?.trim() || 'Không có mô tả.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PersonField label="Người thực hiện" user={current.assignee} emptyText="Chưa giao" />
              <PersonField label="Người kiểm tra" user={current.validator} emptyText="Chưa chỉ định" />
              <div>
                <p className="text-xs font-bold text-text-soft uppercase mb-1.5">Deadline</p>
                <p className="text-sm font-semibold text-text">{formatDeadline(current.deadline)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-text-soft uppercase mb-1.5">Người tạo</p>
                <p className="text-sm font-semibold text-text">{current.createdBy?.name ?? '—'}</p>
              </div>
            </div>

            {/* Tài nguyên: tệp đã nộp / liên kết */}
            <div className="border-t border-border pt-4">
              <p className="text-sm font-bold text-text mb-2">Tệp & liên kết ({resources.length})</p>
              {resources.length > 0 ? (
                <ul className="space-y-2">
                  {resources.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-2 bg-surface-soft rounded-lg px-3 py-2">
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline truncate text-sm font-medium"
                      >
                        <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          {r.type === 'FILE' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 0 0-5.656 0l-4 4a4 4 0 1 0 5.656 5.656l1.102-1.101m-.758-4.899a4 4 0 0 0 5.656 0l4-4a4 4 0 0 0-5.656-5.656l-1.1 1.1" />
                          )}
                        </svg>
                        <span className="truncate">{r.label}</span>
                        <span className="shrink-0 text-[10px] font-bold uppercase text-text-soft">{r.type}</span>
                      </a>
                      {canEditResources && (
                        <button
                          type="button"
                          onClick={() => handleDeleteResource(r.id)}
                          disabled={busy}
                          className="shrink-0 text-text-soft hover:text-rose-500 disabled:opacity-50"
                          title="Xóa"
                        >
                          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-text-soft">Chưa có tệp hoặc liên kết nào.</p>
              )}

              {canEditResources && (
                <div className="mt-3 space-y-2">
                  <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => handleUploadFile(e.target.files?.[0] ?? null)} />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={busy}
                      className="shrink-0 rounded-lg border border-dashed border-border px-4 py-2 text-sm font-semibold text-text-soft hover:border-primary hover:text-primary transition-colors disabled:opacity-60"
                    >
                      + Tải tệp lên
                    </button>
                    <div className="flex flex-1 gap-2">
                      <input
                        type="url"
                        placeholder="Dán liên kết (Google Drive, GitHub...)"
                        className="flex-1 border border-border rounded-lg bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLink() } }}
                      />
                      <button
                        type="button"
                        onClick={handleAddLink}
                        disabled={busy || !linkUrl.trim()}
                        className="shrink-0 rounded-lg bg-surface-soft px-4 py-2 text-sm font-semibold text-text hover:bg-border/40 transition-colors disabled:opacity-60"
                      >
                        Thêm
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Nhận xét của người kiểm tra */}
            {current.comment?.trim() && (
              <div className="border-t border-border pt-4">
                <p className="text-sm font-bold text-text mb-1.5">Nhận xét của người kiểm tra</p>
                <p className="rounded-lg bg-surface-soft px-3 py-2 text-sm text-text whitespace-pre-line">{current.comment}</p>
              </div>
            )}

            {/* Khu vực hành động */}
            {(canSubmitReview || showReviewBox) && (
              <div className="border-t border-border pt-4 space-y-3">
                {canSubmitReview && (
                  <button
                    type="button"
                    onClick={handleSubmitReview}
                    disabled={busy}
                    className="w-full bg-primary hover:bg-primary/95 text-surface font-semibold px-5 py-2.5 rounded-button shadow-soft transition-colors text-sm disabled:opacity-60"
                  >
                    Gửi kiểm tra
                  </button>
                )}

                {showReviewBox && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-text-soft uppercase mb-1.5">Nhận xét (tùy chọn)</label>
                      <textarea
                        rows={2}
                        className="w-full border border-border rounded-lg bg-surface px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                        placeholder="Góp ý cho người thực hiện..."
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleReviewDecision(false)}
                        disabled={busy}
                        className="rounded-button border border-amber-200 bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-60"
                      >
                        Yêu cầu chỉnh sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReviewDecision(true)}
                        disabled={busy}
                        className="rounded-button bg-secondary px-5 py-2.5 text-sm font-semibold text-surface hover:opacity-90 transition-opacity disabled:opacity-60"
                      >
                        Duyệt hoàn thành
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}

function PersonField({ label, user, emptyText }: { label: string; user: UserLite | null; emptyText: string }) {
  return (
    <div>
      <p className="text-xs font-bold text-text-soft uppercase mb-1.5">{label}</p>
      {user ? (
        <div className="flex items-center gap-2">
          <Avatar name={user.name} avatarUrl={user.avatar} sizeClass="size-7" textClass="text-[11px]" />
          <span className="text-sm font-semibold text-text truncate">{user.name}</span>
        </div>
      ) : (
        <p className="text-sm text-text-soft">{emptyText}</p>
      )}
    </div>
  )
}
