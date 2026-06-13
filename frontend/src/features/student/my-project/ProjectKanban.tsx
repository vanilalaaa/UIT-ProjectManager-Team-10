import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import TaskCard from '../../../components/ui/student/TaskCard'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import CreateTaskModal from '../../../components/ui/student/CreateTaskModal'
import type { Task, User, Group } from '../../../mocks/types'
import { mockProjects } from '../../../mocks/projects.mock'
import { mockTasks, mockMyGroupMap, mockCourseMembersMap } from '../../../mocks/tasks.mock'

const COLUMNS = [
  { id: 'TODO', title: 'To Do', dot: 'bg-text-soft', text: 'text-text-soft' },
  { id: 'IN_PROGRESS', title: 'In Progress', dot: 'bg-accent', text: 'text-accent' },
  { id: 'REVIEW', title: 'Review', dot: 'bg-primary', text: 'text-primary' },
  { id: 'DONE', title: 'Done', dot: 'bg-secondary', text: 'text-secondary' }
]

const fetchBoardData = async (projectId: string | undefined) => {
  return new Promise<{ tasks: Task[], currentUser: User | null, currentGroup: Group | null }>(resolve => {
    setTimeout(() => {
      const project = mockProjects.find(p => p.projectId.toString() === projectId)
      const courseId = project?.course?.courseId || 1
      
      const group = mockMyGroupMap[courseId] || null
      const members = mockCourseMembersMap[courseId] || []
      
      const currentUser = members.length > 0 ? members[0] : null
      const groupTasks = group ? mockTasks.filter(t => t.group.groupId === group.groupId) : []

      resolve({ tasks: groupTasks, currentUser, currentGroup: group })
    }, 500)
  })
}

export default function ProjectKanban() {
  const { projectId } = useParams<{ projectId: string }>()
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    fetchBoardData(projectId).then(data => {
      if (isMounted) {
        setTasks(data.tasks)
        setCurrentUser(data.currentUser)
        setCurrentGroup(data.currentGroup)
        setLoading(false)
      }
    })

    return () => { isMounted = false }
  }, [projectId])

  const isLeader = Boolean(currentGroup && currentUser && currentGroup.leader.userId === currentUser.userId)

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.assignedTo.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const onDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData('taskId', taskId.toString())
  }

  const onDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    const taskId = Number(e.dataTransfer.getData('taskId'))
    const taskToMove = tasks.find(t => t.taskId === taskId)

    if (!taskToMove || !currentUser) return

    if (!isLeader && taskToMove.assignedTo.userId !== currentUser.userId) {
      alert("Cảnh báo: Bạn chỉ được quyền cập nhật trạng thái Task do chính bạn phụ trách!")
      return
    }

    setTasks(prev => prev.map(t => 
      t.taskId === taskId ? { ...t, status: newStatus } : t
    ))
  }

  const handleDeleteTask = (taskId: number) => {
    if (confirm("Xác nhận xóa Task này khỏi hệ thống?")) {
      setTasks(prev => prev.filter(t => t.taskId !== taskId))
    }
  }

  const handleCreateTask = (newTask: Partial<Task>) => {
    if (!currentUser || !currentGroup) return
    
    const task: Task = {
      ...newTask,
      taskId: Math.floor(Math.random() * 10000),
      createdBy: currentUser,
      status: 'TODO',
      group: currentGroup,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Task

    setTasks(prev => [task, ...prev])
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
                      onClick={() => handleDeleteTask(task.taskId)}
                      className="absolute -top-2 -right-2 size-6 bg-warning text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
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
        members={currentGroup.members as User[]}
      />
    </div>
  )
}