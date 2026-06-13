interface ProjectStatusCardProps {
  status: string
}

export default function ProjectStatusCard({ status }: ProjectStatusCardProps) {
  return (
    <div className="bg-surface border border-border rounded-[18px] p-6 shadow-soft">
      <h2 className="text-base font-bold text-text mb-4">Project Status</h2>
      <hr className="border-border mb-4" />
      
      <div className="flex items-center gap-2 mb-3">
        <span className="size-2.5 rounded-full bg-primary"></span>
        <span className="font-bold text-text text-sm">{status}</span>
      </div>
      
      <p className="text-sm text-text-soft leading-relaxed">
        This workspace will become read-only once marked as 'Completed'.
      </p>
    </div>
  )
}