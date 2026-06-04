import { Link } from 'react-router-dom'
import FileAttachment from '../../components/ui/FileAttachment'
import type { Project } from '../../mocks/types'

interface Props {
  project: Project
}

export default function ProjectWorkspaceCard({ project }: Props) {
  const members = project.registrations?.map(r => r.groupMember).filter(Boolean) || []
  const uniqueMembers = Array.from(new Set(members.map(m => m?.userId)))
    .map(id => members.find(m => m?.userId === id))
  const previewMembers = uniqueMembers.slice(0, 2)

  return (
    <div className="bg-surface p-6 rounded-2xl border border-border shadow-soft flex flex-col">
      <div className="flex justify-between items-start">
        <span className="bg-primary-soft text-primary text-xs font-bold px-2 py-1 rounded">
          {project.course?.name?.split(' - ')[0] || 'N/A'}
        </span>
        <button className="text-text-soft hover:text-text">...</button>
      </div>

      <h3 className="font-bold text-lg mt-3 text-text">{project.title || 'Untitled Project'}</h3>
      <p className="text-sm text-text-soft mt-2 line-clamp-2">{project.description || 'No description'}</p>

      <div className="mt-4 space-y-2">
        {project.submissions?.slice(0, 2).map((sub, idx) => (
          <FileAttachment 
            key={idx} 
            fileName={sub.filePath?.split('/').pop() || 'file'} 
          />
        ))}
      </div>

      <div className="mt-auto pt-6 flex items-center justify-between border-t border-border">
        <div className="flex -space-x-2">
          {previewMembers.length > 0 ? (
            <>
              {previewMembers.map((member, idx) => (
                <img 
                  key={idx}
                  src={member?.userProfile?.avatarUrl || `https://ui-avatars.com/api/?name=${member?.name}&background=random`} 
                  alt={member?.name || 'Member'}
                  className="size-8 rounded-full border-2 border-surface object-cover relative z-10"
                  title={member?.name}
                />
              ))}
              
              {uniqueMembers.length > 2 && (
                <div className="size-8 rounded-full bg-surface-soft border-2 border-surface flex items-center justify-center text-[10px] font-bold text-text-soft relative z-0">
                  +{uniqueMembers.length - 2}
                </div>
              )}
            </>
          ) : (
             <div className="size-8 rounded-full bg-slate-200 border-2 border-surface flex items-center justify-center text-[10px] text-slate-500 relative z-10">
               ?
             </div>
          )}
        </div>

        <Link 
          to={`/my-project/${project.projectId}`} 
          className="text-primary font-bold text-sm hover:underline"
        >
          Open Workspace →
        </Link>
      </div>
    </div>
  )
}