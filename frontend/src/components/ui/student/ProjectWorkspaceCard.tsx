import { Link } from 'react-router-dom'
import FileAttachment from '../student/FileAttachment'
import Avatar from '../Avatar'
import type { Project } from '../../../types/api/project'

interface Props {
  project: Project
}

export default function ProjectWorkspaceCard({ project }: Props) {
  const members = project.members ?? []
  const previewMembers = members.slice(0, 2)

  return (
    <div className="bg-surface p-6 rounded-2xl border border-border border-t-4 border-t-primary shadow-soft flex flex-col h-full">
      <div className="flex justify-between items-start">
        <span className="bg-primary-soft text-primary text-xs font-bold px-2 py-1 rounded">
          {project.courseName?.split(' - ')[0] || 'N/A'}
        </span>
      </div>

      <h3 className="font-bold text-lg mt-3 text-text">{project.title || 'Untitled Project'}</h3>
      <p className="text-sm text-text-soft mt-2 line-clamp-2">{project.description || 'No description'}</p>

      <div className="mt-4 space-y-2">
        {project.submissions?.slice(0, 2).map((sub) => (
          <FileAttachment
            key={sub.submissionId}
            fileName={sub.filePath?.split('/').pop() || 'file'}
          />
        ))}
      </div>

      <div className="mt-auto pt-6 flex items-center justify-between border-t border-border">
        <div className="flex items-center -space-x-2">
          {previewMembers.length > 0 ? (
            <>
              {previewMembers.map((member) => (
                <Avatar
                  key={member.id}
                  name={member.name}
                  avatarUrl={member.avatar}
                  sizeClass="size-8 border-2 border-surface"
                  textClass="text-[10px]"
                  className="relative z-10"
                />
              ))}

              {members.length > 2 && (
                <div className="size-8 rounded-full bg-surface-soft border-2 border-surface flex items-center justify-center text-[10px] font-bold text-text-soft relative z-0">
                  +{members.length - 2}
                </div>
              )}
            </>
          ) : (
            <Avatar
              name="?"
              sizeClass="size-8 border-2 border-surface"
              textClass="text-[10px]"
              className="relative z-10"
            />
          )}
        </div>

        <Link
          to={`/my-project/${project.projectId}`}
          className="text-primary font-bold text-sm hover:text-primary/90 transition-colors flex items-center gap-1 shrink-0"
        >
          <span>Open Workspace</span>
          <span className="text-base font-semibold leading-none transform translate-y-[-0.5px]">→</span>
        </Link>
      </div>
    </div>
  )
}
