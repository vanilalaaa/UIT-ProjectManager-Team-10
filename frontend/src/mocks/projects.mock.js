const lecturerTranMinhKhoa = {
  userId: 101,
  uid: 'GV000101',
  email: 'khoa.tran@uit.edu.vn',
  password: null,
  name: 'TS. Trần Minh Khoa',
  role: 'ADMIN',
  createdAt: '2025-08-15T08:00:00',
  updatedAt: '2026-02-01T09:30:00',
  isActive: true,
  verificationToken: null,
  verificationTokenExpiry: null,
  resetPasswordToken: null,
  resetPasswordTokenExpiry: null,
  userProfile: {
    userId: 101,
    summary: 'Giảng viên phụ trách môn Công nghệ phần mềm.',
    firstName: 'Khoa',
    lastName: 'Trần Minh',
    avatarUrl: '/avatars/lecturer-tran-minh-khoa.png',
    phoneNumber: '0901000101',
    birthday: '1984-04-12',
  },
}

const lecturerPhamThuHang = {
  userId: 102,
  uid: 'GV000102',
  email: 'hang.pham@uit.edu.vn',
  password: null,
  name: 'ThS. Phạm Thu Hằng',
  role: 'ADMIN',
  createdAt: '2025-08-20T08:00:00',
  updatedAt: '2026-02-03T10:15:00',
  isActive: true,
  verificationToken: null,
  verificationTokenExpiry: null,
  resetPasswordToken: null,
  resetPasswordTokenExpiry: null,
  userProfile: {
    userId: 102,
    summary: 'Giảng viên phụ trách học phần Quản lý dự án.',
    firstName: 'Hằng',
    lastName: 'Phạm Thu',
    avatarUrl: '/avatars/lecturer-pham-thu-hang.png',
    phoneNumber: '0901000102',
    birthday: '1987-09-21',
  },
}

const softwareEngineeringCourse = {
  courseId: 1,
  name: 'SE330 - Công nghệ phần mềm',
  lecturer: lecturerTranMinhKhoa,
  maxStudents: 120,
  startDate: '2026-02-10',
  endDate: '2026-06-30',
  groups: [],
  projects: [],
}

const projectManagementCourse = {
  courseId: 2,
  name: 'PM301 - Quản lý dự án phần mềm',
  lecturer: lecturerPhamThuHang,
  maxStudents: 90,
  startDate: '2026-03-01',
  endDate: '2026-07-15',
  groups: [],
  projects: [],
}

const webCategory = {
  categoryId: 1,
  name: 'Ứng dụng Web',
  description: 'Đồ án tập trung vào giao diện web, API và quản lý dữ liệu.',
  isActive: true,
}

const mobileCategory = {
  categoryId: 2,
  name: 'Ứng dụng di động',
  description: 'Đồ án xây dựng trải nghiệm trên thiết bị di động.',
  isActive: true,
}

const analyticsCategory = {
  categoryId: 3,
  name: 'Phân tích dữ liệu',
  description: 'Đồ án khai thác dữ liệu tiến độ, điểm số và báo cáo.',
  isActive: true,
}

