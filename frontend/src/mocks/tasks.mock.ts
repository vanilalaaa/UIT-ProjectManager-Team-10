import type { Course, Group, Task, User } from './types'

export const userSinhVienTran: User = {
  userId: 1,
  uid: 'SV22520001',
  email: 'student@gmail.com', 
  password: null,
  name: 'Sinh viên Trần',
  role: 'STUDENT',
  createdAt: '2026-02-10T08:00:00',
  updatedAt: null,
  isActive: true,
  verificationToken: null,
  verificationTokenExpiry: null,
  resetPasswordToken: null,
  resetPasswordTokenExpiry: null,
  userProfile: {
    userId: 1,
    summary: 'Sinh viên thực hiện đồ án.',
    firstName: 'Trần',
    lastName: 'Sinh viên',
    avatarUrl: '',
    phoneNumber: '0901234567',
    birthday: '2004-01-01',
  },
}

export const userLeHoangVy: User = {
  userId: 2,
  uid: 'SV22520002',
  email: '22520002@gm.uit.edu.vn',
  password: null,
  name: 'Lê Hoàng Vy',
  role: 'STUDENT',
  createdAt: '2026-02-10T08:15:00',
  updatedAt: '2026-05-15T18:20:00',
  isActive: true,
  verificationToken: null,
  verificationTokenExpiry: null,
  resetPasswordToken: null,
  resetPasswordTokenExpiry: null,
  userProfile: {
    userId: 2,
    summary: 'Backend developer phụ trách Spring Boot và cơ sở dữ liệu.',
    firstName: 'Vy',
    lastName: 'Lê Hoàng', 
    avatarUrl: '',
    phoneNumber: '0902000002',
    birthday: '2004-10-02',
  },
}

export const userTranGiaBao: User = {
  userId: 3,
  uid: 'SV22520003',
  email: '22520003@gm.uit.edu.vn',
  password: null,
  name: 'Trần Gia Bảo',
  role: 'STUDENT',
  createdAt: '2026-02-11T09:00:00',
  updatedAt: '2026-05-14T19:05:00',
  isActive: true,
  verificationToken: null,
  verificationTokenExpiry: null,
  resetPasswordToken: null,
  resetPasswordTokenExpiry: null,
  userProfile: {
    userId: 3,
    summary: 'QA và tài liệu, theo dõi test case và báo cáo tiến độ.',
    firstName: 'Bảo',
    lastName: 'Trần Gia',
    avatarUrl: '',
    phoneNumber: '0902000003',
    birthday: '2004-03-18',
  },
}

export const userPhamQuynhNhu: User = {
  userId: 4,
  uid: 'SV22520004',
  email: '22520004@gm.uit.edu.vn',
  password: null,
  name: 'Phạm Quỳnh Như',
  role: 'STUDENT',
  createdAt: '2026-02-12T09:30:00',
  updatedAt: '2026-05-13T22:00:00',
  isActive: true,
  verificationToken: null,
  verificationTokenExpiry: null,
  resetPasswordToken: null,
  resetPasswordTokenExpiry: null,
  userProfile: {
    userId: 4,
    summary: 'Phân tích nghiệp vụ và thiết kế luồng người dùng.',
    firstName: 'Như',
    lastName: 'Phạm Quỳnh',
    avatarUrl: '',
    phoneNumber: '0902000004',
    birthday: '2004-12-27',
  },
}

export const userNguyenThuyDuong: User = {
  userId: 5,
  uid: 'SV22520005',
  email: '22520005@gm.uit.edu.vn',
  password: null,
  name: 'Nguyễn Thùy Dương',
  role: 'STUDENT',
  createdAt: '2026-02-12T10:00:00',
  updatedAt: '2026-05-13T22:00:00',
  isActive: true,
  verificationToken: null,
  verificationTokenExpiry: null,
  resetPasswordToken: null,
  resetPasswordTokenExpiry: null,
  userProfile: {
    userId: 5,
    summary: 'AI Specialization và xử lý ngôn ngữ tự nhiên.',
    firstName: 'Dương',
    lastName: 'Nguyễn Thùy',
    avatarUrl: '',
    phoneNumber: '0902000005',
    birthday: '2004-08-14',
  },
}

