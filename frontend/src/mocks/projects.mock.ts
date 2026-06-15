  import type { Category, Course, Project, User } from './types'
  import * as MockData from './tasks.mock'

  export const lecturerTranMinhKhoa: User = {
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

  export const lecturerPhamThuHang: User = {
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

  export const lecturerNguyenVanDuc: User = {
    userId: 103,
    uid: 'GV000103',
    email: 'duc.nguyen@uit.edu.vn',
    password: null,
    name: 'TS. Nguyễn Văn Đức',
    role: 'ADMIN',
    createdAt: '2025-08-22T08:00:00',
    updatedAt: '2026-02-05T10:00:00',
    isActive: true,
    verificationToken: null,
    verificationTokenExpiry: null,
    resetPasswordToken: null,
    resetPasswordTokenExpiry: null,
    userProfile: {
      userId: 103,
      summary: 'Giảng viên phụ trách học phần Phát triển ứng dụng web.',
      firstName: 'Đức',
      lastName: 'Nguyễn Văn',
      avatarUrl: '/avatars/lecturer-nguyen-van-duc.png',
      phoneNumber: '0901000103',
      birthday: '1985-11-03',
    },
  }

  export const lecturerLeThiBichNgoc: User = {
    userId: 104,
    uid: 'GV000104',
    email: 'ngoc.le@uit.edu.vn',
    password: null,
    name: 'ThS. Lê Thị Bích Ngọc',
    role: 'ADMIN',
    createdAt: '2025-08-25T08:00:00',
    updatedAt: '2026-02-07T11:00:00',
    isActive: true,
    verificationToken: null,
    verificationTokenExpiry: null,
    resetPasswordToken: null,
    resetPasswordTokenExpiry: null,
    userProfile: {
      userId: 104,
      summary: 'Giảng viên phụ trách Phát triển ứng dụng di động và Thị giác máy tính.',
      firstName: 'Ngọc',
      lastName: 'Lê Thị Bích',
      avatarUrl: '/avatars/lecturer-le-thi-bich-ngoc.png',
      phoneNumber: '0901000104',
      birthday: '1988-06-17',
    },
  }

  export const softwareEngineeringCourse: Course = {
    courseId: 1,
    name: 'SE330 - Công nghệ phần mềm',
    lecturer: lecturerTranMinhKhoa,
    maxStudents: 120,
    startDate: '2026-02-10',
    endDate: '2026-06-30',
    groups: [MockData.groupPhoenix, MockData.groupAster],
    projects: [],
  }

  export const projectManagementCourse: Course = {
    courseId: 2,
    name: 'PM301 - Quản lý dự án phần mềm',
    lecturer: lecturerPhamThuHang,
    maxStudents: 90,
    startDate: '2026-03-01',
    endDate: '2026-07-15',
    groups: [MockData.groupNimbus, MockData.groupOrion],
    projects: [],
  }

  export const webDevCourse: Course = {
    courseId: 3,
    name: 'IS207 - Phát triển ứng dụng web',
    lecturer: lecturerNguyenVanDuc,
    maxStudents: 100,
    startDate: '2026-02-15',
    endDate: '2026-06-20',
    groups: [MockData.groupTitan, MockData.groupComet],
    projects: [],
  }

  export const mobileDevCourse: Course = {
    courseId: 4,
    name: 'NT118 - Phát triển ứng dụng di động',
    lecturer: lecturerLeThiBichNgoc,
    maxStudents: 80,
    startDate: '2026-02-20',
    endDate: '2026-06-25',
    groups: [MockData.groupLuna],
    projects: [],
  }

  export const machineLearningCourse: Course = {
    courseId: 5,
    name: 'CS117 - Thị giác máy tính',
    lecturer: lecturerLeThiBichNgoc,
    maxStudents: 70,
    startDate: '2026-03-05',
    endDate: '2026-07-10',
    groups: [MockData.groupVega],
    projects: [],
  }

  export const webCategory: Category = {
    categoryId: 1,
    name: 'Ứng dụng Web',
    description: 'Đồ án tập trung vào giao diện web, API và quản lý dữ liệu.',
    isActive: true,
  }

  export const mobileCategory: Category = {
    categoryId: 2,
    name: 'Ứng dụng di động',
    description: 'Đồ án xây dựng trải nghiệm trên thiết bị di động.',
    isActive: true,
  }

  export const aiCategory: Category = {
    categoryId: 3,
    name: 'Trí tuệ nhân tạo',
    description: 'Đồ án ứng dụng máy học, thị giác máy tính và xử lý ngôn ngữ.',
    isActive: true,
  }

  export const dataCategory: Category = {
    categoryId: 4,
    name: 'Dữ liệu lớn',
    description: 'Đồ án xử lý, phân tích và trực quan hóa dữ liệu quy mô lớn.',
    isActive: true,
  }

  export const mockProjects: Project[] = [
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
          groupMember: MockData.userSinhVienTran,
          registeredAt: '2026-03-02',
          approvedAt: '2026-03-04',
          status: 'APPROVED',
          note: 'Nhóm đã chốt phạm vi MVP với giảng viên.',
        },
        {
          groupId: 1,
          project: null,
          groupMember: MockData.userNguyenMinhAn, 
          registeredAt: '2026-03-02',
          approvedAt: '2026-03-04',
          status: 'APPROVED',
          note: 'Nhóm đã chốt phạm vi MVP với giảng viên.',
        },
        {
          groupId: 1,
          project: null,
          groupMember: MockData.userLeHoangVy,    
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
          groupMember: MockData.userNguyenThuyDuong,
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
          groupMember: MockData.userTranGiaBao,
          registeredAt: '2026-01-16',
          approvedAt: '2026-01-18',
          status: 'APPROVED',
          note: 'Đã hoàn tất nghiệm thu cuối kỳ.',
        },
        {
          groupId: 3,
          project: null,
          groupMember: MockData.userBuiNhatTruong,
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
          groupMember: MockData.userPhamQuynhNhu,
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
      title: 'Sàn thương mại điện tử mini',
      description:
        'Xây dựng website bán hàng với danh mục sản phẩm, giỏ hàng, thanh toán giả lập và trang quản trị đơn hàng.',
      status: 'IN_PROGRESS',
      startDate: '2026-03-10',
      endDate: '2026-06-18',
      course: webDevCourse,
      category: webCategory,
      registrations: [
        {
          groupId: 5,
          project: null,
          groupMember: MockData.userDoanKhanhLinh,
          registeredAt: '2026-03-11',
          approvedAt: '2026-03-13',
          status: 'APPROVED',
          note: 'Nhóm đã chốt danh sách tính năng cho MVP.',
        },
        {
          groupId: 5,
          project: null,
          groupMember: MockData.userPhanThiMai,
          registeredAt: '2026-03-11',
          approvedAt: '2026-03-13',
          status: 'APPROVED',
          note: 'Phụ trách giao diện người dùng.',
        },
        {
          groupId: 5,
          project: null,
          groupMember: MockData.userHuynhTanPhat,
          registeredAt: '2026-03-11',
          approvedAt: '2026-03-13',
          status: 'APPROVED',
          note: 'Phụ trách backend và API.',
        },
      ],
      submissions: [
        {
          submissionId: 5,
          submittedAt: '2026-05-15T21:00:00',
          status: 'SUBMITTED',
          filePath: '/submissions/is207-titan/midterm-demo.zip',
          project: null,
          group: null,
          grade: null,
        },
      ],
    },
    {
      projectId: 6,
      title: 'Blog cá nhân hỗ trợ Markdown',
      description:
        'Trang blog cho phép viết bài bằng Markdown, quản lý chuyên mục, bình luận và tối ưu SEO.',
      status: 'IN_PROGRESS',
      startDate: '2026-03-12',
      endDate: '2026-06-18',
      course: webDevCourse,
      category: webCategory,
      registrations: [
        {
          groupId: 6,
          project: null,
          groupMember: MockData.userVuMinhHieu,
          registeredAt: '2026-03-13',
          approvedAt: '2026-03-15',
          status: 'APPROVED',
          note: 'Nhóm 2 người, tập trung trải nghiệm viết bài.',
        },
        {
          groupId: 6,
          project: null,
          groupMember: MockData.userLyGiaHan,
          registeredAt: '2026-03-13',
          approvedAt: '2026-03-15',
          status: 'APPROVED',
          note: 'Phụ trách nội dung và trực quan hóa.',
        },
      ],
      submissions: [],
    },
    {
      projectId: 7,
      title: 'Ứng dụng ghi chú đồng bộ đám mây',
      description:
        'Ứng dụng di động ghi chú với phân loại theo nhãn, tìm kiếm và đồng bộ thời gian thực qua Firebase.',
      status: 'IN_PROGRESS',
      startDate: '2026-03-15',
      endDate: '2026-06-22',
      course: mobileDevCourse,
      category: mobileCategory,
      registrations: [
        {
          groupId: 7,
          project: null,
          groupMember: MockData.userTranThanhTung,
          registeredAt: '2026-03-16',
          approvedAt: '2026-03-18',
          status: 'APPROVED',
          note: 'Trưởng nhóm, phụ trách đồng bộ dữ liệu.',
        },
        {
          groupId: 7,
          project: null,
          groupMember: MockData.userDangThuyTrang,
          registeredAt: '2026-03-16',
          approvedAt: '2026-03-18',
          status: 'APPROVED',
          note: 'Phụ trách giao diện và tài liệu.',
        },
        {
          groupId: 7,
          project: null,
          groupMember: MockData.userNguyenMinhAn,
          registeredAt: '2026-03-16',
          approvedAt: '2026-03-18',
          status: 'APPROVED',
          note: 'Hỗ trợ kiểm thử trên nhiều thiết bị.',
        },
      ],
      submissions: [
        {
          submissionId: 7,
          submittedAt: '2026-05-20T19:30:00',
          status: 'REVIEWED',
          filePath: '/submissions/nt118-luna/build-v1.apk',
          project: null,
          group: null,
          grade: null,
        },
      ],
    },
    {
      projectId: 8,
      title: 'Nhận diện biển báo giao thông',
      description:
        'Huấn luyện mô hình CNN nhận diện biển báo giao thông từ ảnh, đánh giá độ chính xác và xây dựng demo dự đoán.',
      status: 'IN_PROGRESS',
      startDate: '2026-03-20',
      endDate: '2026-07-05',
      course: machineLearningCourse,
      category: aiCategory,
      registrations: [
        {
          groupId: 8,
          project: null,
          groupMember: MockData.userNgoQuangHuy,
          registeredAt: '2026-03-21',
          approvedAt: '2026-03-23',
          status: 'APPROVED',
          note: 'Trưởng nhóm, phụ trách kiến trúc mô hình.',
        },
        {
          groupId: 8,
          project: null,
          groupMember: MockData.userHoangPhuQuy,
          registeredAt: '2026-03-21',
          approvedAt: '2026-03-23',
          status: 'APPROVED',
          note: 'Phụ trách tiền xử lý và huấn luyện.',
        },
        {
          groupId: 8,
          project: null,
          groupMember: MockData.userLyGiaHan,
          registeredAt: '2026-03-21',
          approvedAt: '2026-03-23',
          status: 'APPROVED',
          note: 'Phụ trách đánh giá và trực quan hóa kết quả.',
        },
      ],
      submissions: [],
    },
    {
      projectId: 9,
      title: 'Hệ thống phân tích log thương mại điện tử',
      description:
        'Đường ống dữ liệu thu thập log người dùng, xử lý theo thời gian thực và dựng dashboard phân tích hành vi.',
      status: 'PLANNING',
      startDate: '2026-06-05',
      endDate: '2026-08-20',
      course: machineLearningCourse,
      category: dataCategory,
      registrations: [
        {
          groupId: 8,
          project: null,
          groupMember: MockData.userHoangPhuQuy,
          registeredAt: '2026-05-30',
          approvedAt: null,
          status: 'PENDING',
          note: 'Đề tài mở rộng, đang chờ giảng viên duyệt phạm vi.',
        },
      ],
      submissions: [],
    },
  ]

  export interface ProjectApprovalRequest {
  requestId: number;
  title: string;
  description: string;
  groupName: string;
  leader: User;
  members: User[];
  maxMembers: number;
  submittedAt: string;
}

export const mockProjectRequests: ProjectApprovalRequest[] = [
  {
    requestId: 1,
    title: 'Hệ thống Data Engineering cho E-commerce',
    description: 'Xây dựng đường ống dữ liệu (Data Pipeline) thu thập log real-time từ các nền tảng thương mại điện tử, xử lý qua Kafka và lưu trữ vào Data Lake phục vụ phân tích chuyên sâu hành vi người dùng.',
    groupName: 'Nhóm 06 - BigData',
    leader: MockData.userHoangPhuQuy, 
    members: [MockData.userHoangPhuQuy, MockData.userLeHoangVy, MockData.userNguyenMinhAn], 
    maxMembers: 5, // Quy định tối đa 5 người (Sẽ hiển thị 3/5)
    submittedAt: '2026-06-08T14:20:00',
  },
  {
    requestId: 2,
    title: 'Ứng dụng Portfolio tương tác 3D',
    description: 'Thiết kế website cá nhân và giới thiệu sản phẩm nghệ thuật chất lượng cao sử dụng Three.js để tăng tính tương tác sinh động, tối ưu hiệu năng render trên các thiết bị di động.',
    groupName: 'Nhóm 08 - Creative',
    leader: MockData.userLeViSa,
    members: [MockData.userLeViSa, MockData.userTranGiaBao],
    maxMembers: 4,
    submittedAt: '2026-06-09T09:15:00',
  },
  {
    requestId: 3,
    title: 'Hệ thống đặt món ăn trực tuyến',
    description: 'Xây dựng nền tảng đặt món với giỏ hàng, theo dõi đơn hàng theo thời gian thực và tích hợp bản đồ giao hàng cho các quán ăn quanh khu vực trường.',
    groupName: 'Nhóm 03 - Titan',
    leader: MockData.userDoanKhanhLinh,
    members: [MockData.userDoanKhanhLinh, MockData.userPhanThiMai, MockData.userHuynhTanPhat],
    maxMembers: 5,
    submittedAt: '2026-06-10T10:30:00',
  },
  {
    requestId: 4,
    title: 'Ứng dụng học từ vựng theo lịch lặp lại',
    description: 'Ứng dụng di động giúp học từ vựng tiếng Anh theo thuật toán spaced repetition, có thống kê tiến độ và nhắc nhở ôn tập hằng ngày.',
    groupName: 'Nhóm 04 - Luna',
    leader: MockData.userTranThanhTung,
    members: [MockData.userTranThanhTung, MockData.userDangThuyTrang],
    maxMembers: 4,
    submittedAt: '2026-06-11T08:45:00',
  },
  {
    requestId: 5,
    title: 'Chatbot tư vấn tuyển sinh',
    description: 'Xây dựng chatbot trả lời câu hỏi tuyển sinh dựa trên kho dữ liệu của trường, sử dụng mô hình ngôn ngữ và tìm kiếm ngữ nghĩa.',
    groupName: 'Nhóm 05 - Vega',
    leader: MockData.userNgoQuangHuy,
    members: [MockData.userNgoQuangHuy, MockData.userHoangPhuQuy, MockData.userLyGiaHan],
    maxMembers: 5,
    submittedAt: '2026-06-12T14:00:00',
  }
]