import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import Modal from '../../../components/ui/Modal'
import type { ApiError } from '../../../lib/api/axiosClient'
import type {
  AdminCategoryCreateRequest,
  AdminCategoryUpdateRequest,
  Category,
} from '../../../types/api/category'

const schema = z.object({
  name: z.string().min(2, 'Tối thiểu 2 ký tự'),
  description: z.string().min(2, 'Vui lòng nhập mô tả'),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof schema>

type Props = {
  open: boolean
  initial?: Category | null
  onClose: () => void
  onCreate: (payload: AdminCategoryCreateRequest) => Promise<void>
  onUpdate: (id: number, payload: AdminCategoryUpdateRequest) => Promise<void>
}

export default function CategoryFormModal({
  open,
  initial,
  onClose,
  onCreate,
  onUpdate,
}: Props) {
  const isEdit = !!initial
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', isActive: true },
  })

  useEffect(() => {
    if (!open) return
    reset({
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      isActive: initial?.isActive ?? true,
    })
  }, [open, initial, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && initial) {
        await onUpdate(initial.categoryId, values)
      } else {
        await onCreate(values)
      }
      onClose()
    } catch (err) {
      const apiErr = err as ApiError
      if (apiErr?.status !== 0 && apiErr?.status !== 401 && apiErr?.status !== 403) {
        toast.error(apiErr?.message ?? 'Lưu thất bại.')
      }
    }
  }

  return (
    <Modal open={open} title={isEdit ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label className="block text-sm font-medium text-text">Tên danh mục</label>
          <input
            {...register('name')}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            type="text"
          />
          {errors.name ? <p className="mt-1 text-xs text-red-500">{errors.name.message}</p> : null}
        </div>

        <div>
          <label className="block text-sm font-medium text-text">Mô tả</label>
          <textarea
            {...register('description')}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            rows={3}
          />
          {errors.description ? (
            <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
          ) : null}
        </div>

        <label className="flex items-center gap-2 text-sm text-text">
          <input type="checkbox" {...register('isActive')} className="size-4 rounded border-border" />
          Đang hoạt động
        </label>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <button
            type="button"
            className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-soft"
            disabled={isSubmitting}
            onClick={onClose}
          >
            Huỷ
          </button>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-surface disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang lưu…' : isEdit ? 'Lưu' : 'Tạo'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