export const userHoangPhuQuy: User = {
  userId: 6,
  uid: 'SV22520006',
  email: '22520006@gm.uit.edu.vn',
  password: null,
  name: 'Hoàng Phú Quý',
  role: 'STUDENT',
  createdAt: '2026-02-12T10:15:00',
  updatedAt: '2026-05-13T22:00:00',
  isActive: true,
  verificationToken: null,
  verificationTokenExpiry: null,
  resetPasswordToken: null,
  resetPasswordTokenExpiry: null,
  userProfile: {
    userId: 6,
    summary: 'Data Engineering, tối ưu hóa câu lệnh SQL và Big Data.',
    firstName: 'Quý',
    lastName: 'Hoàng Phú',
    avatarUrl: '',
    phoneNumber: '0902000006',
    birthday: '2004-01-22',
  },
}

export const userBuiNhatTruong: User = {
  userId: 7,
  uid: 'SV22520007',
  email: '22520007@gm.uit.edu.vn',
  password: null,
  name: 'Bùi Nhật Trường',
  role: 'STUDENT',
  createdAt: '2026-02-12T10:30:00',
  updatedAt: '2026-05-13T22:00:00',
  isActive: true,
  verificationToken: null,
  verificationTokenExpiry: null,
  resetPasswordToken: null,
  resetPasswordTokenExpiry: null,
  userProfile: {
    userId: 7,
    summary: 'BSc Computer Science • Year 2. Đam mê Cloud Computing.',
    firstName: 'Trường',
    lastName: 'Bùi Nhật',
    avatarUrl: '',
    phoneNumber: '0902000007',
    birthday: '2004-09-05',
  },
}

export const userLeViSa: User = {
  userId: 8,
  uid: 'SV22520008',
  email: '22520008@gm.uit.edu.vn',
  password: null,
  name: 'Lê Vi Sa',
  role: 'STUDENT',
  createdAt: '2026-02-12T10:45:00',
  updatedAt: '2026-05-13T22:00:00',
  isActive: true,
  verificationToken: null,
  verificationTokenExpiry: null,
  resetPasswordToken: null,
  resetPasswordTokenExpiry: null,
  userProfile: {
    userId: 8,
    summary: 'UI/UX Design Minor. Chuyên thiết kế wireframe và prototype.',
    firstName: 'Sa',
    lastName: 'Lê Vi',
    avatarUrl: '',
    phoneNumber: '0902000008',
    birthday: '2004-11-30',
  },
}

export const userNguyenMinhAn: User = {
  userId: 9,
  uid: 'SV22520009',
  email: '22520001@gm.uit.edu.vn',
  password: null,
  name: 'Nguyễn Minh An',
  role: 'STUDENT',
  createdAt: '2026-02-10T08:00:00',
  updatedAt: '2026-05-16T21:30:00',
  isActive: true,
  verificationToken: null,
  verificationTokenExpiry: null,
  resetPasswordToken: null,
  resetPasswordTokenExpiry: null,
  userProfile: {
    userId: 1,
    summary: 'Frontend developer phụ trách React và trải nghiệm người dùng.',
    firstName: 'An',
    lastName: 'Nguyễn Minh',
    avatarUrl: '',
    phoneNumber: '0902000001',
    birthday: '2004-05-12',
  },
}

export const userDoanKhanhLinh: User = {
  userId: 10,
  uid: 'SV22520010',
  email: '22520010@gm.uit.edu.vn',
  password: null,
  name: 'Đoàn Khánh Linh',
  role: 'STUDENT',
  createdAt: '2026-02-13T08:00:00',
  updatedAt: '2026-05-18T20:00:00',
  isActive: true,
  verificationToken: null,
  verificationTokenExpiry: null,
  resetPasswordToken: null,
  resetPasswordTokenExpiry: null,
  userProfile: {
    userId: 10,
    summary: 'Fullstack developer, yêu thích React và Spring Boot.',
    firstName: 'Linh',
    lastName: 'Đoàn Khánh',
    avatarUrl: '',
    phoneNumber: '0902000010',
    birthday: '2004-02-19',
  },
}

