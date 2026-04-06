📝 Notion Mini - Backend API
Dự án xây dựng hệ thống Backend cho ứng dụng quản lý ghi chú (Notion Clone), tập trung vào cấu trúc dữ liệu đệ quy (Nested Documents), quản lý thẻ (Tagging System) và bảo mật người dùng.

🚀 Công Nghệ Sử Dụng
Runtime: Node.js & TypeScript

Framework: Express.js

Database: PostgreSQL

ORM: Prisma

Authentication: JSON Web Token (JWT) & Bcrypt

Documentation: Swagger UI

Validation: Zod

🏗️ Kiến Trúc Dự Án
Dự án được tổ chức theo mô hình Service-Controller, giúp tách biệt logic nghiệp vụ và xử lý request:

Plaintext
src/
├── controllers/    # Tiếp nhận request và trả về response
├── services/       # Xử lý logic nghiệp vụ (Business Logic)
├── routes/         # Định nghĩa các endpoints API
├── middlewares/    # Xử lý Auth, Error Handling, Validation
├── config/         # Cấu hình Database, Swagger
└── types/          # Định nghĩa các TypeScript Interfaces
🌟 Các Tính Năng Chính
1. Hệ Thống Xác Thực (Authentication)
Đăng ký, Đăng nhập với mật khẩu được mã hóa.

Bảo mật API bằng JWT Middleware.

2. Quản Lý Ghi Chú (Document Management)
Cấu trúc Cây (Recursive): Hỗ trợ tạo trang lồng trong trang không giới hạn cấp độ.

Auto-save: API cập nhật liên tục nội dung và tiêu đề.

Thùng rác (Soft Delete): Lưu trữ ghi chú đã xóa trước khi xóa vĩnh viễn.

3. Hệ Thống Nhãn (Tagging System) - Đang phát triển
Quản lý nhãn màu sắc cá nhân.

Lọc ghi chú thông minh theo nhãn.

🛠️ Hướng Dẫn Cài Đặt
Clone dự án:

Bash
git clone <link-repo-cua-ban>
cd notion-mini-backend
Cài đặt thư viện:

Bash
npm install
Cấu hình môi trường:
Tạo file .env và thêm vào chuỗi kết nối PostgreSQL:

Đoạn mã
DATABASE_URL="postgresql://user:password@localhost:5432/notion_db?schema=public"
JWT_SECRET="your_secret_key"
Khởi tạo Database:

Bash
npx prisma migrate dev --name init
npx prisma generate
Chạy ứng dụng:

Bash
npm run dev
📖 Tài Liệu API (Swagger)
Sau khi khởi chạy server, bạn có thể truy cập tài liệu API đầy đủ và test trực tiếp tại:
📌 URL: http://localhost:5000/api-docs
