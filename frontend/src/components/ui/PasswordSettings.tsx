import React from 'react'

export default function PasswordSettings() {
  return (
    <div className="space-y-6">
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        <button className="bg-[#2DD4BF] hover:bg-[#14B8A6] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors mb-5">
          Reset password
        </button>
        
        <div>
          <label className="block text-xs font-bold text-text mb-2">Nhập code từ email</label>
          <input 
            type="text" 
            placeholder="****************"
            disabled
            className="w-full bg-[#E2E8F0]/50 border border-transparent rounded-lg px-4 py-2.5 text-sm text-text-soft cursor-not-allowed"
          />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-text mb-3">Reset password</h3>
        <hr className="border-border mb-5" />
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text mb-2">Nhập mật khẩu mới</label>
            <input 
              type="password" 
              placeholder="****************"
              disabled
              className="w-full bg-[#E2E8F0]/50 border border-transparent rounded-lg px-4 py-2.5 text-sm text-text-soft cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text mb-2">Nhập lại mật khẩu mới</label>
            <input 
              type="password" 
              placeholder="****************"
              disabled
              className="w-full bg-[#E2E8F0]/50 border border-transparent rounded-lg px-4 py-2.5 text-sm text-text-soft cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    </div>
  )
}