export const userVuMinhHieu: User = {
  userId: 11,
  uid: 'SV22520011',
  email: '22520011@gm.uit.edu.vn',
  password: null,
  name: 'Vũ Minh Hiếu',
  role: 'STUDENT',
  createdAt: '2026-02-13T08:30:00',
  updatedAt: '2026-05-18T21:00:00',
  isActive: true,
  verificationToken: null,
  verificationTokenExpiry: null,
  resetPasswordToken: null,
  resetPasswordTokenExpiry: null,
  userProfile: {
    userId: 11,
    summary: 'DevOps & hạ tầng, quan tâm CI/CD và Docker.',
    firstName: 'Hiếu',
    lastName: 'Vũ Minh',
    avatarUrl: '',
    phoneNumber: '0902000011',
    birthday: '2004-06-08',
  },
}

export const userTranThanhTung: User = {
  userId: 12,
  uid: 'SV22520012',
  email: '22520012@gm.uit.edu.vn',
  password: null,
  name: 'Trần Thanh Tùng',
  role: 'STUDENT',
  createdAt: '2026-02-13T09:00:00',
  updatedAt: '2026-05-19T08:00:00',
  isActive: true,
  verificationToken: null,
  verificationTokenExpiry: null,
  resetPasswordToken: null,
  resetPasswordTokenExpiry: null,
  userProfile: {
    userId: 12,
    summary: 'Mobile developer, chuyên Flutter và React Native.',
    firstName: 'Tùng',
    lastName: 'Trần Thanh',
    avatarUrl: '',
    phoneNumber: '0902000012',
    birthday: '2004-07-23',
  },
}

export const userLyGiaHan: User = {
  userId: 13,
  uid: 'SV22520013',
  email: '22520013@gm.uit.edu.vn',
  password: null,
  name: 'Lý Gia Hân',
  role: 'STUDENT',
  createdAt: '2026-02-13T09:30:00',
  updatedAt: '2026-05-19T09:00:00',
  isActive: true,
  verificationToken: null,
  verificationTokenExpiry: null,
  resetPasswordToken: null,
  resetPasswordTokenExpiry: null,
  userProfile: {
    userId: 13,
    summary: 'Data analyst, mạnh về trực quan hóa dữ liệu.',
    firstName: 'Hân',
    lastName: 'Lý Gia',
    avatarUrl: '',
    phoneNumber: '0902000013',
    birthday: '2004-09-11',
  },
}

export const userPhanThiMai: User = {
  userId: 14,
  uid: 'SV22520014',
  email: '22520014@gm.uit.edu.vn',
  password: null,
  name: 'Phan Thị Mai',
  role: 'STUDENT',
  createdAt: '2026-02-13T10:00:00',
  updatedAt: '2026-05-19T10:00:00',
  isActive: true,
  verificationToken: null,
  verificationTokenExpiry: null,
  resetPasswordToken: null,
  resetPasswordTokenExpiry: null,
  userProfile: {
    userId: 14,
    summary: 'Frontend developer, chú trọng accessibility và responsive.',
    firstName: 'Mai',
    lastName: 'Phan Thị',
    avatarUrl: '',
    phoneNumber: '0902000014',
    birthday: '2004-03-02',
  },
}

export const userNgoQuangHuy: User = {
  userId: 15,
  uid: 'SV22520015',
  email: '22520015@gm.uit.edu.vn',
  password: null,
  name: 'Ngô Quang Huy',
  role: 'STUDENT',
  createdAt: '2026-02-13T10:30:00',
  updatedAt: '2026-05-19T11:00:00',
  isActive: true,
  verificationToken: null,
  verificationTokenExpiry: null,
  resetPasswordToken: null,
  resetPasswordTokenExpiry: null,
  userProfile: {
    userId: 15,
    summary: 'ML engineer, nghiên cứu thị giác máy tính.',
    firstName: 'Huy',
    lastName: 'Ngô Quang',
    avatarUrl: '',
    phoneNumber: '0902000015',
    birthday: '2004-12-15',
  },
}

