interface GeneralDetailsFormProps {
  user: {
    firstName: string
    lastName: string
    studentId: string
    email: string
    major: string
    className: string
    bio: string
  }
}

export default function GeneralDetailsForm({ user }: GeneralDetailsFormProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm">
      <h2 className="text-xl font-bold text-text mb-4">General Details</h2>
      <hr className="border-border mb-6" />

      <form className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-text-soft mb-1.5">First Name</label>
            <input 
              type="text" 
              defaultValue={user.firstName}
              className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]/50 focus:border-[#2DD4BF]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-soft mb-1.5">Last Name</label>
            <input 
              type="text" 
              defaultValue={user.lastName}
              className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]/50 focus:border-[#2DD4BF]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-text-soft mb-1.5">Student ID (MSSV)</label>
            <input 
              type="text" 
              defaultValue={user.studentId}
              readOnly
              className="w-full bg-[#F8F9FE] border border-border rounded-lg px-4 py-2.5 text-sm text-text-soft focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-soft mb-1.5">University Email</label>
            <input 
              type="email" 
              defaultValue={user.email}
              readOnly
              className="w-full bg-[#F8F9FE] border border-border rounded-lg px-4 py-2.5 text-sm text-text-soft focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-text-soft mb-1.5">Major</label>
            <input 
              type="text" 
              defaultValue={user.major}
              className="w-full bg-[#F8F9FE] border border-border rounded-lg px-4 py-2.5 text-sm text-text-soft focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-soft mb-1.5">Class</label>
            <input 
              type="text" 
              defaultValue={user.className}
              className="w-full bg-[#F8F9FE] border border-border rounded-lg px-4 py-2.5 text-sm text-text-soft focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-text-soft mb-1.5">Bio</label>
          <textarea 
            rows={4}
            defaultValue={user.bio}
            className="w-full bg-[#F8F9FE] border border-border rounded-lg px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]/50 focus:border-[#2DD4BF] resize-none"
          ></textarea>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <button type="button" className="text-sm font-semibold text-text-soft hover:text-text px-4 py-2 transition-colors">
            Cancel
          </button>
          <button type="submit" className="bg-[#2DD4BF] hover:bg-[#14B8A6] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}