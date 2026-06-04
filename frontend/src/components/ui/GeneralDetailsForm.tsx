import { useState } from 'react'
import type { UserDto } from '../../mocks/types'

export default function GeneralDetailsForm({ user }: { user: UserDto }) {
  const nameParts = user.name.split(' ')
  const initialLastName = nameParts.pop() || ''
  const initialFirstName = nameParts.join(' ')

  const [formData, setFormData] = useState({
    firstName: initialFirstName,
    lastName: initialLastName,
    bio: '' 
  })

  const [message, setMessage] = useState({ type: '', text: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: '', text: '' }) 

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ Họ và Tên!' })
      return
    }

    console.log("Dữ liệu gửi đi:", formData)
    setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' })
    
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm">
      <h2 className="text-xl font-bold text-text mb-4">General Details</h2>
      <hr className="border-border mb-6" />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-text-soft mb-1.5">First Name</label>
            <input 
              value={formData.firstName} 
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]/50 focus:border-[#2DD4BF]" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-soft mb-1.5">Last Name</label>
            <input 
              value={formData.lastName} 
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]/50 focus:border-[#2DD4BF]" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-text-soft mb-1.5">Student ID (MSSV)</label>
            <input disabled value={user.uid} className="w-full bg-[#F8F9FE] border border-border rounded-lg px-4 py-2.5 text-sm text-text-soft cursor-not-allowed outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-soft mb-1.5">University Email</label>
            <input disabled value={user.email} className="w-full bg-[#F8F9FE] border border-border rounded-lg px-4 py-2.5 text-sm text-text-soft cursor-not-allowed outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-text-soft mb-1.5">Bio</label>
          <textarea 
            rows={4}
            value={formData.bio} 
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            placeholder="Tell us about yourself..."
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]/50 focus:border-[#2DD4BF] resize-none" 
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
          {message.text && (
            <span className={`text-sm font-medium animate-fade-in ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
              {message.text}
            </span>
          )}
          <button type="submit" className="bg-brand-gradient flex items-center gap-2 rounded-button px-5 py-2.5 text-sm font-semibold text-surface shadow-soft hover:opacity-90 transition-opacity">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}