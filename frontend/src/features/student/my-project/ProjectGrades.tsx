import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import OverallGradeCard from '../../../components/ui/OverallGradeCard'
import ScorecardBreakdown, { type ScoreCriteria } from '../../../components/ui/ScorecardBreakdown'
import LecturerFeedbackCard from '../../../components/ui/LecturerFeedbackCard'
import type { Project } from '../../../mocks/types'
import { mockProjects } from '../../../mocks/projects.mock'

const fetchGradeData = async (projectId: string | undefined) => {
  const project = mockProjects.find(p => p.projectId.toString() === projectId)
  
  return new Promise<{ project: Project | null, criteria: ScoreCriteria[], feedback: any }>(resolve => {
    setTimeout(() => {
      resolve({
        project: project || null,
        criteria: [],
        feedback: null
      })
    }, 500)
  })
}

export default function ProjectGrades() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState<{ project: Project | null, criteria: ScoreCriteria[], feedback: any } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    fetchGradeData(projectId).then(result => {
      if (isMounted) {
        setData(result)
        setLoading(false)
      }
    })
    return () => { isMounted = false }
  }, [projectId])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center text-text-soft border-2 border-dashed border-border rounded-2xl bg-surface-soft/30 min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <svg className="size-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="font-medium text-sm">Đang tải kết quả đánh giá...</p>
        </div>
      </div>
    )
  }

  if (!data?.project) return <div className="p-8 text-center text-text-soft">Không tìm thấy thông tin đồ án.</div>

  const { project, criteria, feedback } = data

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="text-xs font-semibold text-text-soft hover:text-primary flex items-center gap-1.5 mb-4 transition-colors"
        >
          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Projects
        </button>
        
        <h1 className="text-3xl font-bold text-text mb-4">{project.title}</h1>
        
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="bg-surface-soft text-text px-3 py-1.5 rounded-full border border-border">
            {project.course?.name}
          </span>
          <span className="text-text-soft flex items-center gap-1.5">
            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Kết thúc: {project.endDate}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        <div className="md:col-span-5 lg:col-span-4">
          <OverallGradeCard grade={null} maxGrade={10} status="Chưa chấm" />
        </div>
        <div className="md:col-span-7 lg:col-span-8">
          <ScorecardBreakdown criteria={criteria} />
        </div>
      </div>

      <LecturerFeedbackCard lecturer={feedback?.lecturer || null}>
        {feedback ? (
          <div dangerouslySetInnerHTML={{ __html: feedback.content }} />
        ) : (
          <div className="text-center py-10">
            <svg className="size-12 mx-auto text-text-soft/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <p className="font-medium text-text">Chưa có nhận xét</p>
            <p className="text-sm">Giảng viên chưa cập nhật nhận xét cho đồ án này.</p>
          </div>
        )}
      </LecturerFeedbackCard>
    </div>
  )
}