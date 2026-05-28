import React from 'react'
import DueDateCard from '../../../components/ui/DueDateCard'
import UploadFilesCard from '../../../components/ui/UploadFilesCard'
import ProjectStatusCard from '../../../components/ui/ProjectStatusCard'
import PreviousVersionsCard, { type Version } from '../../../components/ui/PreviousVersionsCard'

export default function ProjectSubmit() {
  const mockVersions: Version[] = [
    { id: 2, title: 'Version 2 (Draft)', date: 'Nov 10, 2:30 PM', file: 'thesis_draft_v2.pdf (2.4 MB)', isDraft: true },
    { id: 1, title: 'Version 1 (Initial)', date: 'Nov 05, 9:15 AM', file: 'thesis_outline_v1.docx (1.1 MB)', isDraft: false },
  ]

  const handleSubmit = () => {
    console.log('Submit clicked!')
  }

  return (
    <div className="max-w-7xl mx-auto">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">Submission</h1>
        <p className="text-text-soft text-sm max-w-2xl">
          Upload your finalized documents for review. Ensure all required files are included before final submission.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <div className="lg:col-span-8 space-y-6">
          <DueDateCard 
            dueDate="Nov 15, 2026, 11:59 PM" 
            timeRemaining="3d 5h 22m" 
          />
          <UploadFilesCard onSubmit={handleSubmit} />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <ProjectStatusCard status="In Progress" />
          <PreviousVersionsCard versions={mockVersions} />
        </div>
        
      </div>
    </div>
  )
}