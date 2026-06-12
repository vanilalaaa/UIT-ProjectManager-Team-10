import { useEffect, useState } from 'react';
import Avatar from '../Avatar';
import NotificationModal from './NotificationModal';
import {
  getCourseGroups,
  getTeamInvitations,
  requestJoinTeam,
  type TeamInvitation,
} from '../../../services/team.service';
import type { Team } from '../../../types/api/team';

interface EmptyTeamStateProps {
  onCreateTeamClick: () => void;
  onAcceptInvitation: (invite: TeamInvitation) => void;
  courseId?: string;
}

export default function EmptyTeamState({ onCreateTeamClick, onAcceptInvitation, courseId }: EmptyTeamStateProps) {
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [notification, setNotification] = useState<{ title: string; message: string } | null>(null);

  const [showAllTeams, setShowAllTeams] = useState(false);
  const [showAllInvites, setShowAllInvites] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([getCourseGroups(courseId ?? '1'), getTeamInvitations()]).then(([teams, invites]) => {
      if (!alive) return;
      setAvailableTeams(teams);
      setInvitations(invites);
    });
    return () => { alive = false; };
  }, [courseId]);

  const displayedTeams = showAllTeams ? availableTeams : availableTeams.slice(0, 6);
  const displayedInvites = showAllInvites ? invitations : invitations.slice(0, 3);

  const handleRequestJoin = (team: Team) => {
    requestJoinTeam(courseId ?? '', team.groupId)
      .then(() =>
        setNotification({
          title: 'Gửi yêu cầu thành công',
          message: `Yêu cầu tham gia nhóm "${team.name}" của bạn đã được gửi!`,
        }),
      )
      .catch((err: { message?: string }) =>
        setNotification({ title: 'Lỗi', message: err?.message || 'Không gửi được yêu cầu tham gia.' }),
      );
  };

  const handleAccept = (invite: TeamInvitation) => {
    setInvitations(prev => prev.filter(item => item.id !== invite.id));
    onAcceptInvitation(invite);
  };

  const handleDecline = (invite: TeamInvitation) => {
    setNotification({ 
      title: 'Đã từ chối', 
      message: `Bạn đã từ chối lời mời từ ${invite.name}.` 
    });
    setInvitations(prev => prev.filter(item => item.id !== invite.id));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start w-full animate-fade-in text-left">
      
      <div className="flex-1 bg-surface rounded-2xl shadow-soft border border-border p-6 w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-text">
            <svg className="size-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
            Available Teams
          </h2>
          {availableTeams.length > 6 && (
            <button 
              onClick={() => setShowAllTeams(!showAllTeams)} 
              className="text-indigo-600 text-sm font-medium hover:underline"
            >
              {showAllTeams ? 'Show less' : 'Browse all'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedTeams.map((team) => {
            const slotsLeft = Math.max(0, 5 - team.memberCount)
            return (
            <div key={team.groupId} className="border border-border rounded-xl p-5 flex flex-col h-full hover:border-indigo-300 transition-colors bg-white">
              <div className="mb-3">
                <h3 className="font-bold text-text truncate text-sm">{team.name}</h3>
                <span className="bg-orange-50 text-orange-600 text-[8px] font-extrabold px-1.5 py-0.5 rounded border border-blue-200/60 whitespace-nowrap uppercase tracking-wider">
                  {slotsLeft} {slotsLeft === 1 ? 'SLOT LEFT' : 'SLOTS LEFT'}
                </span>
              </div>

              <p className="text-xs text-text-soft line-clamp-2 mb-4 flex-grow leading-relaxed">
                {team.description}
              </p>

              <div className="flex items-center justify-between gap-4 mt-auto">
                <div className="flex -space-x-2 items-center">
                  {team.members.map((member) => (
                    <Avatar
                      key={member.userId}
                      name={member.name}
                      avatarUrl={member.avatar}
                      sizeClass="size-8"
                      className="border-2 border-white"
                    />
                  ))}
                </div>

                <button
                  onClick={() => handleRequestJoin(team)}
                  className="bg-brand-gradient text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm shrink-0 w-[80px] h-10 flex items-center justify-center text-center"
                >
                  Request to Join
                </button>
              </div>
            </div>
            )
          })}
        </div>
      </div>

      <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
        
        <div className="bg-brand-gradient rounded-card p-6 shadow-md text-surface flex flex-col justify-center min-h-[160px]">
          <h3 className="text-lg font-bold mb-2">Start a New<br/>Project?</h3>
          <p className="text-xs text-blue-50/90 mb-5 leading-relaxed"> Bạn chưa có đội? Tạo một cái ngay bây giờ và bắt đầu cộng tác với các bạn cùng lớp của bạn.</p>
          <button 
            type="button"
            onClick={onCreateTeamClick}
            className="bg-surface text-primary font-bold py-2.5 px-4 rounded-button shadow-sm hover:opacity-90 transition-all text-sm w-full"
          >
            + Tạo Team mới
          </button>
        </div>

        <div className="bg-surface rounded-2xl shadow-soft border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/20">
              <svg className="size-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h3 className="font-bold text-text text-sm">Team Invitations</h3>
          </div>
          
          <div className="mb-4">
            <span className="bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-1 rounded-full border border-primary/20 inline-flex items-center gap-1.5">
              Team Invitations 
              <span className="bg-primary text-white rounded-full px-1.5 py-0.5 text-[9px] font-extrabold">{invitations.length}</span>
            </span>
          </div>

          <div className="space-y-3">
            {displayedInvites.map((invite) => (
              <div key={invite.id} className="bg-white border border-border/80 rounded-xl p-3 flex flex-col gap-3 shadow-sm hover:border-primary/20 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar 
                    name={invite.name}
                    avatarUrl={invite.avatarUrl}
                    sizeClass="size-9"
                    className="border border-border shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-text truncate">{invite.name}</h4>
                    <p className="text-[10px] text-text-soft truncate mt-0.5">
                      {invite.info}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 justify-end pt-2 border-t border-border/50">
                  <button 
                    onClick={() => handleDecline(invite)}
                    className="text-[11px] font-bold text-text-soft hover:text-red-500 px-2.5 py-1 rounded transition-colors"
                  >
                    Decline
                  </button>
                  <button 
                    onClick={() => handleAccept(invite)}
                    className="bg-primary hover:bg-primary/90 text-white text-[11px] font-bold px-3 py-1 rounded-lg shadow-sm transition-all"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>

          {invitations.length > 3 && (
            <button 
              onClick={() => setShowAllInvites(!showAllInvites)}
              className="w-full mt-4 text-center text-[11px] font-bold text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-1"
            >
              {showAllInvites ? 'Hide request history' : 'View full request history'}
              <svg className={`size-3 transform transition-transform ${showAllInvites ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <NotificationModal 
        isOpen={!!notification} 
        title={notification?.title || ''} 
        message={notification?.message || ''} 
        onClose={() => setNotification(null)} 
      />
    </div>
  );
}