import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import TaskCard from '../../../components/ui/student/TaskCard'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import CreateTaskModal from '../../../components/ui/student/CreateTaskModal'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import type { Task, UserLite, BoardGroup, NewTaskInput } from '../../../types/api/task'
import {
  getProjectBoard,
  createTask,
  updateTaskStatus,
  deleteTask,
} from '../../../services/task.service'

const COLUMNS = [
  { id: 'TODO', title: 'To Do', dot: 'bg-text-soft', text: 'text-text-soft' },
  { id: 'IN_PROGRESS', title: 'In Progress', dot: 'bg-accent', text: 'text-accent' },
  { id: 'REVIEW', title: 'Review', dot: 'bg-primary', text: 'text-primary' },
  { id: 'DONE', title: 'Done', dot: 'bg-secondary', text: 'text-secondary' }
]

export default function ProjectKanban() {
  const { projectId } = useParams<{ projectId: string }>()
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentUser, setCurrentUser] = useState<UserLite | null>(null)
  const [currentGroup, setCurrentGroup] = useState<BoardGroup | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    getProjectBoard(projectId ?? '')
      .then(data => {
        if (!isMounted) return
        setTasks(data.tasks)
        setCurrentUser(data.currentUser)
        setCurrentGroup(data.group)
      })
      .catch(() => {
        if (!isMounted) return
        setTasks([])
        setCurrentGroup(null)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => { isMounted = false }
  }, [projectId])

  const isLeader = Boolean(currentGroup && currentUser && currentGroup.leaderId === currentUser.id)

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.assignee?.name ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const onDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData('taskId', taskId.toString())
  }

  const onDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    const taskId = Number(e.dataTransfer.getData('taskId'))
    const taskToMove = tasks.find(t => t.taskId === taskId)

    if (!taskToMove || !currentUser) return

    if (!isLeader && taskToMove.assignee?.id !== currentUser.id) {
      toast.error('Bạn chỉ được cập nhật trạng thái Task do chính bạn phụ trách!')
      return
    }

    if (taskToMove.status === newStatus) return
    const prevStatus = taskToMove.status

    setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, status: newStatus } : t))

    updateTaskStatus(taskId, { status: newStatus }).catch(() => {
      setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, status: prevStatus } : t))
      toast.error('Không cập nhật được trạng thái Task.')
    })
  }

  const handleDeleteTask = () => {
    if (!deleteTarget) return
    const taskId = deleteTarget.taskId
    const snapshot = tasks
    setTasks(prev => prev.filter(t => t.taskId !== taskId))
    return deleteTask(taskId)
      .then(() => {
        toast.success(`Đã xóa Task "${deleteTarget.title}".`)
      })
      .catch(() => {
        setTasks(snapshot)
        toast.error('Không xóa được Task.')
      })
  }

  const handleCreateTask = (form: NewTaskInput) => {
    if (!currentGroup) return
    createTask(projectId ?? '', {
      title: form.title,
      description: form.description,
      assignedToId: form.assignedToId,
      groupId: currentGroup.groupId,
      deadline: form.deadline,
    })
      .then(res => {
        setTasks(prev => [{ ...res.data, priority: form.priority }, ...prev])
        toast.success('Đã tạo Task.')
      })
      .catch(() => toast.error('Không tạo được Task.'))
  }

  if (loading) return <LoadingSpinner message="Đang tải bảng công việc..." />
  if (!currentGroup) return <div className="p-8 text-center text-text-soft">Không tìm thấy thông tin nhóm của đồ án này.</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <svg className="absolute left-3 top-2.5 size-4 text-text-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Lọc task theo tên hoặc người phụ trách..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-surface text-sm text-text focus:ring-1 focus:ring-primary outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary hover:bg-primary/95 text-surface px-5 py-2.5 rounded-button font-semibold text-sm shadow-soft transition-colors flex items-center justify-center gap-2"
        >
          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Task
        </button>
      </div>

      <div className="flex gap-6 items-start h-[calc(100vh-250px)] overflow-x-auto overflow-y-auto pb-6 pr-2">
        {COLUMNS.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.id)

          return (
            <div
              key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, col.id)}
              className="flex flex-col gap-4 min-h-[300px] w-full min-w-[280px] max-w-[350px]"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className={`size-2.5 rounded-full ${col.dot}`}></span>
                  <h3 className={`font-bold text-[17px] ${col.text}`}>{col.title}</h3>
                </div>
                <span className="bg-surface-soft text-text-soft text-xs font-bold px-2.5 py-0.5 rounded-full border border-border">
                  {colTasks.length}
                </span>
              </div>

              {colTasks.map(task => (
                <div key={task.taskId} className="relative group">
                  <TaskCard
                    task={task}
                    onDragStart={(e) => onDragStart(e, task.taskId)}
                  />
                  {isLeader && (
                    <button
                      onClick={() => setDeleteTarget(task)}
                      className="absolute -top-2 -right-2 z-10 flex size-7 items-center justify-center rounded-full bg-rose-600 text-white opacity-0 shadow-md shadow-rose-200 ring-2 ring-surface transition-all hover:bg-rose-700 group-hover:opacity-100"
                      title="Xóa Task"
                    >
                      <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}

              {colTasks.length === 0 && (
                <div className="text-center py-6 text-sm text-text-soft border border-dashed border-border/70 rounded-[18px]">
                  No tasks
                </div>
              )}
            </div>
          )
        })}
      </div>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
        members={currentGroup.members}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa Task"
        description={
          deleteTarget
            ? `Bạn có chắc chắn muốn xóa Task "${deleteTarget.title}" khỏi hệ thống không?`
            : undefined
        }
        confirmLabel="Xóa Task"
        cancelLabel="Giữ lại"
        destructive
        onConfirm={handleDeleteTask}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
