import React, { useState } from 'react'
import { mockTasks } from '../../../mocks/tasks.mock'
import TaskCard from '../../../components/ui/TaskCard'
import type { Task } from '../../../mocks/types'

const COLUMNS = [
  { id: 'TODO', title: 'To Do', color: 'text-gray-600', dotColor: 'bg-gray-400' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'text-blue-500', dotColor: 'bg-blue-500' },
  { id: 'REVIEW', title: 'Ready for Test', color: 'text-emerald-500', dotColor: 'bg-emerald-500' },
  { id: 'DONE', title: 'Done', color: 'text-gray-400', dotColor: 'bg-gray-300' },
]

export default function ProjectKanban() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: number) => {
    e.dataTransfer.setData('taskId', taskId.toString())
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: string) => {
    e.preventDefault()
    
    const taskId = parseInt(e.dataTransfer.getData('taskId'))
    if (!taskId) return

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.taskId === taskId ? { ...task, status } : task
      )
    )
  }

  return (
    <div className="h-full flex gap-6 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((task) => task.status === col.id)

        return (
          <div 
            key={col.id} 
            className="w-80 flex-shrink-0 flex flex-col gap-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Header cột */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-text">
                <div className={`size-2 rounded-full ${col.dotColor}`} />
                {col.title}
              </div>
              <span className="bg-surface-soft px-2 py-0.5 rounded-full text-xs font-bold text-text-soft">
                {columnTasks.length}
              </span>
            </div>

            <div className="flex flex-col gap-3 min-h-[200px] h-full">
              {columnTasks.length > 0 ? (
                columnTasks.map((task) => (
                  <TaskCard 
                    key={task.taskId} 
                    task={task} 
                    onDragStart={(e) => handleDragStart(e, task.taskId)}
                  />
                ))
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-border text-center text-sm text-text-soft">
                  No tasks
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}