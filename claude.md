# Project: Notion Mini - Fullstack Monorepo

## 1. Tổng quan dự án

Xây dựng ứng dụng quản lý ghi chú (Notion Clone) theo kiến trúc Monorepo.

```
notionmini/
├── backend/    # Node.js + Express + TypeScript + PostgreSQL + Prisma
└── frontend/   # React + TypeScript + Vite + Tailwind CSS
```

- **Mục tiêu:** Cải thiện trình độ từ Junior lên Mid-level.
- **Backend Stack:** Node.js, Express, TypeScript, PostgreSQL, Prisma, Swagger, Zod.
- **Frontend Stack:** React, TypeScript, Vite, Tailwind CSS, Zustand, React Query, React Router.
- **Mô hình Backend:** Controller - Service - Repository (Clean Architecture).

## 2. Database Schema (Prisma)

- **User**: Định danh người dùng.
- **Document**: Lưu trữ ghi chú. Hỗ trợ cấu trúc cây (parentDocumentId) và Soft Delete (isArchived).
- **Tag**: Nhãn phân loại (Many-to-Many với Document thông qua bảng nối DocumentTag).

## 3. Lộ trình phát triển (Roadmap)

---

### BACKEND

---

### ✅ Giai đoạn 1: Hệ thống Xác thực (Authentication) - HOÀN THÀNH

- `POST /api/v1/auth/register` — Đăng ký.
- `POST /api/v1/auth/login` — Đăng nhập & trả về JWT.
- Middleware `auth.middleware.ts` bảo vệ các route riêng tư.
- Validation bằng Zod.

### ✅ Giai đoạn 2: Quản lý Ghi chú (Document CRUD) - HOÀN THÀNH

- `POST /api/v1/documents` — Tạo mới, hỗ trợ parentDocumentId.
- `GET /api/v1/documents?isArchived=false` — Lấy danh sách, filter theo isArchived.
- `GET /api/v1/documents/:id` — Lấy chi tiết kèm tags.
- `PATCH /api/v1/documents/:id` — Cập nhật (auto-save).
- `DELETE /api/v1/documents/:id` — Soft delete, đệ quy archive cây con.

### ✅ Giai đoạn 3: Hệ thống Nhãn (Tagging System) - HOÀN THÀNH

- `POST /api/v1/tags` — Tạo tag mới.
- `GET /api/v1/tags` — Lấy danh sách tags của user.
- `DELETE /api/v1/tags/:tagId` — Xóa tag (cascade DocumentTag, không xóa Document).
- `POST /api/v1/documents/:id/tags` — Gắn tag vào document.
- `DELETE /api/v1/documents/:id/tags/:tagId` — Gỡ tag khỏi document.

### Giai đoạn 4: Mở rộng & Tối ưu Backend

- Tìm kiếm (Search): API tìm kiếm ghi chú theo keyword trong title/content.
- Thùng rác: API khôi phục (restore) hoặc xóa vĩnh viễn ghi chú.
- Swagger: Cập nhật JSDoc đầy đủ cho tất cả endpoint.

---

### FRONTEND

---

### ✅ Giai đoạn 5: Auth & Core - HOÀN THÀNH

- **Axios Setup:** `frontend/src/lib/axios.ts` — baseURL + interceptor tự động đính kèm JWT.
- **Auth Store:** `frontend/src/stores/useAuthStore.ts` — Zustand quản lý user, token, isAuthenticated.
- **Pages:** LoginPage, RegisterPage — giao diện tối giản với Tailwind CSS.
- **Routing:** App.tsx với Protected Routes (chỉ vào Dashboard nếu đã đăng nhập).

### ✅ Giai đoạn 6: Navigation - HOÀN THÀNH

- **Recursive Sidebar:** Component sidebar hiển thị cây document đệ quy.
- **Expand/Collapse:** Toggle mở/đóng từng nhánh document.
- **Create Page:** Nút tạo trang mới từ sidebar.

### ✅ Giai đoạn 7: Editor - HOÀN THÀNH

- **Block-based Editor:** Vùng soạn thảo nội dung document.
- **Auto-save (Debounce):** Tự động lưu sau khi user dừng gõ.
- **Cover/Icon Image:** Upload hoặc chọn cover và icon cho document.