export const userDangThuyTrang: User = {
  userId: 16,
  uid: 'SV22520016',
  email: '22520016@gm.uit.edu.vn',
  password: null,
  name: 'Đặng Thùy Trang',
  role: 'STUDENT',
  createdAt: '2026-02-13T11:00:00',
  updatedAt: '2026-05-19T12:00:00',
  isActive: true,
  verificationToken: null,
  verificationTokenExpiry: null,
  resetPasswordToken: null,
  resetPasswordTokenExpiry: null,
  userProfile: {
    userId: 16,
    summary: 'Scrum master tập sự, quản lý tiến độ và tài liệu nhóm.',
    firstName: 'Trang',
    lastName: 'Đặng Thùy',
    avatarUrl: '',
    phoneNumber: '0902000016',
    birthday: '2004-04-27',
  },
}

export const userHuynhTanPhat: User = {
  userId: 17,
  uid: 'SV22520017',
  email: '22520017@gm.uit.edu.vn',
  password: null,
  name: 'Huỳnh Tấn Phát',
  role: 'STUDENT',
  createdAt: '2026-02-13T11:30:00',
  updatedAt: '2026-05-19T13:00:00',
  isActive: true,
  verificationToken: null,
  verificationTokenExpiry: null,
  resetPasswordToken: null,
  resetPasswordTokenExpiry: null,
  userProfile: {
    userId: 17,
    summary: 'Backend developer, quan tâm bảo mật và tối ưu API.',
    firstName: 'Phát',
    lastName: 'Huỳnh Tấn',
    avatarUrl: '',
    phoneNumber: '0902000017',
    birthday: '2004-08-30',
  },
}

export const softwareEngineeringCourse: Course = {
  courseId: 1,
  name: 'SE330 - Công nghệ phần mềm',
  lecturer: null,
  maxStudents: 120,
  startDate: '2026-02-10',
  endDate: '2026-06-30',
  groups: [],
  projects: [],
}

export const projectManagementCourse: Course = {
  courseId: 2,
  name: 'PM301 - Quản lý dự án phần mềm',
  lecturer: null,
  maxStudents: 90,
  startDate: '2026-03-01',
  endDate: '2026-07-15',
  groups: [],
  projects: [],
}

export const webDevCourse: Course = {
  courseId: 3,
  name: 'IS207 - Phát triển ứng dụng web',
  lecturer: null,
  maxStudents: 100,
  startDate: '2026-02-15',
  endDate: '2026-06-20',
  groups: [],
  projects: [],
}

export const mobileDevCourse: Course = {
  courseId: 4,
  name: 'NT118 - Phát triển ứng dụng di động',
  lecturer: null,
  maxStudents: 80,
  startDate: '2026-02-20',
  endDate: '2026-06-25',
  groups: [],
  projects: [],
}

export const machineLearningCourse: Course = {
  courseId: 5,
  name: 'CS117 - Thị giác máy tính',
  lecturer: null,
  maxStudents: 70,
  startDate: '2026-03-05',
  endDate: '2026-07-10',
  groups: [],
  projects: [],
}

export const groupPhoenix: Group = {
  groupId: 1,
  name: 'Nhóm 01 - Phoenix',
  description: 'Nhóm thực hiện đồ án Website quản lý đồ án môn SE330.',
  course: softwareEngineeringCourse,
  leader: userSinhVienTran,
  members: [userSinhVienTran, userNguyenMinhAn, userLeHoangVy], 
  tasks: [],
}

export const groupAster: Group = {
  groupId: 2,
  name: 'Nhóm 02 - Aster',
  description: 'Nhóm thực hiện ứng dụng điểm danh lớp học bằng QR.',
  course: softwareEngineeringCourse,
  leader: userNguyenThuyDuong,
  members: [userNguyenThuyDuong], 
  tasks: [],
}

export const groupNimbus: Group = {
  groupId: 3,
  name: 'Nhóm 03 - Nimbus',
  description: 'Nhóm thực hiện hệ thống đăng ký đề tài môn học.',
  course: projectManagementCourse,
  leader: userTranGiaBao,
  members: [userTranGiaBao, userBuiNhatTruong], 
  tasks: [],
}

export const groupOrion: Group = {
  groupId: 4,
  name: 'Nhóm 04 - Orion',
  description: 'Nhóm chuẩn bị nền tảng nhắc lịch nộp bài nhóm.',
  course: projectManagementCourse,
  leader: userPhamQuynhNhu,
  members: [userPhamQuynhNhu],
  tasks: [],
}

