import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getProjectById } from '../../../services/project.service';
import type { Project, Submission } from '../../../mocks/types';

const CRITERIA = ['UI/UX Design', 'Backend Architecture', 'Documentation & Testing'];

type GradedSubmission = Submission & {
  rubricScores?: Record<string, number>
  rubricNotes?: Record<string, string>
}

export default function TeamGrades() {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isGraded, setIsGraded] = useState(false);

  const [scores, setScores] = useState<Record<string, number>>({
    'UI/UX Design': 0, 'Backend Architecture': 0, 'Documentation & Testing': 0,
  });
  const [notes, setNotes] = useState<Record<string, string>>({
    'UI/UX Design': '', 'Backend Architecture': '', 'Documentation & Testing': '',
  });

  useEffect(() => {
    getProjectById(projectId ?? '').then((found) => {
      if (!found) return;
      setProject(found);
      const sub = found.submissions?.[0] as GradedSubmission | undefined;
      if (sub?.rubricScores) {
        setScores(sub.rubricScores);
        setIsGraded(true);
      }
      if (sub?.rubricNotes) setNotes(sub.rubricNotes);
    });
  }, [projectId]);

  if (!project) return <div>Project not found</div>;

  const average = Object.values(scores).reduce((a, b) => a + b, 0) / CRITERIA.length;
  const sub = project.submissions?.[0] as GradedSubmission | undefined;

  const handleScoreChange = (key: string, value: string) => {
    if (value === "") {
      setScores({ ...scores, [key]: 0 });
      return;
    }
    const num = Number(value);
    if (num >= 0 && num <= 10) setScores({ ...scores, [key]: num });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-text">{project.title}</h1>
        <div className="flex items-center gap-4 mt-2">
          <span className="px-3 py-1 bg-primary-soft text-primary rounded-full text-xs font-bold uppercase">Final Submission</span>
          <span className="text-sm text-text-soft flex items-center gap-1">Submitted: {sub?.submittedAt || 'N/A'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1 glass-panel rounded-[var(--radius-card)] p-8 flex flex-col items-center justify-center space-y-4 h-fit">
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
            <div className="size-40 flex items-center justify-center border-4 border-dashed border-surface-soft rounded-full text-text-soft">Chưa chấm</div>
          )}
        </div>

        <div className="xl:col-span-2 glass-panel rounded-[var(--radius-card)] p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold">Scorecard Breakdown</h3>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="px-6 py-2 rounded-[var(--radius-button)] bg-brand-gradient text-white font-bold shadow-lg">
                {isGraded ? 'Edit Grades' : 'Start Grading'}
              </button>
            )}
          </div>

          <div className="space-y-4">
            {CRITERIA.map((item) => (
              <div key={item} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-text text-[13px]">{item}</span>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input type="text" className="w-12 h-7 text-right bg-surface-soft rounded border border-border px-2 text-xs" value={scores[item] || 0} onChange={(e) => handleScoreChange(item, e.target.value)} />
                      <span className="text-[11px] text-text-soft">/ 10</span>
                    </div>
                  ) : (
                    <span className="text-primary font-bold text-xs">{isGraded ? `${scores[item] || 0} / 10` : '- / 10'}</span>
                  )}
                </div>
                {!isEditing && isGraded && (
                  <div className="h-2 w-full bg-surface-soft rounded-full overflow-hidden">
                    <div className="h-full bg-brand-gradient rounded-full" style={{ width: `${Math.min(scores[item] || 0, 10) * 10}%` }} />
                  </div>
                )}
                {isEditing ? (
                  <textarea className="w-full p-2 bg-surface-soft rounded-lg text-xs border border-border min-h-[60px]" placeholder="Nhận xét..." value={notes[item] || ''} onChange={(e) => setNotes({...notes, [item]: e.target.value})} />
                ) : (
                  <div className="p-2 bg-surface-soft/50 rounded-lg text-[11px] italic text-text-soft border border-border-soft">
                    “{notes[item] || 'Không có nhận xét'}”
                  </div>
                )}
              </div>
            ))}
          </div>

          {isEditing && (
            <div className="flex justify-end mt-6">
              <button onClick={() => { setIsGraded(true); setIsEditing(false); }} className="px-8 py-2.5 rounded-[var(--radius-button)] bg-brand-gradient text-white font-bold shadow-lg text-sm">
                Save
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}