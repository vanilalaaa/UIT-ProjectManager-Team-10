import { useState } from 'react';

// Shape của feedback do BE chưa định nghĩa rõ — dùng tạm. Khi BE chốt schema,
// chuyển sang type chính thức trong types/api/feedback.ts.
type GradeFeedback = {
  lecturer: { name: string; avatar: string; department: string } | null
  content: string
} | null

type GradeData = {
  project: Project | null
  criteria: ScoreCriteria[]
  feedback: GradeFeedback
}

const fetchGradeData = async (projectId: string | undefined): Promise<GradeData> => {
  const project = mockProjects.find(p => p.projectId.toString() === projectId)

  return new Promise<GradeData>(resolve => {
    setTimeout(() => {
      resolve({
        project: project || null,
        criteria: [],
        feedback: null
      })
    }, 500)
  })
}

export default function ProjectGrades() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState<GradeData | null>(null)
  const [loading, setLoading] = useState(true)

  const handleSave = () => {
    setIsGraded(true);
    setIsEditing(false);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-in">
      <div className="xl:col-span-1 glass-panel rounded-[var(--radius-card)] p-8 flex flex-col items-center justify-center space-y-4">
        <h3 className="text-text font-bold">Overall Grade</h3>
        {isGraded ? (
          <div className="relative size-40 flex items-center justify-center">
            <svg className="size-full -rotate-90">
              <circle cx="80" cy="80" r="72" className="stroke-surface-soft" strokeWidth="12" fill="none" />
              <circle cx="80" cy="80" r="72" className="stroke-primary" strokeWidth="12" fill="none" strokeDasharray={452} strokeDashoffset={452 - (452 * average) / 10} strokeLinecap="round" />
            </svg>
            <span className="absolute text-4xl font-extrabold text-brand-gradient">{average.toFixed(1)}</span>
          </div>
        ) : (
          <div className="size-40 flex items-center justify-center border-4 border-dashed border-surface-soft rounded-full text-text-soft">
            Chưa chấm
          </div>
        )}
        {isGraded && <span className="px-4 py-1 rounded-full bg-secondary-soft text-secondary font-bold text-sm">Distinction</span>}
      </div>

      <div className="xl:col-span-2 glass-panel rounded-[var(--radius-card)] p-8">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold">Scorecard Breakdown</h3>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 rounded-[var(--radius-button)] bg-brand-gradient text-white font-bold shadow-lg hover:opacity-90 transition-all"
            >
              {isGraded ? 'Edit Grades' : 'Start Grading'}
            </button>
          )}
        </div>

        <div className="space-y-6">
          {CRITERIA.map((item) => (
            <div key={item} className="space-y-2">
              <div className="flex justify-between font-bold text-sm">
                <span>{item}</span>
                {isEditing ? (
                   <input type="number" max={10} min={0} className="w-16 text-right bg-surface-soft rounded px-2" value={scores[item as keyof typeof scores]} onChange={(e) => setScores({...scores, [item]: Number(e.target.value)})} />
                ) : (
                   <span className="text-primary">{isGraded ? `${scores[item as keyof typeof scores]} / 10` : '- / 10'}</span>
                )}
              </div>
              
              {isGraded && !isEditing && (
                <div className="h-3 w-full bg-surface-soft rounded-full overflow-hidden">
                  <div className="h-full bg-brand-gradient rounded-full" style={{ width: `${scores[item as keyof typeof scores] * 10}%` }} />
                </div>
              )}
              
              {isEditing && (
                <textarea className="w-full p-3 bg-surface-soft rounded-xl text-sm" placeholder="Nhận xét..." value={notes[item as keyof typeof notes]} onChange={(e) => setNotes({...notes, [item]: e.target.value})} />
              )}
            </div>
          ))}
        </div>

        {isEditing && (
          <div className="flex gap-4 mt-8">
            <button onClick={() => setIsEditing(false)} className="flex-1 py-4 rounded-[var(--radius-button)] bg-surface-soft font-bold">Cancel</button>
            <button onClick={handleSave} className="flex-1 py-4 rounded-[var(--radius-button)] bg-brand-gradient text-white font-bold shadow-card">Save Official Grades</button>
          </div>
        )}
      </div>
    </div>
  );
}