export const groupTitan: Group = {
  groupId: 5,
  name: 'Nhóm 01 - Titan',
  description: 'Nhóm phát triển sàn thương mại điện tử mini cho môn IS207.',
  course: webDevCourse,
  leader: userDoanKhanhLinh,
  members: [userDoanKhanhLinh, userPhanThiMai, userHuynhTanPhat],
  tasks: [],
}

export const groupComet: Group = {
  groupId: 6,
  name: 'Nhóm 02 - Comet',
  description: 'Nhóm xây dựng blog cá nhân hỗ trợ Markdown cho môn IS207.',
  course: webDevCourse,
  leader: userVuMinhHieu,
  members: [userVuMinhHieu, userLyGiaHan],
  tasks: [],
}

export const groupLuna: Group = {
  groupId: 7,
  name: 'Nhóm 01 - Luna',
  description: 'Nhóm phát triển ứng dụng ghi chú đồng bộ đám mây cho môn NT118.',
  course: mobileDevCourse,
  leader: userTranThanhTung,
  members: [userTranThanhTung, userDangThuyTrang, userNguyenMinhAn],
  tasks: [],
}

export const groupVega: Group = {
  groupId: 8,
  name: 'Nhóm 01 - Vega',
  description: 'Nhóm xây dựng mô hình nhận diện biển báo giao thông cho môn CS117.',
  course: machineLearningCourse,
  leader: userNgoQuangHuy,
  members: [userNgoQuangHuy, userHoangPhuQuy, userLyGiaHan],
  tasks: [],
}

export const mockClassMembers: User[] = [
  userSinhVienTran,
  userLeHoangVy,
  userTranGiaBao,
  userPhamQuynhNhu,
  userNguyenThuyDuong,
  userHoangPhuQuy,
  userBuiNhatTruong,
  userLeViSa,
  userNguyenMinhAn
]

