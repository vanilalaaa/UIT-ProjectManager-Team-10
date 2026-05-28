import React from 'react'

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
    <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 h-full">
      <h2 className="text-base font-bold text-text mb-6">Scorecard Breakdown</h2>
      
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
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden flex">
                <div 
                  className={`h-full rounded-full ${item.bgFillClass}`} 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}