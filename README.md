# UIT-ProjectManager-Team-10 - Hướng Dẫn Cài Đặt & Chạy Dự Án

## Mục Lục
1. [Yêu Cầu Hệ Thống](#1-yêu-cầu-hệ-thống)
2. [Cấu Hình Dự Án](#2-cấu-hình-dự-án)
3. [Hướng Dẫn VSCode](#3-hướng-dẫn-vscode)
4. [Hướng Dẫn IntelliJ IDEA](#4-hướng-dẫn-intellij-idea)
5. [Các API Endpoints](#5-các-api-endpoints)
6. [Xử Lý Sự Cố](#6-xử-lý-sự-cố)

---

## 1. Yêu Cầu Hệ Thống

### 1.1 Cài Đặt Java 21
1. Tải Java 21: https://download.oracle.com/java/21/latest/jdk-21_windows-x64_bin.exe
2. Chạy file cài đặt và làm theo hướng dẫn
3. Đặt biến môi trường JAVA_HOME:
   - Windows Search → "Environment Variables"
   - System Properties → Environment Variables
   - Thêm mới System Variable:
     - Name: `JAVA_HOME`
     - Value: `C:\Program Files\Java\jdk-21`
4. Thêm vào PATH: `%JAVA_HOME%\bin`
5. Kiểm tra: Mở PowerShell → `java -version`

### 1.2 Cài Đặt MySQL
1. Tải MySQL: https://dev.mysql.com/downloads/mysql/
2. Cài đặt MySQL Server (password: `123456`)
3. Mở MySQL Command Line hoặc Workbench
4. Tạo database:
   ```sql
   CREATE DATABASE se330;
   ```

### 1.3 Cài Đặt Maven (cho VSCode)
1. Tải Apache Maven: https://maven.apache.org/download.cgi
2. Giải nén vào thư mục, ví dụ: `C:\apache-maven`
3. Thêm Environment Variables:
   - MAVEN_HOME: `C:\apache-maven`
   - PATH thêm: `%MAVEN_HOME%\bin`
4. Kiểm tra: `mvn -version`

### 1.4 Cài Đặt Node.js (Cho Frontend)
1. Tải và cài đặt Node.js (khuyên dùng bản LTS): https://nodejs.org/
2. Kiểm tra cài đặt thành công: Mở Terminal/PowerShell và gõ:
   - `node -v`
   - `npm -v`
---

## 2. Cấu Hình Dự Án

### 2.1 Clone Dự Án
```bash
git clone <repo-url>
cd UIT-ProjectManager-Team-10
```

### 2.2 Cấu Hình Database
Mở file `Backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/se330?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=123456
spring.jpa.hibernate.ddl-auto=update
```

### 2.3 Cấu Hình Email SMTP (Gmail)
1. Bật 2-Step Verification: https://myaccount.google.com/security
2. Tạo App Password: https://myaccount.google.com/apppasswords
3. Cập nhật `application.properties`:

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-16-char-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

app.base-url=http://localhost:8080
```

---

## 3. Hướng Dẫn VSCode

### 3.1 Cài Đặt Extensions
Mở VSCode → Extensions (Ctrl+Shift+X) → Cài các extensions:
- **Extension Pack for Java** (Microsoft)
- **Spring Boot Extension Pack** (VMware)
- **Maven for Java** (Microsoft)

### 3.2 Import Dự Án Maven
1. File → Open Folder → Chọn thư mục `Backend`
2. VSCode sẽ tự động nhận diện Maven project
3. Chờ Java Language Server khởi động (1-2 phút)

### 3.3 Chạy Ứng Dụng

**Cách 1: Spring Boot Dashboard**
1. Mở Spring Boot Dashboard (biểu tượng lá cây bên trái)
2. Click vào ứng dụng `demo` → Run

**Cách 2: Terminal**
```bash
cd Backend
mvn spring-boot:run
```

**Cách 3: Debug Mode**
1. Đặt breakpoint trong code
2. Run → Start Debugging (F5)
3. Chọn "Java"

### 2.4 Cài Đặt & Chạy Frontend (React + Vite)
Mở một Terminal mới và di chuyển vào thư mục frontend:
```bash
cd frontend
1. Cài đặt các thư viện
npm install
2. Khởi động server
npm run dev
3. Truy cập ứng dụng tại: http://localhost:5173
```
---

## 4. Hướng Dẫn IntelliJ IDEA

### 4.1 Import Dự Án
1. File → Open → Chọn thư mục `Backend`
2. Import as Maven Project ✓
3. Đợi Maven download dependencies

### 4.2 Cấu Hình Project SDK
1. File → Project Structure → Project
2. Project SDK: Chọn JDK 21
3. Project language level: 21 - Records, patterns, etc.

### 4.3 Cấu Hình Run Configuration
1. Run → Edit Configurations
2. Click "+" → Spring Boot → Application
3. Cấu hình:
   - Name: `demo`
   - Main class: `com.example.se330.se330Application`
   - Working directory: `Backend`

### 4.4 Chạy Ứng Dụng

**Cách 1: IntelliJ**
- Nhấn Shift+F10 hoặc click nút Run ▶️

**Cách 2: Maven Tool Window**
1. Maven Tool (bên phải màn hình)
2. Backend → Lifecycle → double-click `spring-boot:run`

**Cách 3: Debug Mode**
- Nhấn Shift+F9 để debug

### 4.5 HTTP Client trong IntelliJ
Tạo file `http-requests.http` trong thư mục `Backend`:

```http
### Register
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "123456",
  "name": "Test User"
}

### Login
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "123456"
}
```

---

## 5. Các API Endpoints

| Method | Endpoint | Mô tả | Body/Query |
|--------|----------|--------|------------|
| POST | `/api/auth/register` | Đăng ký tài khoản | `{"email","password","name"}` |
| POST | `/api/auth/login` | Đăng nhập | `{"email","password"}` |
| POST | `/api/auth/logout` | Đăng xuất | - |
| GET | `/api/auth/verify-email` | Xác thực email | Query: `?token=xxx` |
| POST | `/api/auth/forgot-password` | Quên mật khẩu | `{"email"}` |
| POST | `/api/auth/reset-password` | Reset mật khẩu | `{"token","newPassword"}` |
| GET | `/api/auth/me` | Thông tin user | Header: `Authorization: Bearer <token>` |

### Ví dụ cURL

**Đăng ký:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","name":"Test User"}'
```

**Đăng nhập:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

**Lấy thông tin user:**
```bash
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

## 6. Xử Lý Sự Cố

### Lỗi "JAVA_HOME not set"
- Đóng và mở lại IDE sau khi cài Java
- Kiểm tra: `echo $JAVA_HOME` trong terminal

### Lỗi kết nối MySQL
- Đảm bảo MySQL service đang chạy
- Kiểm tra password trong application.properties

### Lỗi Lombok không hoạt động
- **VSCode**: Ctrl+Shift+P → "Reload Window"
- **IntelliJ**: File → Invalidate Caches → Invalidate and Restart

### Lỗi Maven dependencies
- **VSCode**: Maven Tool → Reimport
- **IntelliJ**: Maven Tool Window → Reimport All Maven Projects

### Lỗi Port 8080 đã sử dụng
```bash
netstat -ano | findstr :8080
taskkill /PID <pid> /F
```

### Không resolve được symbol (IntelliJ)
1. File → Settings → Build → Compiler → Annotation Processors
2. ✓ Enable annotation processing
3. File → Invalidate Caches → Restart

## Account test: 
```bash
student@gmail.com
teacher@gmail.com
admin@gmail.com

password:123123
```
## Cấu Trúc Dự Án

```
UIT-ProjectManager-Team-10/
├──Backend/
│  ├── src/main/java/com/example/se330/
│  │   ├── se330Application.java           # Main class
│  │   ├── config/
│  │   │   ├── SecurityConfig.java        # Spring Security
│  │   │   ├── JwtAuthenticationFilter.java
│  │   │   └── AsyncConfig.java
│  │   ├── controller/
│  │   │   └── AuthController.java        # Auth endpoints
│  │   ├── dto/                           # Request/Response DTOs
│  │   ├── entity/
│  │   │   └── User.java
│  │   ├── enums/
│  │   │   └── Role.java
│  │   ├── repository/
│  │   │   └── UserRepository.java
│  │   └── service/
│  │       ├── JwtService.java
│  │       ├── EmailService.java
│  │       └── CustomUserDetailsService.java
│  ├── src/main/resources/
│  │   └── application.properties
│  └── pom.xml
│
├── frontend/                            # ReactJS + Vite + Tailwind v4
│   ├── public/
│   ├── src/
│   │   ├── assets/                      # Hình ảnh, icons
│   ├── components/
│   │   ├── ui/               # button, card, input...
│   │   ├── layout/           # navbar, sidebar, footer
│   │   └── common/           # reusable business-independent 
│   |
│   ├── features/             # chia theo module/business
│   │   ├── auth/
│   │   ├── products/
│   │   ├── organizations/
│   │   ├── home/
│   ├── pages/                # route pages
│   ├── hooks/                # custom hooks
│   ├──lib/                  # axios, utils, helpers
│   ├── services/             # api calls
│   ├── mocks/                # fake data
│   ├── styles/               # extra css
│   ├── types/                # global ts types
│   ├── App.jsx                      # Root component
│   ├── index.css                    # Tailwind CSS import
│   └── main.jsx                     # Entry point
├── package.json
├── vite.config.js                   # Cấu hình Vite & Proxy API
│
└── README.md
```
