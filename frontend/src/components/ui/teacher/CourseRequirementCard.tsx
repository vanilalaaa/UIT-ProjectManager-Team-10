import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { listActiveCategories } from '../../../services/admin/category.service'
import type { Category } from '../../../types/api/category'
import {
  getRequirement,
  saveRequirement,
  newCriterion,
  EMPTY_REQUIREMENT,
  listRequirementFiles,
  uploadRequirementFile,
  deleteRequirementFile,
  type ProjectRequirement,
  type RequirementFile,
} from '../../../services/requirement.service'

interface CourseRequirementCardProps {
  courseId: number
  // SV chỉ xem (ẩn nút tạo/sửa). Mặc định false = giảng viên có thể chỉnh.
  readOnly?: boolean
}

export default function CourseRequirementCard({ courseId, readOnly = false }: CourseRequirementCardProps) {
  const [req, setReq] = useState<ProjectRequirement>(EMPTY_REQUIREMENT)
  const [draft, setDraft] = useState<ProjectRequirement>(EMPTY_REQUIREMENT)
  const [categories, setCategories] = useState<Category[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [files, setFiles] = useState<RequirementFile[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getRequirement(courseId)
      .then(setReq)
      .catch(() => setReq(EMPTY_REQUIREMENT))
    listRequirementFiles(courseId)
      .then(setFiles)
      .catch(() => setFiles([]))
  }, [courseId])

  const handleUploadFile = async (file: File | null) => {
    if (!file) return
    setUploading(true)
    try {
      await uploadRequirementFile(courseId, file)
      setFiles(await listRequirementFiles(courseId))
      toast.success('Đã tải lên tài liệu.')
    } catch (e) {
      toast.error((e as { message?: string })?.message ?? 'Tải lên thất bại.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeleteFile = async (fileId: number) => {
    try {
      await deleteRequirementFile(courseId, fileId)
      setFiles((prev) => prev.filter((f) => f.id !== fileId))
      toast.success('Đã xóa tài liệu.')
    } catch (e) {
      toast.error((e as { message?: string })?.message ?? 'Xóa thất bại.')
    }
  }

  useEffect(() => {
    if (!isModalOpen) return
    getRequirement(courseId)
      .then(setDraft)
      .catch(() => setDraft(EMPTY_REQUIREMENT))
    listActiveCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [isModalOpen, courseId])

  const hasRequirement = !!req.description || req.criteria.length > 0

  const addCriterion = () => setDraft((d) => ({ ...d, criteria: [...d.criteria, newCriterion()] }))
  const removeCriterion = (id: string) =>
    setDraft((d) => ({ ...d, criteria: d.criteria.filter((c) => c.id !== id) }))
  const updateCriterion = (id: string, patch: Partial<{ name: string; maxScore: number }>) =>
    setDraft((d) => ({ ...d, criteria: d.criteria.map((c) => (c.id === id ? { ...c, ...patch } : c)) }))

  const handleSave = () => {
    if (draft.criteria.some((c) => !c.name.trim())) {
      toast.error('Mỗi tiêu chí chấm điểm cần có tên.')
      return
    }
    saveRequirement(courseId, draft)
      .then((saved) => {
        setReq(saved)
        setIsModalOpen(false)
        toast.success('Đã lưu yêu cầu đồ án.')
      })
      .catch(() => toast.error('Không lưu được yêu cầu đồ án. Vui lòng thử lại.'))
  }

  return (
    <>
      <div className="bg-surface border border-border rounded-card p-6 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
          <div className="flex items-start gap-3">
            <div className="bg-primary-soft text-primary p-2.5 rounded-xl mt-0.5">
              <svg className="size-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-text">Yêu cầu đồ án</h2>
                {req.categoryName ? (
                  <span className="bg-secondary-soft text-secondary text-xs font-bold px-2.5 py-1 rounded-full">
                    {req.categoryName}
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-text-soft mt-0.5">
                {req.description || 'Giảng viên chưa thiết lập yêu cầu cho lớp học này.'}
              </p>
            </div>
          </div>

          {!readOnly ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-brand-gradient text-surface text-sm font-bold rounded-button shadow-sm hover:opacity-90 transition-opacity"
            >
              <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
              </svg>
              {hasRequirement ? 'Chỉnh sửa' : 'Tạo yêu cầu'}
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-[15px] font-bold text-text">Hạn nộp chung:</span>
          <span className="text-[15px] font-bold text-primary">
            {req.deadline ? new Date(req.deadline).toLocaleDateString('vi-VN') : 'Chưa thiết lập'}
          </span>
        </div>

        <div>
          <span className="text-sm font-bold text-text block mb-2">Barem chấm điểm:</span>
          {req.criteria.length > 0 ? (
            <ul className="space-y-1.5">
              {req.criteria.map((c) => (
                <li key={c.id} className="flex items-center justify-between bg-surface-soft rounded-lg px-3 py-2 text-sm">
                  <span className="text-text font-medium">{c.name}</span>
                  <span className="text-text-soft font-bold">/ {c.maxScore} đ</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-soft">Chưa có tiêu chí chấm điểm.</p>
          )}
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <span className="text-sm font-bold text-text block mb-2">Tài liệu yêu cầu:</span>
          {files.length > 0 ? (
            <ul className="space-y-1.5">
              {files.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-2 bg-surface-soft rounded-lg px-3 py-2 text-sm">
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline truncate font-medium"
                  >
                    <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
                    </svg>
                    <span className="truncate">{f.label}</span>
                  </a>
                  {!readOnly ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteFile(f.id)}
                      className="shrink-0 text-text-soft hover:text-red-500"
                      title="Xóa tài liệu"
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
            <p className="text-sm text-text-soft">
              {readOnly ? 'Giảng viên chưa đính kèm tài liệu.' : 'Chưa có tài liệu. Tải lên bên dưới.'}
            </p>
          )}

          {!readOnly ? (
            <div className="mt-3">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => handleUploadFile(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full rounded-lg border border-dashed border-border bg-surface-soft/40 px-4 py-3 text-sm font-semibold text-text-soft transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
              >
                {uploading ? 'Đang tải lên…' : '+ Tải lên tài liệu yêu cầu'}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40">
          <div className="bg-surface rounded-2xl w-full max-w-xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-text">{hasRequirement ? 'Chỉnh sửa' : 'Tạo'} yêu cầu đồ án</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-text block mb-1.5">Loại đồ án (Category)</label>
                <select
                  value={draft.categoryId ?? ''}
                  onChange={(e) => {
                    const id = e.target.value ? Number(e.target.value) : null
                    const cat = categories.find((c) => c.categoryId === id)
                    setDraft((d) => ({ ...d, categoryId: id, categoryName: cat?.name ?? '' }))
                  }}
                  className="w-full p-2.5 border border-border rounded-xl text-sm outline-none focus:border-primary bg-surface text-text"
                >
                  <option value="">— Chọn loại đồ án —</option>
                  {categories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {categories.length === 0 ? (
                  <p className="mt-1 text-xs text-text-soft">Chưa có loại đồ án — Admin tạo ở “Quản lý danh mục”.</p>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-bold text-text block mb-1.5">Mô tả yêu cầu</label>
                <textarea
                  className="w-full p-3 border border-border rounded-xl text-sm outline-none focus:border-primary bg-surface text-text"
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                  placeholder="Nhập yêu cầu đồ án..."
                />
              </div>

              <div>
                <label className="text-sm font-bold text-text block mb-1.5">Hạn nộp chung</label>
                <input
                  type="date"
                  className="w-full p-2.5 border border-border rounded-xl text-sm outline-none focus:border-primary bg-surface text-text"
                  value={draft.deadline}
                  onChange={(e) => setDraft((d) => ({ ...d, deadline: e.target.value }))}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-text">Tiêu chí chấm điểm (barem)</label>
                  <button
                    type="button"
                    onClick={addCriterion}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    + Thêm tiêu chí
                  </button>
                </div>

                <div className="space-y-2">
                  {draft.criteria.map((c) => (
                    <div key={c.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={c.name}
                        onChange={(e) => updateCriterion(c.id, { name: e.target.value })}
                        placeholder="Tên tiêu chí (VD: Thiết kế UI/UX)"
                        className="flex-1 p-2 border border-border rounded-lg text-sm outline-none focus:border-primary bg-surface text-text"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-text-soft">/</span>
                        <input
                          type="number"
                          min={1}
                          value={c.maxScore}
                          onChange={(e) => updateCriterion(c.id, { maxScore: Number(e.target.value) })}
                          className="w-16 p-2 border border-border rounded-lg text-sm text-center outline-none focus:border-primary bg-surface text-text"
                        />
                        <span className="text-xs text-text-soft">đ</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCriterion(c.id)}
                        className="p-1.5 text-text-soft hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Xóa tiêu chí"
                      >
                        <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {draft.criteria.length === 0 ? (
                    <p className="text-xs text-text-soft">Chưa có tiêu chí. Nhấn “Thêm tiêu chí”.</p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-text-soft hover:bg-surface-soft rounded-lg font-bold transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-brand-gradient text-white rounded-button font-bold hover:opacity-90 transition-opacity shadow-sm"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
