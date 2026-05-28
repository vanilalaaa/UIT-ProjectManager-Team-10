export default function InviteListModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  const invitations = [
    { id: 1, teamName: 'Nhóm 06 - Galaxy', sender: 'Nguyễn Văn A' },
    { id: 2, teamName: 'Nhóm 09 - Nebula', sender: 'Trần Thị B' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-surface p-6 rounded-2xl w-full max-w-md shadow-xl">
        <h3 className="text-lg font-bold mb-4">Lời mời tham gia nhóm</h3>
        <div className="space-y-3">
          {invitations.map(inv => (
            <div key={inv.id} className="p-3 border border-border rounded-xl flex justify-between items-center">
              <div>
                <p className="font-bold">{inv.teamName}</p>
                <p className="text-xs text-text-soft">Leader: {inv.sender}</p>
              </div>
              <button className="text-xs font-bold bg-primary text-surface px-3 py-1 rounded">Accept</button>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-6 w-full py-2 text-sm text-text-soft">Đóng</button>
      </div>
    </div>
  );
}