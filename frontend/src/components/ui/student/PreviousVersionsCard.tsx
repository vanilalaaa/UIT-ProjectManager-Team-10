export type Version = {
  id: number
  title: string
  date: string
  file: string
  isDraft: boolean
}

interface PreviousVersionsCardProps {
  versions: Version[]
}

export default function PreviousVersionsCard({ versions }: PreviousVersionsCardProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
      <h2 className="text-base font-bold text-text mb-4">Previous Versions</h2>
      <hr className="border-border mb-4" />
      
      <div className="space-y-6">
        {versions.map((version) => (
          <div key={version.id} className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${version.isDraft ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-text text-sm">{version.title}</h4>
                <span className="text-[10px] text-text-soft font-semibold">{version.date}</span>
              </div>
              <p className="text-sm text-text-soft mt-0.5">{version.file}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}