export const mockTasks: Task[] = [
  {
    taskId: 1,
    title: 'Hoàn thiện luồng đăng nhập mock',
    description: 'Kết nối màn hình đăng nhập với service mock và hiển thị thông tin người dùng hiện tại.',
    assignedTo: userSinhVienTran, 
    createdBy: userSinhVienTran,
    status: 'DONE', 
    group: groupPhoenix,
    deadline: '2026-05-12T23:59:00',
    createdAt: '2026-05-01T09:00:00',
    updatedAt: '2026-05-12T21:10:00',
  },
  {
    taskId: 2,
    title: 'Hoàn thiện luồng đăng nhập mock',
    description: 'Kết nối màn hình đăng nhập với service mock và hiển thị thông tin người dùng hiện tại.',
    assignedTo: userNguyenMinhAn,
    createdBy: userSinhVienTran,
    status: 'DONE',
    group: groupPhoenix,
    deadline: '2026-05-12T23:59:00',
    createdAt: '2026-05-01T09:00:00',
    updatedAt: '2026-05-12T21:10:00',
  },
  {
    taskId: 3,
    title: 'Thiết kế API danh sách đồ án',
    description: 'Đối chiếu Project.java để thống nhất field trả về cho frontend.',
    assignedTo: userLeHoangVy,
    createdBy: userSinhVienTran,
    status: 'IN_PROGRESS',
    group: groupPhoenix,
    deadline: '2026-05-20T18:00:00',
    createdAt: '2026-05-03T10:30:00',
    updatedAt: '2026-05-17T09:45:00',
  },
  {
    taskId: 4,
    title: 'Viết test case quản lý task',
    description: 'Chuẩn bị test case cho tạo task, đổi trạng thái và lọc task theo nhóm.',
    assignedTo: userLeHoangVy,
    createdBy: userSinhVienTran,
    status: 'TODO',
    group: groupPhoenix,
    deadline: '2026-05-24T20:00:00',
    createdAt: '2026-05-05T14:00:00',
    updatedAt: '2026-05-05T14:00:00',
  },
  {
    taskId: 5,
    title: 'Tạo prototype màn hình quét QR',
    description: 'Dựng giao diện camera, trạng thái quét thành công và lỗi mã hết hạn.',
    assignedTo: userNguyenThuyDuong,
    createdBy: userNguyenThuyDuong,
    status: 'REVIEW',
    group: groupAster,
    deadline: '2026-05-19T17:30:00',
    createdAt: '2026-05-04T08:30:00',
    updatedAt: '2026-05-16T16:45:00',
  },
  {
    taskId: 6,
    title: 'Tổng hợp báo cáo nghiệm thu',
    description: 'Hoàn thiện tài liệu cuối kỳ và danh sách chức năng đã bàn giao.',
    assignedTo: userTranGiaBao,
    createdBy: userTranGiaBao,
    status: 'DONE',
    group: groupNimbus,
    deadline: '2026-04-18T23:59:00',
    createdAt: '2026-04-01T13:00:00',
    updatedAt: '2026-04-18T23:20:00',
  },
  {
    taskId: 7,
    title: 'Khóa danh sách nhóm đăng ký đề tài',
    description: 'Đối chiếu dữ liệu đăng ký và xuất file danh sách nhóm đã được duyệt.',
    assignedTo: userBuiNhatTruong,
    createdBy: userTranGiaBao,
    status: 'DONE',
    group: groupNimbus,
    deadline: '2026-04-12T18:00:00',
    createdAt: '2026-03-25T09:45:00',
    updatedAt: '2026-04-12T17:10:00',
  },
  {
    taskId: 8,
    title: 'Phân tích yêu cầu nhắc deadline',
    description: 'Ghi nhận các loại deadline, tần suất nhắc và vai trò nhận thông báo.',
    assignedTo: userPhamQuynhNhu,
    createdBy: userPhamQuynhNhu,
    status: 'TODO',
    group: groupOrion,
    deadline: '2026-06-03T20:00:00',
    createdAt: '2026-05-16T15:30:00',
    updatedAt: '2026-05-16T15:30:00',
  },
  {
    taskId: 9,
    title: 'Thiết kế giao diện trang sản phẩm',
    description: 'Dựng layout danh sách sản phẩm, bộ lọc và trang chi tiết cho sàn TMĐT mini.',
    assignedTo: userPhanThiMai,
    createdBy: userDoanKhanhLinh,
    status: 'IN_PROGRESS',
    group: groupTitan,
    deadline: '2026-05-28T18:00:00',
    createdAt: '2026-05-08T09:00:00',
    updatedAt: '2026-05-20T14:30:00',
  },
  {
    taskId: 10,
    title: 'Xây dựng API giỏ hàng và thanh toán',
    description: 'Thiết kế endpoint thêm/sửa/xóa giỏ hàng và luồng thanh toán giả lập.',
    assignedTo: userHuynhTanPhat,
    createdBy: userDoanKhanhLinh,
    status: 'TODO',
    group: groupTitan,
    deadline: '2026-06-05T18:00:00',
    createdAt: '2026-05-09T10:00:00',
    updatedAt: '2026-05-09T10:00:00',
  },
  {
    taskId: 11,
    title: 'Tích hợp trình soạn thảo Markdown',
    description: 'Cho phép người dùng viết bài blog bằng Markdown và xem trước real-time.',
    assignedTo: userVuMinhHieu,
    createdBy: userVuMinhHieu,
    status: 'REVIEW',
    group: groupComet,
    deadline: '2026-05-30T20:00:00',
    createdAt: '2026-05-10T13:00:00',
    updatedAt: '2026-05-22T09:15:00',
  },
  {
    taskId: 12,
    title: 'Đồng bộ ghi chú với Firebase',
    description: 'Lưu và đồng bộ ghi chú giữa các thiết bị qua Firebase Realtime Database.',
    assignedTo: userTranThanhTung,
    createdBy: userTranThanhTung,
    status: 'IN_PROGRESS',
    group: groupLuna,
    deadline: '2026-06-08T18:00:00',
    createdAt: '2026-05-12T08:30:00',
    updatedAt: '2026-05-23T16:00:00',
  },
  {
    taskId: 13,
    title: 'Thiết kế màn hình danh sách ghi chú',
    description: 'Dựng UI danh sách, tìm kiếm và phân loại ghi chú theo nhãn.',
    assignedTo: userDangThuyTrang,
    createdBy: userTranThanhTung,
    status: 'DONE',
    group: groupLuna,
    deadline: '2026-05-25T18:00:00',
    createdAt: '2026-05-11T09:00:00',
    updatedAt: '2026-05-24T17:20:00',
  },
  {
    taskId: 14,
    title: 'Thu thập và gán nhãn dữ liệu biển báo',
    description: 'Tổng hợp ảnh biển báo giao thông và gán nhãn cho tập huấn luyện.',
    assignedTo: userNgoQuangHuy,
    createdBy: userNgoQuangHuy,
    status: 'DONE',
    group: groupVega,
    deadline: '2026-04-30T18:00:00',
    createdAt: '2026-04-10T08:00:00',
    updatedAt: '2026-04-28T15:00:00',
  },
  {
    taskId: 15,
    title: 'Huấn luyện mô hình CNN nhận diện biển báo',
    description: 'Huấn luyện và đánh giá độ chính xác mô hình trên tập kiểm thử.',
    assignedTo: userHoangPhuQuy,
    createdBy: userNgoQuangHuy,
    status: 'IN_PROGRESS',
    group: groupVega,
    deadline: '2026-06-10T18:00:00',
    createdAt: '2026-05-02T10:00:00',
    updatedAt: '2026-05-25T11:30:00',
  },
]

