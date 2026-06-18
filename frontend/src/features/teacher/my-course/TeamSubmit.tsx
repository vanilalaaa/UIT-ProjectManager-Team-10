import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProjectById } from '../../../services/project.service';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import type { Project } from '../../../types/api/project';
import SubmissionReport from './SubmissionReport';

export default function TeamSubmit() {
  const { projectId } = useParams();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getProjectById(projectId ?? '').then((p) => {
      if (!isMounted) return;
      setProject(p);
      setLoading(false);
    });
    return () => { isMounted = false };
  }, [projectId]);

  if (loading) return <LoadingSpinner message="Đang tải bài nộp..." />;
  if (!project) return <div className="p-8 text-center text-text-soft">Không tìm thấy dự án.</div>;

  const formatSubmittedAt = (value: string | null) => {
    if (!value) return 'Chưa cập nhật';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString('vi-VN');
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-text mb-4">Danh sách bài nộp</h2>
      {project.submissions?.map((sub) => {
        const fileUrl = sub.filePath?.startsWith('http') 
          ? sub.filePath 
          : `http://localhost:8080${sub.filePath}`;

        return (
          <div key={sub.submissionId} className="bg-surface border border-border rounded-xl shadow-soft overflow-hidden transition-all">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-sm text-primary hover:underline cursor-pointer"
                >
                  {sub.filePath?.split('/').pop()}
                </a>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setExpandedId(expandedId === sub.submissionId ? null : sub.submissionId)}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  {expandedId === sub.submissionId ? 'Đóng' : 'Xem chi tiết'}
                </button>
              </div>
            </div>
            {expandedId === sub.submissionId && (
              <div className="px-12 py-4 bg-surface-soft border-t border-border space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-text-soft">Người nộp:</p>
                    <p className="font-bold text-text truncate">{sub.submittedByName ?? 'Chưa có thông tin'}</p>
                    <p className="text-text-soft truncate">
                      {sub.submittedByUid ? `${sub.submittedByUid} • ` : ''}
                      {sub.submittedByEmail ?? 'Chưa có email'}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-soft">Nhóm thực hiện:</p>
                    <p className="font-bold text-text truncate">{sub.groupName ?? project.groupName ?? 'Nhóm sinh viên'}</p>
                    <p className="text-text-soft">Thời gian: <span className="font-semibold text-text">{formatSubmittedAt(sub.submittedAt)}</span></p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <SubmissionReport projectId={projectId ?? ''} />
    </div>
  );
}
