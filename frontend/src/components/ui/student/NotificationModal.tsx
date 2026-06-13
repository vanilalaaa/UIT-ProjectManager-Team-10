interface NotificationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function NotificationModal({ isOpen, title, message, onClose }: NotificationModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-2xl p-6 shadow-2xl w-full max-w-sm border border-border animate-in fade-in zoom-in duration-200">
        <h3 className="text-lg font-bold text-text mb-2">{title}</h3>
        <p className="text-sm text-text-soft mb-6">{message}</p>
        <button 
          onClick={onClose}
          className="w-full bg-brand-gradient text-white font-bold py-2.5 rounded-xl shadow-md hover:opacity-90 hover:shadow-lg active:scale-95 transition-all"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}