export const mockTeamRequests: User[] = [
  { 
    ...userHoangPhuQuy, 
    userProfile: { 
      ...userHoangPhuQuy.userProfile!, 
      summary: 'Data Engineering • Mong muốn tham gia nhóm để học hỏi thêm về thực tế.' 
    }
  },
  { 
    ...userLeViSa, 
    userProfile: { 
      ...userLeViSa.userProfile!, 
      summary: 'UI/UX Design Minor • Rất hào hứng với dự án của nhóm.' 
    }
  }
];

export const mockCourseMembersMap: Record<number, User[]> = {
  1: mockClassMembers,
  2: [userSinhVienTran, userTranGiaBao, userBuiNhatTruong, userPhamQuynhNhu],
  3: [userDoanKhanhLinh, userPhanThiMai, userHuynhTanPhat, userVuMinhHieu, userLyGiaHan],
  4: [userTranThanhTung, userDangThuyTrang, userNguyenMinhAn, userSinhVienTran],
  5: [userNgoQuangHuy, userHoangPhuQuy, userLyGiaHan, userNguyenThuyDuong],
}

export const mockMyGroupMap: Record<number, Group | null> = {
  1: groupPhoenix,
  2: null,
  3: groupTitan,
  4: groupLuna,
  5: null,
}

export const mockTeamRequestsMap: Record<number, User[]> = {
  1: mockTeamRequests,
  2: [],
  3: [userNguyenMinhAn],
  4: [userLeViSa],
  5: [],
}

export interface CourseRequirement {
  description: string;
  deadline: string;
}

export const mockCourseRequirements: Record<number, CourseRequirement> = {
  1: {
    description: 'Các nhóm cần nộp đủ 3 file: Báo cáo (PDF), Slide thuyết trình (PPTX) và Source code (.zip). Nộp trễ trừ 50% số điểm.',
    deadline: '2026-06-30'
  },
  2: {
    description: 'Nộp báo cáo quản lý dự án kèm bảng phân công công việc và biên bản họp nhóm hằng tuần.',
    deadline: '2026-07-15'
  },
  3: {
    description: 'Triển khai sản phẩm web lên hosting, nộp link demo, source code (.zip) và tài liệu API.',
    deadline: '2026-06-20'
  },
  4: {
    description: 'Nộp file APK, video demo (tối đa 5 phút) và source code của ứng dụng di động.',
    deadline: '2026-06-25'
  },
  5: {
    description: 'Nộp notebook huấn luyện, mô hình đã lưu, tập dữ liệu và báo cáo đánh giá độ chính xác.',
    deadline: '2026-07-10'
  },
};

export const mockCourseGroupsMap: Record<number, Group[]> = {
  1: [groupPhoenix, groupAster],
  2: [groupNimbus, groupOrion],
  3: [groupTitan, groupComet],
  4: [groupLuna],
  5: [groupVega],
}
