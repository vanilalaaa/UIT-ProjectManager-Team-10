import { useState } from 'react'

interface PasswordSettingsProps {
  userEmail: string
}

export default function PasswordSettings({ userEmail }: PasswordSettingsProps) {
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' })
  const [isVerificationStep, setIsVerificationStep] = useState(false)
  
  const [verificationCode, setVerificationCode] = useState('')
  const [isVerified, setIsVerified] = useState(false) 
  
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleResetRequest = () => {
    setIsVerificationStep(true)
    setIsVerified(false) 
    setMessage({ type: '', text: '' }) 
  }

  const handleVerifyCode = () => {
    setMessage({ type: '', text: '' })
    
    const isCodeValid = /^\d{6}$/.test(verificationCode.trim())

    if (isCodeValid) {
      setIsVerified(true) 
      setMessage({ type: 'success', text: 'Mã hợp lệ! Mời bạn nhập mật khẩu mới.' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } else {
      setMessage({ type: 'error', text: 'Mã xác thực phải bao gồm 6 chữ số!' })
    }
  }

  const handleUpdatePassword = () => {
    if (!isVerified) return 
    
    setMessage({ type: '', text: '' })
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/
    
    if (!passwordRegex.test(passwords.new)) {
      setMessage({ type: 'error', text: 'Mật khẩu phải >= 8 kí tự, có số, chữ thường, chữ in hoa!' })
      return
    }
    
    if (passwords.new !== passwords.confirm) {
      setMessage({ type: 'error', text: 'Nhập lại mật khẩu không khớp!' })
      return
    }
    
    setMessage({ type: 'success', text: 'Cập nhật mật khẩu thành công!' })
    
    setTimeout(() => {
      setIsVerificationStep(false)
      setIsVerified(false)
      setVerificationCode('')
      setPasswords({ old: '', new: '', confirm: '' })
      setMessage({ type: '', text: '' })
    }, 3000)
  }

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        {!isVerificationStep ? (
          <div className="flex justify-center w-full">
            <button 
              onClick={handleResetRequest}
              className="bg-brand-gradient flex items-center gap-2 rounded-button px-5 py-2.5 text-sm font-semibold text-surface shadow-soft hover:opacity-90 transition-opacity"
            >
              Reset password
            </button>
          </div>
        ) : (
          <div className="animate-fade-in space-y-3">
            <label className="block text-xs font-bold text-text mb-2">Nhập code từ email</label>
            <div className="flex gap-3">
              <input 
                type="text" 
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Nhập mã 6 chữ số"
                disabled={isVerified} 
                className={`flex-1 min-w-0 border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2DD4BF]/50 outline-none ${isVerified ? 'bg-gray-100' : ''}`}
              />
              <button 
                onClick={handleVerifyCode}
                disabled={isVerified}
                className="bg-brand-gradient flex items-center gap-2 rounded-button px-5 py-2.5 text-sm font-semibold text-surface shadow-soft hover:opacity-90 transition-opacity"
              >
                Xác nhận
              </button>
            </div>
            
            {!isVerified && !message.text && (
              <p className="text-sm font-medium text-green-500 mt-2">
                Đã gửi mã xác thực tới: {userEmail}
              </p>
            )}
            {message.text && !isVerified && (
              <p className={`text-sm font-medium mt-2 ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                {message.text}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <h3 className="text-base font-bold text-text mb-3">Reset password</h3>
        
        <div className="space-y-4">
          <input 
            type="password" 
            placeholder="Mật khẩu mới" 
            value={passwords.new}
            disabled={!isVerified} 
            onChange={(e) => setPasswords({...passwords, new: e.target.value})}
            className={`w-full border border-border rounded-lg px-4 py-2.5 text-sm outline-none ${!isVerified ? 'bg-[#F8F9FE] cursor-not-allowed opacity-60' : 'focus:ring-2 focus:ring-[#2DD4BF]/50'}`}
          />
          <input 
            type="password" 
            placeholder="Nhập lại mật khẩu" 
            value={passwords.confirm}
            disabled={!isVerified}
            onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
            className={`w-full border border-border rounded-lg px-4 py-2.5 text-sm outline-none ${!isVerified ? 'bg-[#F8F9FE] cursor-not-allowed opacity-60' : 'focus:ring-2 focus:ring-[#2DD4BF]/50'}`}
          />
          
          {message.text && isVerified && (
            <p className={`text-sm font-medium ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
              {message.text}
            </p>
          )}

          <button 
            onClick={handleUpdatePassword}
            disabled={!isVerified} 
            className="bg-brand-gradient flex items-center gap-2 rounded-button px-5 py-2.5 text-sm font-semibold text-surface shadow-soft hover:opacity-90 transition-opacity"
          >
            Cập nhật mật khẩu
          </button>
        </div>
      </div>
    </div>
  )
}