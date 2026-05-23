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
 *           ... nested pages with NestedTabLayout wrappers
 */
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AuthProvider } from './features/auth/AuthContext'
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './components/common/ProtectedRoute'

// ── Auth pages ────────────────────────────────────────────────────────────────
import LoginPage from './features/auth/LoginPage'
import ForbiddenPage from './features/auth/ForbiddenPage'

// ── Shared ────────────────────────────────────────────────────────────────────
import HomePage from './features/home/HomePage'

// ── Student — my-project ──────────────────────────────────────────────────────
import MyProjectPage from './features/student/my-project/MyProjectPage'
import ProjectLayout from './features/student/my-project/ProjectLayout'
import ProjectOverview from './features/student/my-project/ProjectOverview'
import ProjectMembers from './features/student/my-project/ProjectMembers'
import ProjectKanban from './features/student/my-project/ProjectKanban'
import ProjectSubmit from './features/student/my-project/ProjectSubmit'
import ProjectGrades from './features/student/my-project/ProjectGrades'

// ── Student — my-course ───────────────────────────────────────────────────────
import MyCoursePage from './features/student/my-course/MyCoursePage'
import StudentCourseLayout from './features/student/my-course/StudentCourseLayout'
import StudentProjectList from './features/student/my-course/StudentProjectList'
import StudentProjectDetail from './features/student/my-course/StudentProjectDetail'
import MyTeamPage from './features/student/my-course/MyTeamPage'
import CourseMembers from './features/student/my-course/CourseMembers'

// ── Teacher — my-course ───────────────────────────────────────────────────────
import TeacherCoursePage from './features/teacher/my-course/TeacherCoursePage'
import TeacherCourseLayout from './features/teacher/my-course/TeacherCourseLayout'
import TeacherProjectList from './features/teacher/my-course/TeacherProjectList'
import TeacherProjectDetail from './features/teacher/my-course/TeacherProjectDetail'
import TeamProjects from './features/teacher/my-course/TeamProjects'
import TeamSubmit from './features/teacher/my-course/TeamSubmit'
import TeamGrades from './features/teacher/my-course/TeamGrades'
import CourseTeams from './features/teacher/my-course/CourseTeams'
import TeacherCourseMembers from './features/teacher/my-course/TeacherCourseMembers'

// ── Admin ─────────────────────────────────────────────────────────────────────
import ManageUsersPage from './features/admin/ManageUsersPage'
import ManageCategoriesPage from './features/admin/ManageCategoriesPage'
import ManageCoursesPage from './features/admin/ManageCoursesPage'

// ─────────────────────────────────────────────────────────────────────────────

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public ──────────────────────────────────────────────────────── */}
          <Route element={<LoginPage />} path="/login" />
          <Route element={<ForbiddenPage />} path="/403" />

          {/* ── All authenticated roles — Home (/) ──────────────────────────── */}
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
               * /my-project            → list
               * /my-project/:projectId → tab layout (ProjectLayout)
               *   overview | members | kanban | submit | grades
               */}
              <Route path="my-project">
                <Route element={<MyProjectPage />} index />

                {/* ProjectLayout renders the mini-navbar + <Outlet /> */}
                <Route element={<ProjectLayout />} path=":projectId">
                  <Route element={<Navigate replace to="overview" />} index />
                  <Route element={<ProjectOverview />} path="overview" />
                  <Route element={<ProjectMembers />} path="members" />
                  <Route element={<ProjectKanban />} path="kanban" />
                  <Route element={<ProjectSubmit />} path="submit" />
                  <Route element={<ProjectGrades />} path="grades" />
                </Route>
              </Route>

              {/*
               * /my-course             → list
               * /my-course/:courseId   → tab layout (StudentCourseLayout)
               *   project-list | my-team | members
               *   project-list/:projectId → detail (outside tabs, full-page)
               */}
              <Route path="my-course">
                <Route element={<MyCoursePage />} index />

                <Route path=":courseId">
                  {/* Default: redirect to first tab */}
                  <Route element={<Navigate replace to="project-list" />} index />

                  {/* Tab layout wraps the three tabbed sections */}
                  <Route element={<StudentCourseLayout />}>
                    <Route element={<StudentProjectList />} path="project-list" />
                    <Route element={<MyTeamPage />} path="my-team" />
                    <Route element={<CourseMembers />} path="members" />
                  </Route>

                  {/* Project detail lives outside the tab bar (full content area) */}
                  <Route element={<StudentProjectDetail />} path="project-list/:projectId" />
                </Route>
              </Route>

            </Route>
          </Route>

          {/* ── TEACHER routes — prefixed /teacher to avoid collision with STUDENT /my-course */}
          <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
            <Route element={<MainLayout />} path="/teacher">

              {/*
               * /teacher/my-course                                        → list
               * /teacher/my-course/:courseId                              → tab layout
               *   project-list | teams | members
               *   project-list/:projectId → detail + team-projects tabs
               */}
              <Route path="my-course">
                <Route element={<TeacherCoursePage />} index />

                <Route path=":courseId">
                  <Route element={<Navigate replace to="project-list" />} index />

                  {/* Tab layout for course-level tabs */}
                  <Route element={<TeacherCourseLayout />}>
                    <Route element={<TeacherProjectList />} path="project-list" />
                    <Route element={<CourseTeams />} path="teams" />
                    <Route element={<TeacherCourseMembers />} path="members" />
                  </Route>

                  {/* Project detail outside tab bar — full content area */}
                  <Route path="project-list/:projectId">
                    <Route element={<TeacherProjectDetail />} index />
                    <Route element={<TeamProjects />} path="team-projects" />
                    <Route element={<TeamSubmit />} path="team-projects/submit" />
                    <Route element={<TeamGrades />} path="team-projects/grades" />
                  </Route>
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
