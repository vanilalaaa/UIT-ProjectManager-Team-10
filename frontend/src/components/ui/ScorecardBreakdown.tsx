export type ScoreCriteria = {
  label: string
  score: number
  maxScore: number
  colorClass: string 
  bgFillClass: string
}

interface ScorecardBreakdownProps {
  criteria: ScoreCriteria[]
}

export default function ScorecardBreakdown({ criteria }: ScorecardBreakdownProps) {
  return (
    <div className="bg-surface rounded-2xl shadow-soft border border-border p-6 h-full flex flex-col">
      <h2 className="text-base font-bold text-text mb-6">Scorecard Breakdown</h2>
      
      {criteria && criteria.length > 0 ? (
        <div className="space-y-5">
          {criteria.map((item, index) => {
            const percentage = (item.score / item.maxScore) * 100
            return (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-text">{item.label}</span>
                  <span className={`text-sm font-bold ${item.colorClass}`}>
                    {item.score.toFixed(1)} / {item.maxScore}
                  </span>
                </div>
                <div className="w-full bg-surface-soft rounded-full h-2.5 overflow-hidden flex">
                  <div 
                    className={`h-full rounded-full ${item.bgFillClass}`} 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-text-soft py-6">
          <p className="font-medium">Chưa có chi tiết điểm</p>
          <p className="text-sm mt-1">Các tiêu chí đánh giá sẽ hiển thị tại đây.</p>
        </div>
      )}
    </div>
  )
}