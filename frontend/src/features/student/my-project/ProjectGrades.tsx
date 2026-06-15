/**
 * ProjectGrades.tsx  (Student)
 *
 * Read-only view of the grade a student's project received.
 * Students can see the overall grade, the scorecard breakdown and the
 * lecturer's notes — but they cannot edit anything (grading is done by
 * the teacher in features/teacher/my-course/TeamGrades.tsx).
 */
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { mockProjects } from '../../../mocks/projects.mock';
import type { Project } from '../../../mocks/types';

const CRITERIA = ['UI/UX Design', 'Backend Architecture', 'Documentation & Testing'];

export default function ProjectGrades() {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [isGraded, setIsGraded] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({
    'UI/UX Design': 0, 'Backend Architecture': 0, 'Documentation & Testing': 0,
  });
  const [notes, setNotes] = useState<Record<string, string>>({
    'UI/UX Design': '', 'Backend Architecture': '', 'Documentation & Testing': '',
  });

  useEffect(() => {
    const found = mockProjects.find((p) => p.projectId.toString() === projectId);
    if (found) {
      setProject(found);
      const sub = found.submissions?.[0] as any;
      if (sub?.rubricScores) {
        setScores(sub.rubricScores);
        setIsGraded(true);
      }
      if (sub?.rubricNotes) setNotes(sub.rubricNotes);
    }
  }, [projectId]);

  if (!project) return <div className="text-text-soft">Project not found</div>;

  const average = Object.values(scores).reduce((a, b) => a + b, 0) / CRITERIA.length;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-in">
      {/* Overall grade */}
      <div className="xl:col-span-1 glass-panel rounded-[var(--radius-card)] p-8 flex flex-col items-center justify-center space-y-4 h-fit">
        <h3 className="text-text font-bold">Overall Grade</h3>
        {isGraded ? (
          <>
            <div className="relative size-40 flex items-center justify-center">
              <svg className="size-full -rotate-90">
                <circle cx="80" cy="80" r="72" className="stroke-surface-soft" strokeWidth="12" fill="none" />
                <circle cx="80" cy="80" r="72" className="stroke-primary" strokeWidth="12" fill="none" strokeDasharray={452} strokeDashoffset={452 - (452 * average) / 10} strokeLinecap="round" />
              </svg>
              <span className="absolute text-4xl font-extrabold text-brand-gradient">{average.toFixed(1)}</span>
            </div>
            <span className="px-4 py-1 rounded-full bg-secondary-soft text-secondary font-bold text-sm">Graded</span>
          </>
        ) : (
          <div className="size-40 flex items-center justify-center border-4 border-dashed border-surface-soft rounded-full text-text-soft text-center">
            Chưa chấm
          </div>
        )}
      </div>

      {/* Scorecard breakdown (read-only) */}
      <div className="xl:col-span-2 glass-panel rounded-[var(--radius-card)] p-8">
        <h3 className="text-xl font-bold mb-8">Scorecard Breakdown</h3>

        <div className="space-y-6">
          {CRITERIA.map((item) => (
            <div key={item} className="space-y-2">
              <div className="flex justify-between font-bold text-sm">
                <span>{item}</span>
                <span className="text-primary">{isGraded ? `${scores[item] || 0} / 10` : '- / 10'}</span>
              </div>

              {isGraded && (
                <div className="h-3 w-full bg-surface-soft rounded-full overflow-hidden">
                  <div className="h-full bg-brand-gradient rounded-full" style={{ width: `${Math.min(scores[item] || 0, 10) * 10}%` }} />
                </div>
              )}

              <div className="p-3 bg-surface-soft/50 rounded-xl text-sm italic text-text-soft border border-border-soft">
                “{notes[item] || 'Không có nhận xét'}”
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
