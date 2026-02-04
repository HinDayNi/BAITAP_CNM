# BÁO CÁO BỔ SUNG LAB 3 (ADVANCED EXTENSION)

## 1. Sơ đồ thiết kế Cơ sở dữ liệu (DynamoDB)

Hệ thống sử dụng mô hình Single-Table (có thể) hoặc Multi-Table. Trong bài làm này, chúng ta sử dụng **Multi-Table** để rõ ràng về mặt cấu trúc cho bài tập, tuy nhiên trong thực tế NoSQL thường gộp bảng.

### Table: Users
| Attribute | Type | Description |
|-----------|------|-------------|
| **userId** (PK) | String | UUID |
| username | String | Tên đăng nhập (Unique logical) |
| password | String | Mật khẩu đã hash (Bcrypt) |
| role | String | 'admin' \| 'staff' |
| createdAt | String | ISO Timestamp |

### Table: Categoriess
| Attribute | Type | Description |
|-----------|------|-------------|
| **categoryId** (PK) | String | UUID |
| name | String | Tên danh mục |
| description | String | Mô tả |

### Table: Products
| Attribute | Type | Description |
|-----------|------|-------------|
| **id** (PK) | String | UUID |
| name | String | Tên sản phẩm |
| price | Number | Giá |
| quantity | Number | Số lượng |
| categoryId | String | UUID (Tham chiếu Categories) |
| url_image | String | S3 URL |
| isDeleted | Boolean | Soft Delete flag |
| createdAt | String | ISO Timestamp |

### Table: ProductLogs
| Attribute | Type | Description |
|-----------|------|-------------|
| **logId** (PK) | String | UUID |
| productId | String | ID sản phẩm bị tác động |
| action | String | CREATE, UPDATE, DELETE |
| userId | String | ID người thực hiện |
| time | String | ISO Timestamp |

---

## 2. Luồng xử lý (Flowcharts logic)

### A. Đăng nhập (Login Flow)
1. **User** truy cập `/login`.
2. Hệ thống hiển thị Form.
3. User nhập `username`, `password` -> Submit.
4. **Server**:
   - Tìm user trong bảng `Users` bằng `Scan` (hoặc Query nếu có GSI).
   - Nếu không thấy -> Báo lỗi.
   - Nếu thấy -> Dùng `bcrypt.compare` kiểm tra mật khẩu.
   - Sai -> Báo lỗi.
   - Đúng -> Tạo Session (`req.session.user = user`), chuyển hướng sang `/products`.

### B. Thêm sản phẩm (Add Product Flow)
1. **User** (Admin) truy cập `/products/add`.
2. Hệ thống lấy danh sách Categories -> Hiển thị Form.
3. User nhập thông tin + Upload ảnh -> Submit.
4. **Server**:
   - Upload ảnh lên **S3** -> Nhận về URL.
   - Tạo UUID cho Product.
   - Lưu thông tin vào DynamoDB Table `Products` với `createdAt`, `isDeleted=false`.
   - Ghi log vào Table `ProductLogs`.
   - Trả về trang danh sách.

---

## 3. So sánh DynamoDB vs MySQL

| Tiêu chí | MySQL (RDBMS) | DynamoDB (NoSQL) |
|----------|---------------|------------------|
| **Mô hình dữ liệu** | Có cấu trúc, Schema cố định, Quan hệ (Join). | Linh hoạt, Schemaless, Key-Value / Document. |
| **Join** | Hỗ trợ mạnh mẽ (`JOIN`). | Không hỗ trợ `JOIN`. Phải denormalize data hoặc query nhiều lần. |
| **Scaling** | Vertical Check (Tăng RAM/CPU). Khó scale write. | Horizontal Scaling (Sharding) tự động. Write vô hạn. |
| **Consistency** | ACID (Strong Consistency). | Eventual Consistency (mặc định), Strong (tùy chọn). |
| **Chi phí** | Tính theo Server/Instance. | Tính theo Request (Read/Write Capacity Unit). |

**Vì sao DynamoDB không JOIN?**
DynamoDB được thiết kế để phân tán dữ liệu trên nhiều partition servers. Việc JOIN yêu cầu scan dữ liệu từ nhiều nơi và gộp lại, rất tốn kém và khó đảm bảo hiệu năng thấp (single-digit millisecond latency) mà DynamoDB cam kết. Thay vào đó, thiết kế NoSQL khuyến khích lưu trữ dữ liệu đi kèm (embedded) hoặc chấp nhận dư thừa dữ liệu (redundancy) để đọc nhanh.

---

## 4. Ưu/Nhược điểm của NoSQL cho bài toán này

### Ưu điểm:
1.  **Flexible Schema**: Dễ dàng thêm field mới cho Product (VD: size, color) mà không cần `ALTER TABLE` toàn bộ DB.
2.  **Performance**: Tốc độ đọc/ghi cực nhanh nếu thiết kế Key hợp lý (VD: `getProductById`).
3.  **Cloud Native**: Tích hợp sâu với AWS (IAM, Lambda, S3), không cần quản lý Server DB.

### Nhược điểm:
1.  **Query phức tạp**: Việc "Lọc theo khoảng giá + Category + Tên" rất khó khăn nếu không dùng `Scan` (tốn kém) hoặc thiết kế nhiều GSI (tốn tiền). SQL chỉ cần `WHERE ... AND ...`.
2.  **Chi phí Scan**: Trong bài Lab này, chức năng Filter dùng `Scan` quét toàn bộ bảng. Với lượng dữ liệu lớn, đây là thảm họa về chi phí và hiệu năng.
3.  **Consistency**: Việc Soft Delete + Relation (Category) phải quản lý thủ công (Application-side logic), không có Foreign Key Constraint để đảm bảo toàn vẹn dữ liệu.

---

## 5. Mở rộng E-Commerce (Gợi ý)
Để mở rộng thành mini e-commerce (Khách đặt hàng):
1.  Cần bảng `Orders` (orderId, userId, status, total).
2.  Cần bảng `OrderItems` (Hoặc nhúng list item vào `Orders`).
3.  Cần xử lý transaction: Khi đặt hàng -> Trừ `quantity` trong Inventory. DynamoDB hỗ trợ Transaction (`TransactWriteItems`) để đảm bảo trừ kho và tạo đơn hàng xảy ra đồng thời.
