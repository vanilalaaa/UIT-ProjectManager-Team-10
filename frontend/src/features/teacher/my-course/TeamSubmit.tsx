import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectById } from '../../../services/project.service';
import { getAllGroups } from '../../../services/team.service';
import StatusBadge from '../../../components/ui/student/StatusBadge';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import type { Group, Project } from '../../../mocks/types';

export default function TeamSubmit() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all([getProjectById(projectId ?? ''), getAllGroups()]).then(([p, g]) => {
      if (!isMounted) return;
      setProject(p);
      setGroups(g);
      setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const getGroupName = (groupId: number) => {
    const foundGroup = groups.find((g) => g.groupId === groupId);
    return foundGroup ? foundGroup.name : `Nhóm ${groupId}`;
  };

  if (loading) return <LoadingSpinner message="Đang tải bài nộp..." />;
  if (!project) return <div className="p-8 text-center text-text-soft">Không tìm thấy dự án.</div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-text mb-4">Danh sách bài nộp</h2>
      {project.submissions?.map((sub) => (
        <div key={sub.submissionId} className="bg-surface border border-border rounded-xl shadow-soft overflow-hidden transition-all">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href={sub.filePath}
                download
                className="font-bold text-sm text-primary hover:underline cursor-pointer"
              >
                {sub.filePath.split('/').pop()}
              </a>
            </div>
            <div className="flex items-center gap-4">
              <StatusBadge status={sub.status} />
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
                  <p className="text-text-soft">Nhóm thực hiện:</p>
                  <p className="font-bold text-text truncate">
                    {project.registrations?.[0] ? getGroupName(project.registrations[0].groupId) : 'Nhóm sinh viên'}
                  </p>
                </div>
                <div>
                  <p className="text-text-soft">Thời gian:</p>
                  <p className="font-bold text-text">{sub.submittedAt}</p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/teacher/my-course/1/project-list/${projectId}/grades`)}
                className="w-full py-2 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Chấm điểm
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
