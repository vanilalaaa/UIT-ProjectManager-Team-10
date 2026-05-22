/**
 * App.tsx — Root routing configuration.
 *
 * Structure:
 *   <AuthProvider>          — global auth state
 *     <BrowserRouter>
 *       /login              — public
 *       /403                — public
 *       <ProtectedRoute>    — per-role guards
 *         <MainLayout>
 *           ... nested pages
 */
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AuthProvider } from './features/auth/AuthContext'
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './components/common/ProtectedRoute'

// ── Auth pages ────────────────────────────────────────────────────────────────
import LoginPage from './features/auth/LoginPage'
import ForbiddenPage from './features/auth/ForbiddenPage'

// ── Shared ─────────────────────────────────────────────────────────────────────
import HomePage from './features/home/HomePage'

// ── Student pages ─────────────────────────────────────────────────────────────
import MyProjectPage from './features/student/my-project/MyProjectPage'
import ProjectOverview from './features/student/my-project/ProjectOverview'
import ProjectMembers from './features/student/my-project/ProjectMembers'
import ProjectKanban from './features/student/my-project/ProjectKanban'
import ProjectSubmit from './features/student/my-project/ProjectSubmit'
import ProjectGrades from './features/student/my-project/ProjectGrades'

import MyCoursePage from './features/student/my-course/MyCoursePage'
import StudentProjectList from './features/student/my-course/StudentProjectList'
import StudentProjectDetail from './features/student/my-course/StudentProjectDetail'
import MyTeamPage from './features/student/my-course/MyTeamPage'
import CourseMembers from './features/student/my-course/CourseMembers'

// ── Teacher pages ─────────────────────────────────────────────────────────────
import TeacherCoursePage from './features/teacher/my-course/TeacherCoursePage'
import TeacherProjectList from './features/teacher/my-course/TeacherProjectList'
import TeacherProjectDetail from './features/teacher/my-course/TeacherProjectDetail'
import TeamProjects from './features/teacher/my-course/TeamProjects'
import TeamSubmit from './features/teacher/my-course/TeamSubmit'
import TeamGrades from './features/teacher/my-course/TeamGrades'
import CourseTeams from './features/teacher/my-course/CourseTeams'
import TeacherCourseMembers from './features/teacher/my-course/TeacherCourseMembers'

// ── Admin pages ───────────────────────────────────────────────────────────────
import ManageUsersPage from './features/admin/ManageUsersPage'
import ManageCategoriesPage from './features/admin/ManageCategoriesPage'
import ManageCoursesPage from './features/admin/ManageCoursesPage'

// ─────────────────────────────────────────────────────────────────────────────

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public ─────────────────────────────────────────────────────── */}
          <Route element={<LoginPage />} path="/login" />
          <Route element={<ForbiddenPage />} path="/403" />

          {/* ── All authenticated roles — Home (/) ─────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER', 'STUDENT']} />}>
            <Route element={<MainLayout />} path="/">
              <Route element={<HomePage />} index />
              <Route element={<Navigate replace to="/" />} path="profile" />
            </Route>
          </Route>

          {/* ── STUDENT routes ──────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route element={<MainLayout />}>
              {/*
               * /my-project           → list of enrolled projects
               * /my-project/:projectId → nested project detail tabs
               */}
              <Route path="my-project">
                <Route element={<MyProjectPage />} index />
                <Route path=":projectId">
                  {/* Default tab: overview */}
                  <Route element={<Navigate replace to="overview" />} index />
                  <Route element={<ProjectOverview />} path="overview" />
                  <Route element={<ProjectMembers />} path="members" />
                  <Route element={<ProjectKanban />} path="kanban" />
                  <Route element={<ProjectSubmit />} path="submit" />
                  <Route element={<ProjectGrades />} path="grades" />
                </Route>
              </Route>

              {/*
               * /my-course            → list of enrolled courses
               * /my-course/:courseId  → nested course tabs
               */}
              <Route path="my-course">
                <Route element={<MyCoursePage />} index />
                <Route path=":courseId">
                  <Route element={<Navigate replace to="project-list" />} index />
                  <Route element={<StudentProjectList />} path="project-list" />
                  <Route element={<StudentProjectDetail />} path="project-list/:projectId" />
                  <Route element={<MyTeamPage />} path="my-team" />
                  <Route element={<CourseMembers />} path="members" />
                </Route>
              </Route>
            </Route>
          </Route>

          {/* ── TEACHER routes ──────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
            <Route element={<MainLayout />}>
              {/*
               * /my-course                                      → course list
               * /my-course/:courseId/project-list               → project list
               * /my-course/:courseId/project-list/:projectId    → project detail
               *   └── /team-projects                            → team project listing
               *       /team-projects/submit                     → team submission
               *       /team-projects/grades                     → grading
               * /my-course/:courseId/teams                      → all teams
               * /my-course/:courseId/members                    → course members
               */}
              <Route path="my-course">
                <Route element={<TeacherCoursePage />} index />
                <Route path=":courseId">
                  <Route element={<Navigate replace to="project-list" />} index />
                  <Route path="project-list">
                    <Route element={<TeacherProjectList />} index />
                    <Route path=":projectId">
                      <Route element={<TeacherProjectDetail />} index />
                      <Route element={<TeamProjects />} path="team-projects" />
                      <Route element={<TeamSubmit />} path="team-projects/submit" />
                      <Route element={<TeamGrades />} path="team-projects/grades" />
                    </Route>
                  </Route>
                  <Route element={<CourseTeams />} path="teams" />
                  <Route element={<TeacherCourseMembers />} path="members" />
                </Route>
              </Route>
            </Route>
          </Route>

          {/* ── ADMIN routes ────────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route element={<MainLayout />} path="/admin">
              <Route element={<Navigate replace to="users" />} index />
              <Route element={<ManageUsersPage />} path="users" />
              <Route element={<ManageCategoriesPage />} path="categories" />
              <Route element={<ManageCoursesPage />} path="courses" />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
