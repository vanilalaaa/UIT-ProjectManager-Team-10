import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getProjectById } from '../../../services/project.service';
import { getRequirement, type RubricCriterion } from '../../../services/requirement.service';
import { addActivity } from '../../../services/activity.service';
import type { Project } from '../../../mocks/types';

export default function TeamGrades() {
  const { courseId, projectId } = useParams<{ courseId: string; projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [criteria, setCriteria] = useState<RubricCriterion[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isGraded, setIsGraded] = useState(false);

  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    setCriteria(getRequirement(courseId ?? '').criteria);
    getProjectById(projectId ?? '').then((found) => {
      if (found) setProject(found);
    });
  }, [projectId, courseId]);

  if (!project) return <div className="p-8 text-center text-text-soft">Đang tải đồ án...</div>;

  const totalMax = criteria.reduce((s, c) => s + c.maxScore, 0);
  const totalScore = criteria.reduce((s, c) => s + (scores[c.id] || 0), 0);
  const overall = totalMax > 0 ? (totalScore / totalMax) * 10 : 0;

  const handleScoreChange = (crit: RubricCriterion, value: string) => {
    const num = value === '' ? 0 : Number(value);
    if (num >= 0 && num <= crit.maxScore) setScores((prev) => ({ ...prev, [crit.id]: num }));
  };

  const handleSave = () => {
    setIsGraded(true);
    setIsEditing(false);
    addActivity({
      kind: 'APPROVAL',
      title: `Đồ án "${project.title}" đã được chấm điểm: ${overall.toFixed(1)}/10`,
      note: criteria.map((c) => `${c.name}: ${scores[c.id] || 0}/${c.maxScore}${notes[c.id] ? ` — ${notes[c.id]}` : ''}`).join('\n'),
      actorName: 'Giảng viên',
      scope: 'STUDENT',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-text">{project.title}</h1>
        <span className="inline-block mt-2 px-3 py-1 bg-primary-soft text-primary rounded-full text-xs font-bold uppercase">Final Submission</span>
      </div>

      {criteria.length === 0 ? (
        <div className="glass-panel rounded-[var(--radius-card)] p-10 text-center text-text-soft">
          Giảng viên chưa thiết lập barem chấm điểm cho lớp này. Vào tab “Danh sách Đồ án” → “Tạo yêu cầu” để thêm tiêu chí.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1 glass-panel rounded-[var(--radius-card)] p-8 flex flex-col items-center justify-center space-y-4 h-fit">
            <h3 className="text-text font-bold">Overall Grade</h3>
            {isGraded ? (
              <div className="relative size-40 flex items-center justify-center">
                <svg className="size-full -rotate-90">
                  <circle cx="80" cy="80" r="72" className="stroke-surface-soft" strokeWidth="12" fill="none" />
                  <circle cx="80" cy="80" r="72" className="stroke-primary" strokeWidth="12" fill="none" strokeDasharray={452} strokeDashoffset={452 - (452 * overall) / 10} strokeLinecap="round" />
                </svg>
                <span className="absolute text-4xl font-extrabold text-brand-gradient">{overall.toFixed(1)}</span>
              </div>
            ) : (
              <div className="size-40 flex items-center justify-center border-4 border-dashed border-surface-soft rounded-full text-text-soft">Chưa chấm</div>
            )}
          </div>

          <div className="xl:col-span-2 glass-panel rounded-[var(--radius-card)] p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold">Barem chấm điểm</h3>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="px-6 py-2 rounded-[var(--radius-button)] bg-brand-gradient text-white font-bold shadow-lg">
                  {isGraded ? 'Sửa điểm' : 'Bắt đầu chấm'}
                </button>
              )}
            </div>

            <div className="space-y-4">
              {criteria.map((crit) => (
                <div key={crit.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-text text-[13px]">{crit.name}</span>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={crit.maxScore}
                          className="w-14 h-7 text-right bg-surface-soft rounded border border-border px-2 text-xs"
                          value={scores[crit.id] || 0}
                          onChange={(e) => handleScoreChange(crit, e.target.value)}
                        />
                        <span className="text-[11px] text-text-soft">/ {crit.maxScore}</span>
                      </div>
                    ) : (
                      <span className="text-primary font-bold text-xs">
                        {isGraded ? `${scores[crit.id] || 0} / ${crit.maxScore}` : `- / ${crit.maxScore}`}
                      </span>
                    )}
                  </div>
                  {!isEditing && isGraded && (
                    <div className="h-2 w-full bg-surface-soft rounded-full overflow-hidden">
                      <div className="h-full bg-brand-gradient rounded-full" style={{ width: `${crit.maxScore > 0 ? ((scores[crit.id] || 0) / crit.maxScore) * 100 : 0}%` }} />
                    </div>
                  )}
                  {isEditing ? (
                    <textarea className="w-full p-2 bg-surface-soft rounded-lg text-xs border border-border min-h-[60px]" placeholder="Nhận xét..." value={notes[crit.id] || ''} onChange={(e) => setNotes({ ...notes, [crit.id]: e.target.value })} />
                  ) : isGraded ? (
                    <div className="p-2 bg-surface-soft/50 rounded-lg text-[11px] italic text-text-soft border border-border-soft">“{notes[crit.id] || 'Không có nhận xét'}”</div>
                  ) : null}
                </div>
              ))}
            </div>

            {isEditing && (
              <div className="flex justify-end mt-6">
                <button onClick={handleSave} className="px-8 py-2.5 rounded-[var(--radius-button)] bg-brand-gradient text-white font-bold shadow-lg text-sm">
                  Lưu điểm
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
