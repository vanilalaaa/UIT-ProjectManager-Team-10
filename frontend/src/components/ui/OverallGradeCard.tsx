interface OverallGradeCardProps {
  grade: number | null
  maxGrade: number
  status: string
}

export default function OverallGradeCard({ grade, maxGrade, status }: OverallGradeCardProps) {
  const hasGrade = grade !== null
  const circleColor = hasGrade ? 'border-secondary text-secondary' : 'border-border text-text-soft'
  const topBorderColor = hasGrade ? 'border-t-secondary' : 'border-t-border'

  return (
    <div className={`bg-surface rounded-2xl shadow-soft border border-border border-t-4 ${topBorderColor} p-8 flex flex-col items-center justify-center text-center h-full`}>
      <h2 className="text-lg font-bold text-text mb-6">Overall Grade</h2>
      
      <div className={`size-32 rounded-full border-[10px] ${circleColor} flex flex-col items-center justify-center mb-6`}>
        <span className="text-3xl font-bold">{hasGrade ? grade : '?'}</span>
        <span className="text-sm font-semibold text-text-soft">/ {maxGrade}</span>
      </div>

      <div className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${hasGrade ? 'bg-secondary-soft text-secondary' : 'bg-surface-soft text-text-soft'}`}>
        <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        {status}
      </div>
    </div>
  )
}