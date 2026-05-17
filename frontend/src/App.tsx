import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'

const overviewCards = [
  { label: 'Đồ án đang chạy', value: '3', note: '2 đồ án cần cập nhật tiến độ' },
  { label: 'Công việc tuần này', value: '10', note: '4 task sắp đến hạn' },
  { label: 'Môn học', value: '3', note: 'SE330 đang hoạt động' },
]

function DashboardPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-text-soft">Tổng quan</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-normal text-text">
          Quản lý đồ án môn học
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {overviewCards.map((card) => (
          <article
            className="rounded-card border border-border bg-surface p-4 shadow-soft"
            key={card.label}
          >
            <p className="text-sm text-text-soft">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-primary">{card.value}</p>
            <p className="mt-2 text-sm text-text-soft">{card.note}</p>
          </article>
        ))}
      </div>

      <section className="rounded-card border border-border bg-surface p-5 shadow-soft">
        <p className="text-sm font-semibold uppercase text-text-soft">Hoạt động gần đây</p>
        <div className="mt-4 space-y-3">
          <p className="text-sm text-text">Nhóm Phoenix đã hoàn thiện luồng đăng nhập mock.</p>
          <p className="text-sm text-text">Nhóm Aster đang review prototype màn hình quét QR.</p>
          <p className="text-sm text-text">Dashboard tiến độ cần bổ sung bộ lọc theo lớp.</p>
        </div>
      </section>
    </section>
  )
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="rounded-card border border-border bg-surface p-5 shadow-soft">
      <p className="text-sm font-semibold uppercase text-text-soft">Workspace</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-normal text-text">{title}</h2>
    </section>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />} path="/">
          <Route index element={<DashboardPage />} />
          <Route element={<PlaceholderPage title="Đồ án" />} path="projects" />
          <Route element={<PlaceholderPage title="Chi tiết đồ án" />} path="projects/:projectId" />
          <Route element={<PlaceholderPage title="Tạo đồ án mới" />} path="projects/new" />
          <Route element={<PlaceholderPage title="Công việc" />} path="tasks" />
          <Route element={<PlaceholderPage title="Môn học" />} path="courses" />
          <Route element={<PlaceholderPage title="Chi tiết môn học" />} path="courses/:courseId" />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
