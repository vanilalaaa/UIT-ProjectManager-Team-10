import { useEffect, useState } from 'react';
import { getSubmissionReport } from '../../../services/submission.service';
import type { GroupTaskReport, MemberTaskReport } from '../../../types/api/submission';

type Props = {
  projectId: string | number;
};

function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  const color = pct >= 75 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="h-2 w-full rounded-full bg-border overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function MemberRow({ member }: { member: MemberTaskReport }) {
  return (
    <div className="grid grid-cols-12 items-center gap-3 px-4 py-3 text-xs">
      <div className="col-span-3 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-text truncate">{member.name ?? 'Chưa có tên'}</p>
          {member.leader && (
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              Trưởng nhóm
            </span>
          )}
        </div>
        <p className="text-text-soft truncate">
          {member.uid ? `${member.uid} • ` : ''}
          {member.email ?? ''}
        </p>
      </div>

      <div className="col-span-2 text-center">
        <p className="font-bold text-text">{member.completedTasks}/{member.assignedTasks}</p>
        <p className="text-text-soft">task đúng hạn</p>
      </div>

      <div className="col-span-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-text-soft">Hoàn thành</span>
          <span className="font-bold text-text">{member.completionRate}%</span>
        </div>
        <ProgressBar value={member.completionRate} />
      </div>

      <div className="col-span-2 text-center">
        <p className={`font-bold ${member.lateTasks > 0 ? 'text-rose-500' : 'text-text'}`}>
          {member.lateTasks}
        </p>
        <p className="text-text-soft">lần trễ</p>
      </div>

      <div className="col-span-2 text-center">
        <p className="font-bold text-text">
          {member.avgCompletionDays != null ? `${member.avgCompletionDays} ngày` : '—'}
        </p>
        <p className="text-text-soft">TB/task</p>
      </div>
    </div>
  );
}

function GroupCard({ group }: { group: GroupTaskReport }) {
  return (
    <div className="bg-surface border border-border rounded-xl shadow-soft overflow-hidden">
      <div className="p-4 border-b border-border bg-surface-soft">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-bold text-text">{group.groupName ?? 'Nhóm sinh viên'}</p>
            <p className="text-xs text-text-soft">{group.memberCount} thành viên</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-soft">Tiến độ nhóm</p>
            <p className="font-bold text-text">
              {group.completedTasks}/{group.totalTasks} task đúng hạn • {group.completionRate}%
            </p>
            <p className="text-xs text-text-soft mt-0.5">
              {group.lateTasks > 0 ? (
                <span className="text-rose-500 font-bold">{group.lateTasks} lần trễ deadline</span>
              ) : (
                <span>Không trễ deadline</span>
              )}
              {group.avgCompletionDays != null && ` • TB ${group.avgCompletionDays} ngày/task`}
            </p>
          </div>
        </div>
        <div className="mt-3">
          <ProgressBar value={group.completionRate} />
        </div>
      </div>

      {group.members.length === 0 ? (
        <p className="px-4 py-6 text-center text-xs text-text-soft">Nhóm chưa có thành viên hoạt động.</p>
      ) : (
        <>
          <div className="grid grid-cols-12 gap-3 px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-text-soft border-b border-border">
            <div className="col-span-3">Thành viên</div>
            <div className="col-span-2 text-center">Task</div>
            <div className="col-span-3">Tỷ lệ hoàn thành</div>
            <div className="col-span-2 text-center">Trễ deadline</div>
            <div className="col-span-2 text-center">Thời gian</div>
          </div>
          <div className="divide-y divide-border">
            {group.members.map((m) => (
              <MemberRow key={m.userId} member={m} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function SubmissionReport({ projectId }: Props) {
  const [reports, setReports] = useState<GroupTaskReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getSubmissionReport(projectId)
      .then((data) => {
        if (isMounted) setReports(data);
      })
      .catch(() => {
        if (isMounted) setReports([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [projectId]);

  if (loading) return null;
  if (reports.length === 0) return null;

  return (
    <div className="space-y-4 pt-4 mt-4 border-t border-border">
      <div>
        <h2 className="text-xl font-bold text-text">Báo cáo công việc nhóm</h2>
        <p className="text-xs text-text-soft mt-1">
          Thống kê số task được giao, tỷ lệ hoàn thành (task trễ deadline không được tính,
          và thành viên có task trễ bị trừ 30% tỷ lệ đóng góp), số lần trễ deadline
          và thời gian hoàn thành trung bình của từng thành viên.
        </p>
      </div>
      {reports.map((group) => (
        <GroupCard key={group.groupId} group={group} />
      ))}
    </div>
  );
}
