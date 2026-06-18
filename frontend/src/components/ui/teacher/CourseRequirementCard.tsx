import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { listActiveCategories } from '../../../services/admin/category.service'
import type { Category } from '../../../types/api/category'
import {
  EMPTY_REQUIREMENT,
  createRequirementLink,
  deleteRequirementFile,
  getRequirement,
  newCriterion,
  newSubmissionRequirement,
  saveRequirement,
  uploadRequirementFile,
  type ProjectRequirement,
  type RequirementFile,
  type SubmissionRequirement,
} from '../../../services/requirement.service'

interface CourseRequirementCardProps {
  courseId: number
  readOnly?: boolean
}

type PendingSubmissionLink = {
  label: string
  url: string
}

export default function CourseRequirementCard({ courseId, readOnly = false }: CourseRequirementCardProps) {
  const [req, setReq] = useState<ProjectRequirement>(EMPTY_REQUIREMENT)
  const [draft, setDraft] = useState<ProjectRequirement>(EMPTY_REQUIREMENT)
  const [categories, setCategories] = useState<Category[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [uploadingSubmissionRequirementId, setUploadingSubmissionRequirementId] = useState<string | null>(null)
  const [pendingSubmissionFiles, setPendingSubmissionFiles] = useState<Record<string, File[]>>({})
  const [pendingSubmissionLinks, setPendingSubmissionLinks] = useState<Record<string, PendingSubmissionLink[]>>({})
  const [linkDrafts, setLinkDrafts] = useState<Record<string, PendingSubmissionLink>>({})

  const refreshRequirement = async () => {
    const latestReq = await getRequirement(courseId).catch(() => EMPTY_REQUIREMENT)
    setReq(latestReq)
    setDraft(latestReq)
  }

  useEffect(() => {
    refreshRequirement()
  }, [courseId])

  useEffect(() => {
    if (!isModalOpen) return
    setPendingSubmissionFiles({})
    setPendingSubmissionLinks({})
    setLinkDrafts({})
    getRequirement(courseId)
      .then(setDraft)
      .catch(() => setDraft(EMPTY_REQUIREMENT))
    listActiveCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [isModalOpen, courseId])

  const hasRequirement = !!req.description || req.criteria.length > 0 || req.submissionRequirements.length > 0

  const addCriterion = () => setDraft((d) => ({ ...d, criteria: [...d.criteria, newCriterion()] }))
  const removeCriterion = (id: string) =>
    setDraft((d) => ({ ...d, criteria: d.criteria.filter((c) => c.id !== id) }))
  const updateCriterion = (id: string, patch: Partial<{ name: string; maxScore: number }>) =>
    setDraft((d) => ({ ...d, criteria: d.criteria.map((c) => (c.id === id ? { ...c, ...patch } : c)) }))
  const addSubmissionRequirement = () =>
    setDraft((d) => ({ ...d, submissionRequirements: [...d.submissionRequirements, newSubmissionRequirement()] }))
  const removeSubmissionRequirement = (index: number, id: string) => {
    setDraft((d) => ({ ...d, submissionRequirements: d.submissionRequirements.filter((_, i) => i !== index) }))
    setPendingSubmissionFiles((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })
    setPendingSubmissionLinks((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })
    setLinkDrafts((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })
  }
  const updateSubmissionRequirement = (index: number, value: string) =>
    setDraft((d) => ({
      ...d,
      submissionRequirements: d.submissionRequirements.map((item, i) => (
        i === index ? { ...item, content: value } : item
      )),
    }))
  const isPersistedSubmissionRequirement = (id: string) => Number.isInteger(Number(id))

  const updateSubmissionRequirementFiles = (submissionRequirementId: string, updater: (files: RequirementFile[]) => RequirementFile[]) => {
    const patchRequirement = (requirement: ProjectRequirement) => ({
      ...requirement,
      submissionRequirements: requirement.submissionRequirements.map((item) => (
        item.id === submissionRequirementId ? { ...item, files: updater(item.files ?? []) } : item
      )),
    })
    setReq((current) => patchRequirement(current))
    setDraft((current) => patchRequirement(current))
  }

  const addPendingSubmissionFile = (submissionRequirementId: string, file: File | null) => {
    if (!file) return
    setPendingSubmissionFiles((current) => ({
      ...current,
      [submissionRequirementId]: [...(current[submissionRequirementId] ?? []), file],
    }))
  }

  const removePendingSubmissionFile = (submissionRequirementId: string, index: number) => {
    setPendingSubmissionFiles((current) => ({
      ...current,
      [submissionRequirementId]: (current[submissionRequirementId] ?? []).filter((_, i) => i !== index),
    }))
  }

  const updateLinkDraft = (submissionRequirementId: string, patch: Partial<PendingSubmissionLink>) => {
    setLinkDrafts((current) => {
      const currentDraft = current[submissionRequirementId] ?? { label: '', url: '' }
      return {
        ...current,
        [submissionRequirementId]: { ...currentDraft, ...patch },
      }
    })
  }

  const addPendingSubmissionLink = (submissionRequirementId: string, link: PendingSubmissionLink) => {
    setPendingSubmissionLinks((current) => ({
      ...current,
      [submissionRequirementId]: [...(current[submissionRequirementId] ?? []), link],
    }))
  }

  const removePendingSubmissionLink = (submissionRequirementId: string, index: number) => {
    setPendingSubmissionLinks((current) => ({
      ...current,
      [submissionRequirementId]: (current[submissionRequirementId] ?? []).filter((_, i) => i !== index),
    }))
  }

  const handleSave = async () => {
    if (draft.criteria.some((c) => !c.name.trim())) {
      toast.error('Mỗi tiêu chí chấm điểm cần có tên.')
      return
    }
    if (draft.submissionRequirements.some((item) => !item.content.trim())) {
      toast.error('Mỗi yêu cầu nộp bài cần có nội dung.')
      return
    }

    const draftSubmissionRequirements = draft.submissionRequirements.filter((item) => item.content.trim())

    try {
      const saved = await saveRequirement(courseId, draft)
      const uploadedBySavedId: Record<string, RequirementFile[]> = {}

      for (let index = 0; index < draftSubmissionRequirements.length; index += 1) {
        const draftItem = draftSubmissionRequirements[index]
        const savedItem = saved.submissionRequirements[index]
        const pendingFiles = pendingSubmissionFiles[draftItem.id] ?? []
        const pendingLinks = [...(pendingSubmissionLinks[draftItem.id] ?? [])]
        const linkDraft = linkDrafts[draftItem.id]
        if (linkDraft?.url.trim()) {
          pendingLinks.push({
            label: linkDraft.label.trim(),
            url: linkDraft.url.trim(),
          })
        }
        if (!savedItem || (pendingFiles.length === 0 && pendingLinks.length === 0)) continue

        uploadedBySavedId[savedItem.id] = []
        for (const file of pendingFiles) {
          const uploaded = await uploadRequirementFile(courseId, file, undefined, null, savedItem.id)
          uploadedBySavedId[savedItem.id].push(uploaded)
        }
        for (const link of pendingLinks) {
          const created = await createRequirementLink(courseId, {
            label: link.label || link.url,
            url: link.url,
            submissionRequirementId: savedItem.id,
          })
          uploadedBySavedId[savedItem.id].push(created)
        }
      }

      const savedWithUploadedFiles: ProjectRequirement = {
        ...saved,
        submissionRequirements: saved.submissionRequirements.map((item) => ({
          ...item,
          files: [...(item.files ?? []), ...(uploadedBySavedId[item.id] ?? [])],
        })),
      }

      setReq(savedWithUploadedFiles)
      setDraft(savedWithUploadedFiles)
      setPendingSubmissionFiles({})
      setPendingSubmissionLinks({})
      setLinkDrafts({})
      setIsModalOpen(false)
      toast.success('Đã lưu yêu cầu đồ án.')
    } catch (e) {
      toast.error((e as { message?: string })?.message ?? 'Không lưu được yêu cầu đồ án. Vui lòng thử lại.')
    }
  }

  const handleUploadSubmissionRequirementFile = async (submissionRequirementId: string, file: File | null) => {
    if (!file) return
    if (!isPersistedSubmissionRequirement(submissionRequirementId)) {
      addPendingSubmissionFile(submissionRequirementId, file)
      return
    }

    setUploadingSubmissionRequirementId(submissionRequirementId)
    try {
      const uploaded = await uploadRequirementFile(courseId, file, undefined, null, submissionRequirementId)
      updateSubmissionRequirementFiles(submissionRequirementId, (files) => [...files, uploaded])
      toast.success('Đã tải lên tài liệu.')
    } catch (e) {
      toast.error((e as { message?: string })?.message ?? 'Tải lên thất bại.')
    } finally {
      setUploadingSubmissionRequirementId(null)
    }
  }

  const handleDeleteFile = async (submissionRequirementId: string, fileId: number) => {
    try {
      await deleteRequirementFile(courseId, fileId)
      updateSubmissionRequirementFiles(submissionRequirementId, (files) => files.filter((file) => file.id !== fileId))
      toast.success('Đã xóa tài liệu.')
    } catch (e) {
      toast.error((e as { message?: string })?.message ?? 'Xóa thất bại.')
    }
  }

  const handleAddSubmissionRequirementLink = async (submissionRequirementId: string) => {
    const draftLink = linkDrafts[submissionRequirementId] ?? { label: '', url: '' }
    const url = draftLink.url.trim()
    const label = draftLink.label.trim()

    if (!url) {
      toast.error('Vui lòng nhập link.')
      return
    }

    if (!isPersistedSubmissionRequirement(submissionRequirementId)) {
      addPendingSubmissionLink(submissionRequirementId, { label, url })
      setLinkDrafts((current) => ({ ...current, [submissionRequirementId]: { label: '', url: '' } }))
      return
    }

    setUploadingSubmissionRequirementId(submissionRequirementId)
    try {
      const created = await createRequirementLink(courseId, {
        label: label || url,
        url,
        submissionRequirementId,
      })
      updateSubmissionRequirementFiles(submissionRequirementId, (files) => [...files, created])
      setLinkDrafts((current) => ({ ...current, [submissionRequirementId]: { label: '', url: '' } }))
      toast.success('Đã thêm liên kết.')
    } catch (e) {
      toast.error((e as { message?: string })?.message ?? 'Thêm liên kết thất bại.')
    } finally {
      setUploadingSubmissionRequirementId(null)
    }
  }

  const renderSubmissionRequirementFiles = (submissionRequirement: SubmissionRequirement, editable: boolean) => {
    const files = submissionRequirement.files ?? []
    const pendingFiles = pendingSubmissionFiles[submissionRequirement.id] ?? []
    const pendingLinks = pendingSubmissionLinks[submissionRequirement.id] ?? []
    const linkDraft = linkDrafts[submissionRequirement.id] ?? { label: '', url: '' }

    return (
      <div className="mt-2 space-y-2">
        {files.length > 0 || pendingFiles.length > 0 || pendingLinks.length > 0 ? (
          <ul className="space-y-1.5">
            {files.map((file) => (
              <li key={file.id} className="flex items-center justify-between gap-2 rounded-lg bg-surface px-3 py-2 text-xs">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 items-center gap-2 font-semibold text-primary hover:underline"
                >
                  <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
                  </svg>
                  <span className="truncate">{file.label}</span>
                </a>
                {editable ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteFile(submissionRequirement.id, file.id)}
                    className="shrink-0 rounded-full p-1 text-text-soft hover:bg-red-50 hover:text-red-500"
                    title="Xóa tài liệu"
                  >
                    <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ) : null}
              </li>
            ))}
            {pendingFiles.map((file, index) => (
              <li key={`${file.name}-${file.size}-${file.lastModified}-${index}`} className="flex items-center justify-between gap-2 rounded-lg bg-surface px-3 py-2 text-xs">
                <span className="flex min-w-0 items-center gap-2 font-semibold text-text-soft">
                  <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
                  </svg>
                  <span className="truncate">{file.name}</span>
                  <span className="shrink-0 text-[10px] font-bold uppercase text-primary">chờ lưu</span>
                </span>
                {editable ? (
                  <button
                    type="button"
                    onClick={() => removePendingSubmissionFile(submissionRequirement.id, index)}
                    className="shrink-0 rounded-full p-1 text-text-soft hover:bg-red-50 hover:text-red-500"
                    title="Xóa file chờ lưu"
                  >
                    <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ) : null}
              </li>
            ))}
            {pendingLinks.map((link, index) => (
              <li key={`${link.url}-${index}`} className="flex items-center justify-between gap-2 rounded-lg bg-surface px-3 py-2 text-xs">
                <span className="flex min-w-0 items-center gap-2 font-semibold text-text-soft">
                  <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                  </svg>
                  <span className="truncate">{link.label || link.url}</span>
                  <span className="shrink-0 text-[10px] font-bold uppercase text-primary">chờ lưu</span>
                </span>
                {editable ? (
                  <button
                    type="button"
                    onClick={() => removePendingSubmissionLink(submissionRequirement.id, index)}
                    className="shrink-0 rounded-full p-1 text-text-soft hover:bg-red-50 hover:text-red-500"
                    title="Xóa link chờ lưu"
                  >
                    <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-text-soft">Chưa có file hoặc link cho yêu cầu này.</p>
        )}

        {editable ? (
          <div className="space-y-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs font-bold text-text-soft hover:border-primary hover:text-primary">
              <input
                type="file"
                className="hidden"
                disabled={uploadingSubmissionRequirementId === submissionRequirement.id}
                onChange={(e) => {
                  handleUploadSubmissionRequirementFile(submissionRequirement.id, e.target.files?.[0] ?? null)
                  e.currentTarget.value = ''
                }}
              />
              {uploadingSubmissionRequirementId === submissionRequirement.id ? 'Đang xử lý...' : '+ Thêm file'}
            </label>

            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]">
              <input
                type="text"
                value={linkDraft.label}
                onChange={(e) => updateLinkDraft(submissionRequirement.id, { label: e.target.value })}
                placeholder="Tên link"
                className="rounded-lg border border-border bg-surface p-2 text-xs text-text outline-none focus:border-primary"
              />
              <input
                type="url"
                value={linkDraft.url}
                onChange={(e) => updateLinkDraft(submissionRequirement.id, { url: e.target.value })}
                placeholder="https://..."
                className="rounded-lg border border-border bg-surface p-2 text-xs text-text outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => handleAddSubmissionRequirementLink(submissionRequirement.id)}
                disabled={uploadingSubmissionRequirementId === submissionRequirement.id}
                className="rounded-lg border border-dashed border-border px-3 py-2 text-xs font-bold text-text-soft hover:border-primary hover:text-primary disabled:opacity-60"
              >
                + Thêm link
              </button>
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <>
      <div className="bg-surface border border-border rounded-card p-6 shadow-soft">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-primary-soft p-2.5 text-primary">
              <svg className="size-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9z" />
              </svg>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-text">Yêu cầu đồ án</h2>
                {req.categoryName ? (
                  <span className="rounded-full bg-secondary-soft px-2.5 py-1 text-xs font-bold text-secondary">
                    {req.categoryName}
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 text-sm text-text-soft">
                {req.description || 'Giảng viên chưa thiết lập yêu cầu cho lớp học này.'}
              </p>
            </div>
          </div>

          {!readOnly ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex shrink-0 items-center gap-2 rounded-button bg-brand-gradient px-5 py-2.5 text-sm font-bold text-surface shadow-sm transition-opacity hover:opacity-90"
            >
              {hasRequirement ? 'Chỉnh sửa' : 'Tạo yêu cầu'}
            </button>
          ) : null}
        </div>

        <div className="mb-4 flex items-center gap-2">
          <span className="text-[15px] font-bold text-text">Hạn nộp chung:</span>
          <span className="text-[15px] font-bold text-primary">
            {req.deadline ? new Date(req.deadline).toLocaleDateString('vi-VN') : 'Chưa thiết lập'}
          </span>
        </div>

        <div>
          <span className="mb-2 block text-sm font-bold text-text">Tiêu chí chấm điểm:</span>
          {req.criteria.length > 0 ? (
            <ul className="space-y-2">
              {req.criteria.map((criterion) => (
                <li key={criterion.id} className="rounded-xl bg-surface-soft px-3 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-text">{criterion.name}</span>
                    <span className="shrink-0 font-bold text-text-soft">/ {criterion.maxScore} đ</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-soft">Chưa có tiêu chí chấm điểm.</p>
          )}
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <span className="mb-2 block text-sm font-bold text-text">Yêu cầu nộp bài:</span>
          {req.submissionRequirements.length > 0 ? (
            <ul className="space-y-2">
              {req.submissionRequirements.map((item) => (
                <li key={item.id} className="rounded-xl bg-surface-soft px-3 py-3 text-sm">
                  <p className="font-semibold text-text">{item.content}</p>
                  {renderSubmissionRequirementFiles(item, !readOnly)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-soft">Chưa có yêu cầu nộp bài.</p>
          )}
        </div>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-surface p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-text">{hasRequirement ? 'Chỉnh sửa' : 'Tạo'} yêu cầu đồ án</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-text">Loại đồ án (Category)</label>
                <select
                  value={draft.categoryId ?? ''}
                  onChange={(e) => {
                    const id = e.target.value ? Number(e.target.value) : null
                    const cat = categories.find((c) => c.categoryId === id)
                    setDraft((d) => ({ ...d, categoryId: id, categoryName: cat?.name ?? '' }))
                  }}
                  className="w-full rounded-xl border border-border bg-surface p-2.5 text-sm text-text outline-none focus:border-primary"
                >
                  <option value="">-- Chọn loại đồ án --</option>
                  {categories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-text">Mô tả yêu cầu</label>
                <textarea
                  className="w-full rounded-xl border border-border bg-surface p-3 text-sm text-text outline-none focus:border-primary"
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                  placeholder="Nhập yêu cầu đồ án..."
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-text">Hạn nộp chung</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-border bg-surface p-2.5 text-sm text-text outline-none focus:border-primary"
                  value={draft.deadline}
                  onChange={(e) => setDraft((d) => ({ ...d, deadline: e.target.value }))}
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-bold text-text">Tiêu chí chấm điểm (barem)</label>
                  <button type="button" onClick={addCriterion} className="text-xs font-bold text-primary hover:underline">
                    + Thêm tiêu chí
                  </button>
                </div>

                <div className="space-y-3">
                  {draft.criteria.map((criterion) => (
                    <div key={criterion.id} className="rounded-xl border border-border bg-surface-soft/50 p-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={criterion.name}
                          onChange={(e) => updateCriterion(criterion.id, { name: e.target.value })}
                          placeholder="Tên tiêu chí (VD: Thiết kế UI/UX)"
                          className="flex-1 rounded-lg border border-border bg-surface p-2 text-sm text-text outline-none focus:border-primary"
                        />
                        <span className="text-xs text-text-soft">/</span>
                        <input
                          type="number"
                          min={1}
                          value={criterion.maxScore}
                          onChange={(e) => updateCriterion(criterion.id, { maxScore: Number(e.target.value) })}
                          className="w-16 rounded-lg border border-border bg-surface p-2 text-center text-sm text-text outline-none focus:border-primary"
                        />
                        <span className="text-xs text-text-soft">đ</span>
                        <button
                          type="button"
                          onClick={() => removeCriterion(criterion.id)}
                          className="rounded-md p-1.5 text-text-soft transition-colors hover:bg-red-50 hover:text-red-500"
                          title="Xóa tiêu chí"
                        >
                          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  {draft.criteria.length === 0 ? (
                    <p className="text-xs text-text-soft">Chưa có tiêu chí. Nhấn “Thêm tiêu chí”.</p>
                  ) : null}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-bold text-text">Yêu cầu nộp bài</label>
                  <button type="button" onClick={addSubmissionRequirement} className="text-xs font-bold text-primary hover:underline">
                    + Thêm yêu cầu
                  </button>
                </div>

                <div className="space-y-3">
                  {draft.submissionRequirements.map((item, index) => (
                    <div key={item.id} className="rounded-xl border border-border bg-surface-soft/50 p-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item.content}
                          onChange={(e) => updateSubmissionRequirement(index, e.target.value)}
                          placeholder="VD: Nộp báo cáo PDF, source code ZIP, slide thuyết trình"
                          className="flex-1 rounded-lg border border-border bg-surface p-2 text-sm text-text outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => removeSubmissionRequirement(index, item.id)}
                          className="rounded-md p-1.5 text-text-soft transition-colors hover:bg-red-50 hover:text-red-500"
                          title="Xóa yêu cầu"
                        >
                          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      {renderSubmissionRequirementFiles(item, true)}
                    </div>
                  ))}
                  {draft.submissionRequirements.length === 0 ? (
                    <p className="text-xs text-text-soft">Chưa có yêu cầu nộp bài. Nhấn “Thêm yêu cầu”.</p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg px-4 py-2 font-bold text-text-soft transition-colors hover:bg-surface-soft"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="rounded-button bg-brand-gradient px-5 py-2 font-bold text-white shadow-sm transition-opacity hover:opacity-90"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
