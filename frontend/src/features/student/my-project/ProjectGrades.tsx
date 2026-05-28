import React from 'react'
import OverallGradeCard from '../../../components/ui/OverallGradeCard'
import ScorecardBreakdown, { type ScoreCriteria } from '../../../components/ui/ScorecardBreakdown'
import LecturerFeedbackCard from '../../../components/ui/LecturerFeedbackCard'

export default function ProjectGrades() {
  const mockCriteria: ScoreCriteria[] = [
    { label: 'UI/UX Design', score: 9.0, maxScore: 10, colorClass: 'text-green-600', bgFillClass: 'bg-green-500' },
    { label: 'Backend Architecture', score: 7.5, maxScore: 10, colorClass: 'text-amber-600', bgFillClass: 'bg-amber-500' },
    { label: 'Documentation & Testing', score: 9.0, maxScore: 10, colorClass: 'text-green-600', bgFillClass: 'bg-green-500' },
  ]

  const mockLecturer = {
    name: 'Prof. Eleanor Smith',
    department: 'Department of Computer Science',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop'
  }

  return (
    <div className="max-w-5xl mx-auto pb-10">
      
      <div className="mb-8">
        <button className="text-xs font-semibold text-text-soft hover:text-text flex items-center gap-1.5 mb-4 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Projects
        </button>
        
        <h1 className="text-3xl font-bold text-text mb-4">Sustainable City Planning Capstone</h1>
        
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="bg-[#F1F5F9] text-text-soft px-3 py-1.5 rounded-full border border-border">
            Final Submission
          </span>
          <span className="text-text-soft flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Submitted: Oct 24, 2023
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        <div className="md:col-span-5 lg:col-span-4">
          <OverallGradeCard grade={8.5} maxGrade={10} status="Distinction" />
        </div>
        <div className="md:col-span-7 lg:col-span-8">
          <ScorecardBreakdown criteria={mockCriteria} />
        </div>
      </div>

      <LecturerFeedbackCard lecturer={mockLecturer}>
        <p>
          Excellent work overall on the capstone project. The team has demonstrated a strong grasp of sustainable city planning concepts and successfully integrated them into a functional digital prototype.
        </p>
        
        <div>
          <h4 className="font-bold text-text text-base border-b border-border pb-2 mb-3">UI/UX Design (9.0/10)</h4>
          <p>
            The interface is exceptionally clean and intuitive. The use of a fixed-fluid hybrid layout maps perfectly to the user needs for this application. I particularly appreciated the layered card-based UI, which makes navigating complex data sets feel manageable and organized. The pastel labeling system adds a nice approachable touch without sacrificing professionalism.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-text text-base border-b border-border pb-2 mb-3">Backend Architecture (7.5/10)</h4>
          <p>
            While the frontend is polished, the backend architecture shows some strain under simulated load. The database schema is generally well-structured, but requires indexing optimization for spatial queries.
          </p>
        </div>
      </LecturerFeedbackCard>

    </div>
  )
}