### ✅ Giai đoạn 8: Features - HOÀN THÀNH

- **Tagging UI:** Giao diện gắn/gỡ tag cho document.
- **Trash Management:** Xem và khôi phục document trong thùng rác.
- **Global Search (Cmd+K):** Tìm kiếm nhanh toàn bộ document.

### ✅ Giai đoạn 9: UX Polish & Signature Features - HOÀN THÀNH

#### UX & Feedback
- **Toast Notifications (sonner):** Thông báo khi tạo trang, xóa, khôi phục, lỗi API.
  - `frontend/src/stores/useDocumentStore.ts` — toast.error() trên mọi action thất bại.
  - `frontend/src/components/sidebar/Sidebar.tsx` — toast.success() khi tạo trang root.
  - `frontend/src/components/sidebar/SidebarItem.tsx` — toast.success() khi tạo trang con, xóa.
  - `frontend/src/components/TrashModal.tsx` — toast.success() khi restore/xóa vĩnh viễn.
  - `frontend/src/components/editor/DocumentEditor.tsx` — toast.success() khi archive.
- **Skeleton Loaders:** `frontend/src/components/SkeletonLoader.tsx`
  - `SidebarSkeleton` — 4 dòng animated thay thế text "Đang tải..." ở sidebar.
  - `EditorSkeleton` — Cover + title + lines animated thay thế spinner ở editor.
- **Hover & Active States:** Sidebar items cải thiện: active có `shadow-sm`, hover dùng `bg-neutral-800/70`, logout chuyển `hover:text-red-400`.

#### Gia vị tinh tế
- **Auto document.title:** Editor cập nhật `window.document.title` thành `"Tên trang — Notion Mini"` khi mở trang, reset khi unmount.
- **Esc đóng Modal:** `TrashModal` có Esc handler (SearchModal đã có sẵn).
- **Favicon & Title:** `public/favicon.svg` — icon Notion-style. `index.html` title đổi thành `"Notion Mini"`.

#### Tính năng đặc trưng (Signature)
- **Breadcrumbs:** `frontend/src/components/Breadcrumbs.tsx` — hiển thị chuỗi `Parent > Child` phía trên editor. Ẩn nếu trang là root. Node cha có thể click để navigate.
- **Slash Commands:** `frontend/src/components/editor/SlashCommandMenu.tsx` — menu nổi xuất hiện khi gõ `/`. Hỗ trợ 10 block types (Văn bản, H1-H4, Bullet/Ordered list, Trích dẫn, Code block, Đường phân cách). Điều hướng bằng ↑↓, chọn bằng Enter, đóng bằng Esc. Tích hợp vào `DocumentEditor` qua `editor.on('transaction')` để detect pattern `/query` real-time.
- **Theme Toggle (Dark/Light):**
  - `frontend/src/stores/useThemeStore.ts` — Zustand + persist, toggle class `dark` trên `<html>`.
  - `frontend/src/index.css` — `@custom-variant dark` cho Tailwind v4.
  - Nút Sun/Moon góc trên phải editor trong `DashboardPage`.

#### Hiệu suất
- **Debounce 500ms:** Giảm từ 800ms xuống 500ms trong `DocumentEditor`.
- **Xóa console.log:** Không còn console.log nào trong codebase.
- **Lỗi ESLint:** Fix `setIsLoading` synchronous-in-effect bằng cách khởi tạo `useState(true)` thay vì gọi trong effect body.

## 4. Quy tắc Code

### Backend (`backend/`)
1. Sử dụng TypeScript Strict mode.
2. Logic nghiệp vụ nằm ở `services`, `controllers` chỉ điều phối request/response.
3. Sử dụng `async/await` và bọc trong `try-catch`.
4. Mọi API phải được khai báo trong Swagger.
5. Chạy dev: `cd backend && npm run dev`

### Frontend (`frontend/`)
1. Sử dụng React functional components + hooks.
2. State toàn cục bằng Zustand, server state bằng React Query.
3. Styling bằng Tailwind CSS utility classes.
4. Gọi API qua Axios instance (không dùng fetch trực tiếp).
5. Chạy dev: `cd frontend && npm run dev`
