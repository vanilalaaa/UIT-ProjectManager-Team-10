import { useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'

export type ResourceType = 'FILE' | 'DRIVE' | 'GITHUB' | 'LINK'

export type ProjectResource = {
  id: string
  type: ResourceType
  label: string
  url: string
}

interface ProjectResourcesCardProps {
  resources: ProjectResource[]
  canManage: boolean
  onAdd: (resource: Omit<ProjectResource, 'id'>, file?: File) => void
  onRemove: (id: string) => void
}

const TYPE_META: Record<ResourceType, { label: string; chip: string; icon: ReactNode }> = {
  FILE: {
    label: 'Tệp',
    chip: 'bg-primary-soft text-primary',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
    ),
  },
  DRIVE: {
    label: 'Google Drive',
    chip: 'bg-secondary-soft text-secondary',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="m7.5 3 9 0 4.5 7.794-4.5 7.794-9 0L3 10.794 7.5 3Z M3 10.794h18M7.5 3l4.5 7.794M16.5 3l-4.5 7.794" />,
  },
  GITHUB: {
    label: 'GitHub',
    chip: 'bg-surface-soft text-text',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .26.18.58.69.48A10 10 0 0 0 12 2Z" />,
  },
  LINK: {
    label: 'Liên kết',
    chip: 'bg-surface-soft text-text-soft',
    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.69a4.5 4.5 0 0 1 0 6.36l-3 3a4.5 4.5 0 0 1-6.36-6.36l1.5-1.5m9.92.92 1.5-1.5a4.5 4.5 0 0 0-6.36-6.36l-3 3a4.5 4.5 0 0 0 0 6.36" />,
  },
}

function ResourceIcon({ type }: { type: ResourceType }) {
  return (
    <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      {TYPE_META[type].icon}
    </svg>
  )
}

export default function ProjectResourcesCard({ resources, canManage, onAdd, onRemove }: ProjectResourcesCardProps) {
  const [draftType, setDraftType] = useState<ResourceType>('LINK')
  const [draftUrl, setDraftUrl] = useState('')
  const [draftLabel, setDraftLabel] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // url để trống — BE lưu tệp và trả về đường dẫn thật.
    onAdd({ type: 'FILE', label: file.name, url: '' }, file)
    e.target.value = ''
  }

  const handleAddLink = () => {
    const url = draftUrl.trim()
    if (!url) {
      toast.error('Vui lòng nhập đường dẫn.')
      return
    }
    if (!/^https?:\/\//i.test(url)) {
      toast.error('Đường dẫn phải bắt đầu bằng http:// hoặc https://')
      return
    }
    onAdd({ type: draftType, label: draftLabel.trim() || url, url })
    setDraftUrl('')
    setDraftLabel('')
  }

  const openResource = (r: ProjectResource) => window.open(r.url, '_blank', 'noopener,noreferrer')

  const copyLink = async (r: ProjectResource) => {
    try {
      await navigator.clipboard.writeText(r.url)
      toast.success('Đã sao chép liên kết.')
    } catch {
      toast.error('Không sao chép được liên kết.')
    }
  }

  return (
    <div className="rounded-[28px] border border-border bg-surface p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text flex items-center gap-2">
          <svg className="size-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.69a4.5 4.5 0 0 1 0 6.36l-3 3a4.5 4.5 0 1 1-6.36-6.36l1.5-1.5m9.92.92 1.5-1.5a4.5 4.5 0 0 0-6.36-6.36l-3 3a4.5 4.5 0 0 0 0 6.36" />
          </svg>
          Tài nguyên nhóm
        </h2>
        <span className="text-sm font-bold text-text-soft">{resources.length}</span>
      </div>

      {resources.length > 0 ? (
        <div className="flex flex-wrap gap-2.5">
          {resources.map((r) => (
            <div
              key={r.id}
              className={`group flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold ${TYPE_META[r.type].chip}`}
            >
              <ResourceIcon type={r.type} />
              <button
                type="button"
                onClick={() => openResource(r)}
                className="max-w-[180px] truncate hover:underline"
                title={r.label}
              >
                {r.label}
              </button>
              {r.type !== 'FILE' && (
                <button
                  type="button"
                  onClick={() => copyLink(r)}
                  className="opacity-60 hover:opacity-100"
                  title="Sao chép liên kết"
                >
                  <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2m-6-12h6a2 2 0 0 1 2 2v6m-8-8V3" />
                  </svg>
                </button>
              )}
              {canManage && (
                <button
                  type="button"
                  onClick={() => onRemove(r.id)}
                  className="opacity-60 hover:opacity-100 hover:text-warning"
                  title="Xóa"
                >
                  <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-soft">
          Chưa có tài nguyên nào.{canManage ? ' Thêm tệp hoặc liên kết để cả nhóm cùng dùng.' : ' Trưởng nhóm chưa chia sẻ tài nguyên.'}
        </p>
      )}

      {canManage && (
        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TYPE_META) as ResourceType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setDraftType(t)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  draftType === t
                    ? 'border-primary bg-primary-soft text-primary'
                    : 'border-border bg-surface text-text-soft hover:bg-surface-soft'
                }`}
              >
                <ResourceIcon type={t} />
                {TYPE_META[t].label}
              </button>
            ))}
          </div>

          {draftType === 'FILE' ? (
            <div>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFilePick} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-lg border border-dashed border-border bg-surface-soft/40 px-4 py-3 text-sm font-semibold text-text-soft hover:border-primary hover:text-primary transition-colors"
              >
                Chọn tệp để tải lên
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={draftLabel}
                onChange={(e) => setDraftLabel(e.target.value)}
                placeholder="Tên hiển thị (tùy chọn)"
                className="sm:w-44 rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                type="url"
                value={draftUrl}
                onChange={(e) => setDraftUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                placeholder="https://..."
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={handleAddLink}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-surface hover:bg-primary/95 transition-colors"
              >
                Thêm
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
