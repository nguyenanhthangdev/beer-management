🍺 Beer Shop Management System

Hệ thống quản lý quán bia giúp theo dõi bàn, gọi món, thanh toán và thống kê doanh thu theo thời gian thực.
Phù hợp cho quán nhỏ đến vừa, cần thao tác nhanh, trực quan và dễ dùng.


🚀 Công nghệ sử dụng
- Backend
  + Java + Spring Boot
  + Spring Data JPA
  + RESTful API
  + MySQL
  + Maven
- Frontend
  + ReactJS
  + Axios (gọi API)
  + Recharts (biểu đồ thống kê)
  + SweetAlert2 (popup UI)
- Deploy
  + Backend: Render
  + Frontend: Vercel
 

📌 Chức năng chính
- 🪑 Quản lý bàn
  - Thêm / sửa / xoá bàn
  - Hiển thị trạng thái:
    + 🟢 Trống
    + 🔴 Đang sử dụng
- 🍻 Quản lý gọi món
  - Mở bàn (có nút xác nhận, tránh mở nhầm)
  - Thêm món vào order
  - Xoá món (chỉ khi chưa phục vụ)
  - Đánh dấu món:
    + 🚚 Chưa mang
    + ✔ Đã mang (không cho click lại)
- 💰 Thanh toán
  - Tính tổng tiền theo order
  - Thanh toán → tự động 
  - Đóng order
  - Cập nhật trạng thái bàn
  - Reset dữ liệu UI
- 📊 Thống kê
  - Doanh thu:
    + Hôm nay
    + Theo tháng
    + Chọn ngày bất kỳ
    + So sánh:
      + Hôm nay vs hôm qua
      + Tuần này vs tuần trước
      + Tháng này vs tháng trước
  - Biểu đồ:
    + 7 ngày gần nhất
  - Top:
    + 🔥 Món bán chạy
    + ❄️ Món bán ít
    + ⚠️ Món chưa bán


⚙️ API chính
- Orders
  - POST /api/orders/open/{tableId} → mở bàn
  - POST /api/orders/close/{orderId} → thanh toán
  - Order Items
  - POST /api/order-items → thêm món
  - PUT /api/order-items/{id}/served → cập nhật trạng thái
  - DELETE /api/order-items/{id} → xoá món
- Tables
  - GET /api/tables
  - POST /api/tables
  - PUT /api/tables/{id}
  - DELETE /api/tables/{id}
- Statistics
  - /api/statistics/*
 

🎯 Điểm nổi bật
- UI đơn giản, dễ dùng, thao tác nhanh
- Không bị lỗi trạng thái bàn (fix logic mở bàn chuẩn)
- Dữ liệu thống kê realtime
- Tách rõ backend – frontend (chuẩn RESTful)
- Code theo mô hình Service – Repository (chuẩn Spring Boot)


📷 Demo
https://beer-management-g1i67jk7l-nnguyenanhthang2002-6543s-projects.vercel.app/


🧠 Ghi chú
- Dữ liệu thống kê phụ thuộc vào closed_at của order
- Chỉ order có status = PAID mới được tính doanh thu
- Đã xử lý lỗi:
    + vòng lặp JSON
    + sai lệch ngày thống kê
    + reorder UI khi update
 

📦 Hướng phát triển thêm
- Login / phân quyền (Spring Security)
- In hoá đơn
- Quản lý nhân viên
- Dashboard nâng cao (biểu đồ nhiều loại hơn)
