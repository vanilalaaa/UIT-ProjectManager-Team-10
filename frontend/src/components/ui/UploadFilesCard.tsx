import React from 'react'

interface UploadFilesCardProps {
  onSubmit: () => void
}

export default function UploadFilesCard({ onSubmit }: UploadFilesCardProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
      <h2 className="text-base font-bold text-text mb-4">Upload Files</h2>
      
      <div className="border-2 border-dashed border-indigo-200 bg-[#F8F9FE] rounded-xl p-10 flex flex-col items-center justify-center text-center transition-colors hover:bg-indigo-50/50 cursor-pointer">
        <svg className="w-12 h-12 text-indigo-600 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
        </svg>
        
        <h3 className="font-bold text-text text-lg mb-1">Drag and drop files here</h3>
        <p className="text-text-soft text-sm mb-4">or click to browse from your computer</p>
        
        <span className="px-3 py-1 bg-gray-200 text-gray-600 font-bold text-[10px] rounded-full uppercase">
          PDF, DOCX, ZIP (Max 50MB)
        </span>
      </div>

      <div className="mt-6 flex justify-end">
        <button 
          onClick={onSubmit}
          className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-teal-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
          Submit Work
        </button>
      </div>
    </div>
  )
}