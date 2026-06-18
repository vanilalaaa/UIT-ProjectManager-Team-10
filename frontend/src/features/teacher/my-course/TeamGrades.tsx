import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getProjectById } from '../../../services/project.service';
import { getRequirement, type RubricCriterion } from '../../../services/requirement.service';
import {
  getGradeBySubmission,
  createGrade,
  updateGrade,
  type CriterionScorePayload,
} from '../../../services/grade.service';
import type { Project, ProjectSubmissionLite } from '../../../types/api/project';
import { formatScore } from '../../../utils/number';

export default function TeamGrades() {
  const { courseId, projectId } = useParams<{ courseId: string; projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [criteria, setCriteria] = useState<RubricCriterion[]>([]);
  const [submission, setSubmission] = useState<ProjectSubmissionLite | null>(null);
  const [gradeId, setGradeId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isGraded, setIsGraded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const loadCriteria = courseId
      ? getRequirement(courseId).then((r) => r.criteria).catch(() => [] as RubricCriterion[])
      : Promise.resolve([] as RubricCriterion[]);

    const loadProject = getProjectById(projectId ?? '');

    Promise.all([loadCriteria, loadProject]).then(async ([crits, proj]) => {
      if (!mounted) return;
      setCriteria(crits);
      if (proj) setProject(proj);

      // Bài nộp mới nhất của project (lấy từ ProjectResponse đã phẳng) là bài được chấm.
      const subs = proj?.submissions ?? [];
      const sub = subs.length
        ? [...subs].sort((a, b) => (b.submittedAt ?? '').localeCompare(a.submittedAt ?? ''))[0]
        : null;
      setSubmission(sub);

      if (sub) {
        const grade = await getGradeBySubmission(sub.submissionId);
        if (!mounted) return;
        if (grade) {
          const nextScores: Record<string, number> = {};
          const nextNotes: Record<string, string> = {};
          grade.criterionScores.forEach((cs) => {
            // Khớp điểm đã chấm với tiêu chí hiện tại theo id; nếu barem từng bị lưu lại
            // (criterion_id đổi) thì khớp theo tên để điểm không bị "biến mất".
            const byId =
              cs.criterionId != null
                ? crits.find((c) => c.id === String(cs.criterionId))
                : undefined;
            const match = byId ?? crits.find((c) => c.name === cs.name);
            const key = match?.id ?? (cs.criterionId != null ? String(cs.criterionId) : null);
            if (key != null) {
              nextScores[key] = cs.score;
              nextNotes[key] = cs.note;
            }
          });
          setScores(nextScores);
          setNotes(nextNotes);
          setFeedback(grade.feedback);
          setGradeId(grade.id);
          setIsGraded(true);
        }
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [projectId, courseId]);

  if (loading) return <div className="p-8 text-center text-text-soft">Đang tải đồ án...</div>;
  if (!project) return <div className="p-8 text-center text-text-soft">Không tìm thấy đồ án.</div>;

  const totalMax = criteria.reduce((s, c) => s + c.maxScore, 0);
  const totalScore = criteria.reduce((s, c) => s + (scores[c.id] || 0), 0);
  const overall = totalMax > 0 ? (totalScore / totalMax) * 10 : 0;

  const handleScoreChange = (crit: RubricCriterion, value: string) => {
    const num = value === '' ? 0 : Number(value);
    if (num >= 0 && num <= crit.maxScore) setScores((prev) => ({ ...prev, [crit.id]: num }));
  };

  // Chỉ được chấm khi đã qua ngày kết thúc của đồ án, đồng nhất với backend
  // (GradeService: LocalDate.now().isAfter(endDate)).
  const deadlinePassed = (() => {
    if (!project?.endDate) return false;
    const end = new Date(project.endDate);
    if (Number.isNaN(end.getTime())) return false;
    const now = new Date();
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return today.getTime() > endDay.getTime();
  })();

  const handleStartGrading = () => {
    // Sửa lại điểm cũ thì luôn cho phép; chỉ chặn khi bắt đầu chấm mà chưa hết hạn.
    if (!isGraded && !deadlinePassed) {
      setError('Chưa hết hạn nộp bài, không thể chấm điểm.');
      return;
    }
    setError(null);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!submission) return;
    setSaving(true);
    setError(null);

    const criterionScores: CriterionScorePayload[] = criteria.map((c) => ({
      criterionId: Number.isNaN(Number(c.id)) ? null : Number(c.id),
      name: c.name,
      maxScore: c.maxScore,
      score: scores[c.id] || 0,
      note: notes[c.id] || '',
    }));

    try {
      const saved = gradeId
        ? await updateGrade(gradeId, { feedback, criterionScores })
        : await createGrade(projectId ?? '', {
            submissionId: submission.submissionId,
            feedback,
            criterionScores,
          });
      setGradeId(saved.id);
      setIsGraded(true);
      setIsEditing(false);
    } catch {
      setError('Lưu điểm thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
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
      ) : !submission ? (
        <div className="glass-panel rounded-[var(--radius-card)] p-10 text-center text-text-soft">
          Nhóm chưa nộp bài cho đồ án này nên chưa thể chấm điểm.
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
                <span className="absolute text-4xl font-extrabold text-brand-gradient">{formatScore(overall)}</span>
              </div>
            ) : (
              <div className="size-40 flex items-center justify-center border-4 border-dashed border-surface-soft rounded-full text-text-soft">Chưa chấm</div>
            )}
          </div>

          <div className="xl:col-span-2 glass-panel rounded-[var(--radius-card)] p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold">Barem chấm điểm</h3>
              {!isEditing && (
                <button onClick={handleStartGrading} className="px-6 py-2 rounded-[var(--radius-button)] bg-brand-gradient text-white font-bold shadow-lg">
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
                          step="any"
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

            <div className="mt-6">
              <h4 className="font-bold text-text text-sm mb-2">Nhận xét chung</h4>
              {isEditing ? (
                <textarea className="w-full p-3 bg-surface-soft rounded-lg text-xs border border-border min-h-[80px]" placeholder="Nhận xét chung cho cả đồ án..." value={feedback} onChange={(e) => setFeedback(e.target.value)} />
              ) : (
                <div className="p-3 bg-surface-soft/50 rounded-lg text-xs italic text-text-soft border border-border-soft">
                  {isGraded ? feedback || 'Không có nhận xét' : 'Chưa chấm'}
                </div>
              )}
            </div>

            {error && <p className="mt-4 text-xs text-red-500 text-right">{error}</p>}

            {isEditing && (
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setIsEditing(false)} disabled={saving} className="px-6 py-2.5 rounded-[var(--radius-button)] border border-border text-text-soft font-bold text-sm disabled:opacity-50">
                  Hủy
                </button>
                <button onClick={handleSave} disabled={saving} className="px-8 py-2.5 rounded-[var(--radius-button)] bg-brand-gradient text-white font-bold shadow-lg text-sm disabled:opacity-50">
                  {saving ? 'Đang lưu...' : 'Lưu điểm'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
