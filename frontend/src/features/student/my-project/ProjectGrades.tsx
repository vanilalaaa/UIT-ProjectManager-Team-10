import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import OverallGradeCard from '../../../components/ui/OverallGradeCard'
import ScorecardBreakdown, { type ScoreCriteria } from '../../../components/ui/student/ScorecardBreakdown'
import LecturerFeedbackCard from '../../../components/ui/student/LecturerFeedbackCard'

const MAX_GRADE = 10

type GradeLecturer = { name: string; avatar: string; department: string }

type GradeData = {
  grade: number | null
  criteria: ScoreCriteria[]
  lecturer: GradeLecturer | null
  feedback: string
}

// Mock: BE chấm điểm chưa nối (GET /api/projects/:id/grades/me). Đa số đồ án
// chưa có điểm nên trả về trạng thái "chưa chấm".
const fetchStudentGrade = (projectId: string | undefined): Promise<GradeData> =>
  new Promise(resolve => {
    setTimeout(() => {
      void projectId
      resolve({ grade: null, criteria: [], lecturer: null, feedback: '' })
    }, 400)
  })

export default function ProjectGrades() {
  const { projectId } = useParams<{ projectId: string }>()
  const [data, setData] = useState<GradeData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchStudentGrade(projectId).then(result => {
      if (!mounted) return
      setData(result)
      setLoading(false)
    })
    return () => {
      mounted = false
    }
  }, [projectId])

  if (loading) return <LoadingSpinner message="Đang tải kết quả đánh giá..." />
  if (!data) return null

  const isGraded = data.grade !== null
  const status = isGraded ? 'Đã chấm' : 'Chưa chấm'

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
        <div className="xl:col-span-1">
          <OverallGradeCard grade={data.grade} maxGrade={MAX_GRADE} status={status} />
        </div>
        <div className="xl:col-span-2">
          <ScorecardBreakdown criteria={data.criteria} />
        </div>
      </div>

      <LecturerFeedbackCard lecturer={data.lecturer}>
        {data.feedback ? (
          <p className="whitespace-pre-line">{data.feedback}</p>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg className="size-10 text-text-soft/40 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="font-medium text-text">Chưa có nhận xét</p>
            <p className="text-sm mt-1">Giảng viên chưa cập nhật nhận xét cho đồ án này.</p>
          </div>
        )}
      </LecturerFeedbackCard>
    </div>
  )
}