export const mockProjects = [
  {
    projectId: 1,
    title: 'Website quản lý đồ án môn SE330',
    description:
      'Xây dựng hệ thống quản lý đề tài, nhóm sinh viên, task và tiến độ nộp bài cho lớp Công nghệ phần mềm.',
    status: 'IN_PROGRESS',
    startDate: '2026-03-01',
    endDate: '2026-06-15',
    course: softwareEngineeringCourse,
    category: webCategory,
    registrations: [
      {
        groupId: 1,
        project: null,
        groupMember: null,
        registeredAt: '2026-03-02',
        approvedAt: '2026-03-04',
        status: 'APPROVED',
        note: 'Nhóm đã chốt phạm vi MVP với giảng viên.',
      },
    ],
    submissions: [
      {
        submissionId: 1,
        submittedAt: '2026-04-20T22:10:00',
        status: 'REVIEWED',
        filePath: '/submissions/se330-nhom-01/srs-v1.pdf',
        project: null,
        group: null,
        grade: null,
      },
    ],
  },
  {
    projectId: 2,
    title: 'Ứng dụng điểm danh lớp học bằng QR',
    description:
      'Thiết kế ứng dụng giúp giảng viên tạo phiên điểm danh, sinh viên quét mã QR và theo dõi lịch sử tham gia lớp.',
    status: 'IN_PROGRESS',
    startDate: '2026-04-01',
    endDate: '2026-05-30',
    course: softwareEngineeringCourse,
    category: mobileCategory,
    registrations: [
      {
        groupId: 2,
        project: null,
        groupMember: null,
        registeredAt: '2026-04-02',
        approvedAt: '2026-04-03',
        status: 'APPROVED',
        note: 'Ưu tiên hoàn thiện luồng quét QR trước tuần báo cáo giữa kỳ.',
      },
    ],
    submissions: [
      {
        submissionId: 2,
        submittedAt: '2026-05-05T20:45:00',
        status: 'SUBMITTED',
        filePath: '/submissions/se330-nhom-02/prototype-demo.mp4',
        project: null,
        group: null,
        grade: null,
      },
    ],
  },
  {
    projectId: 3,
    title: 'Hệ thống đăng ký đề tài môn học',
    description:
      'Cho phép sinh viên đăng ký đề tài, giảng viên duyệt nhóm và xuất danh sách phân công theo lớp.',
    status: 'COMPLETED',
    startDate: '2026-01-15',
    endDate: '2026-04-20',
    course: projectManagementCourse,
    category: webCategory,
    registrations: [
      {
        groupId: 3,
        project: null,
        groupMember: null,
        registeredAt: '2026-01-16',
        approvedAt: '2026-01-18',
        status: 'APPROVED',
        note: 'Đã hoàn tất nghiệm thu cuối kỳ.',
      },
    ],
    submissions: [
      {
        submissionId: 3,
        submittedAt: '2026-04-18T23:30:00',
        status: 'GRADED',
        filePath: '/submissions/pm301-nhom-03/final-report.pdf',
        project: null,
        group: null,
        grade: null,
      },
    ],
  },
  {
    projectId: 4,
    title: 'Nền tảng nhắc lịch nộp bài nhóm',
    description:
      'Tạo lịch nhắc tự động cho deadline, phân công người phụ trách và cảnh báo task có nguy cơ trễ hạn.',
    status: 'PLANNING',
    startDate: '2026-06-01',
    endDate: '2026-08-15',
    course: projectManagementCourse,
    category: webCategory,
    registrations: [
      {
        groupId: 4,
        project: null,
        groupMember: null,
        registeredAt: '2026-05-16',
        approvedAt: null,
        status: 'PENDING',
        note: 'Đang chờ giảng viên phản hồi phạm vi đề tài.',
      },
    ],
    submissions: [],
  },
  {
    projectId: 5,
    title: 'Dashboard đánh giá tiến độ đồ án',
    description:
      'Tổng hợp task, tỷ lệ hoàn thành, số lần nộp bài và cảnh báo rủi ro để giảng viên theo dõi từng nhóm.',
    status: 'OVERDUE',
    startDate: '2026-02-01',
    endDate: '2026-05-10',
    course: softwareEngineeringCourse,
    category: analyticsCategory,
    registrations: [
      {
        groupId: 5,
        project: null,
        groupMember: null,
        registeredAt: '2026-02-03',
        approvedAt: '2026-02-05',
        status: 'APPROVED',
        note: 'Cần bổ sung biểu đồ tiến độ và bộ lọc theo lớp.',
      },
    ],
    submissions: [
      {
        submissionId: 4,
        submittedAt: '2026-05-09T21:00:00',
        status: 'NEEDS_REVISION',
        filePath: '/submissions/se330-nhom-05/progress-dashboard.zip',
        project: null,
        group: null,
        grade: null,
      },
    ],
  },
]
