import StatusBadge from '../ui/StatusBadge'
import FileAttachment from '../ui/FileAttachment'
import type { Project } from '../../mocks/types'

interface ProjectDetailCardProps {
  project: Project
  showEditButton?: boolean
  onEditClick?: () => void
}

export default function ProjectDetailCard({ project, showEditButton, onEditClick }: ProjectDetailCardProps) {
  const projectFiles = project.submissions?.[0]?.filePath 
    ? [project.submissions[0].filePath.split('/').pop() || 'document.pdf']
    : ['Project_Spec.pdf', 'Analysis_V2.csv']

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">{project.title}</h1>
          <p className="mt-1 text-sm text-text-soft">
            {project.course.name} • {project.category?.name}
          </p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-bold text-text uppercase tracking-wider">Description</h3>
        <p className="mt-2 text-base text-text-soft leading-relaxed">{project.description}</p>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-bold text-text uppercase tracking-wider">Project Files</h3>
        <div className="mt-3 flex flex-wrap gap-3">
          {projectFiles.map((file, idx) => (
            <FileAttachment key={idx} fileName={file} />
          ))}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-text-soft mb-1">
            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider">Deadline</span>
          </div>
          <p className="text-[15px] font-bold text-text">{project.endDate}</p>
        </div>
        
        {showEditButton && (
          <button
            onClick={onEditClick}
            className="px-6 py-2.5 bg-surface-soft border border-border text-text font-semibold rounded shadow-sm hover:bg-border transition-colors"
          >
            Chỉnh sửa đồ án
          </button>
        )}
      </div>
    </div>
  )
}