import StatusBadge from '../student/StatusBadge'
import FileAttachment from '../student/FileAttachment'
import type { Project } from '../../../mocks/types'

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
    <div className="rounded-[32px] border border-border bg-surface p-8 shadow-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-text">{project.title}</h1>
          <div className="flex items-center gap-2 text-xs md:text-sm text-text-soft font-medium">
            <svg className="size-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
            <span>{project.course.name} • {project.category?.name || 'Đồ án cuối kỳ'}</span>
          </div>
        </div>
        <div className="shrink-0 sm:self-start">
          <StatusBadge status={project.status} />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xs font-bold text-text uppercase tracking-widest text-primary/90">Description</h3>
        <p className="mt-2 text-[15px] text-text-soft leading-relaxed max-w-4xl">{project.description}</p>
      </div>

      <div className="mt-8">
        <h3 className="text-xs font-bold text-text uppercase tracking-widest text-primary/90 mb-3">Project Files</h3>
        <div className="bg-surface-soft/60 border border-border rounded-xl p-4 flex flex-wrap gap-3">
          {projectFiles.map((file, idx) => (
            <FileAttachment key={idx} fileName={file} />
          ))}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center border border-primary/10">
            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-soft block">Deadline</span>
            <p className="text-sm font-bold text-text mt-0.5">{project.endDate}</p>
          </div>
        </div>
        
        {showEditButton && (
          <button
            onClick={onEditClick}
            className="px-6 py-2.5 bg-surface-soft border border-border text-text text-sm font-bold rounded-xl shadow-sm hover:bg-border transition-all"
          >
            Chỉnh sửa đồ án
          </button>
        )}
      </div>
    </div>
  )
}