# Test Cases - Task 10: Account Credential Delivery System

## 📋 Tổng quan

Hệ thống giao thông tin tài khoản premium cho khách hàng sau khi thanh toán thành công, bao gồm giao diện admin, mã hóa bảo mật, và dashboard user.

---

## 🔧 Test Case 1: Admin - Credential Delivery Form

### TC1.1: Hiển thị form giao credential
**Precondition:** 
- Đăng nhập với quyền admin
- Có đơn hàng đã thanh toán (`status = 'paid'`)

**Steps:**
1. Truy cập `/admin/orders/[orderId]/deliver`
2. Kiểm tra form hiển thị đầy đủ các field:
   - Username/Email (required)
   - Password (required)
   - URL đăng nhập (required)
   - Ngày hết hạn (required)
   - Ghi chú cho khách hàng
   - Ghi chú nội bộ

**Expected Result:**
- ✅ Form hiển thị đầy đủ với layout responsive
- ✅ Các field required có dấu `*`
- ✅ Button "Tự động tạo" hoạt động
- ✅ Placeholders hiển thị đúng

### TC1.2: Auto-generate credentials
**Steps:**
1. Click button "Tự động tạo"
2. Kiểm tra dữ liệu được tạo tự động

**Expected Result:**
- ✅ Username dạng `premium_user_XXX@example.com`
- ✅ Password phức tạp có ký tự đặc biệt
- ✅ Login URL phù hợp với sản phẩm (Spotify → accounts.spotify.com)
- ✅ Ngày hết hạn = ngày hiện tại + duration của gói
- ✅ Ghi chú tự động theo template

### TC1.3: Form validation
**Steps:**
1. Submit form với các field trống
2. Nhập URL không hợp lệ 
3. Chọn ngày hết hạn trong quá khứ

**Expected Result:**
- ✅ Hiển thị lỗi "là bắt buộc" cho các field required
- ✅ Lỗi "URL không hợp lệ" cho URL sai format
- ✅ Lỗi "Ngày hết hạn phải là tương lai"
- ✅ Form không submit khi có lỗi

### TC1.4: Successful delivery
**Steps:**
1. Điền đầy đủ thông tin hợp lệ
2. Click "Gửi thông tin tài khoản"
3. Kiểm tra response và redirect

**Expected Result:**
- ✅ Loading state hiển thị trong lúc submit
- ✅ Toast success: "Thông tin tài khoản đã được gửi thành công!"
- ✅ Custom notification "Tài khoản mới đã sẵn sàng!"
- ✅ Redirect về `/admin/orders` sau 2 giây
- ✅ Form reset về trạng thái ban đầu

---

## 🔌 Test Case 2: API Routes - Admin Delivery

### TC2.1: POST /api/admin/orders/[id]/deliver - Success
**Precondition:** Admin logged in, order exists và paid

**Request:**
```json
{
  "credentials": "{\"username\":\"test@example.com\",\"password\":\"Pass123!\",\"loginUrl\":\"https://spotify.com/login\",\"expirationDate\":\"2024-12-31\",\"notes\":\"Test note\"}",
  "deliveryNotes": "Delivered successfully"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Credentials delivered successfully",
  "notification": "User has been notified"
}
```

**Database Changes:**
- ✅ `AccountDelivery` record được tạo/update
- ✅ Credentials được encrypt trước khi lưu
- ✅ `deliveryStatus = 'delivered'`
- ✅ `sentAt` = current timestamp
- ✅ `Notification` record được tạo cho user

### TC2.2: Authentication & Authorization
**Steps:**
1. Call API không đăng nhập → 401 Unauthorized
2. Call API với user role → 403 Forbidden
3. Call API với admin role → 200 Success

### TC2.3: Order validation
**Steps:**
1. Call API với order không tồn tại → 404 Not Found
2. Call API với order chưa thanh toán → 400 Bad Request
3. Call API thiếu credentials → 400 Bad Request

---

## 🔒 Test Case 3: Encryption System

### TC3.1: Encrypt/Decrypt functionality
**Steps:**
```javascript
const originalText = "sensitive credential data"
const encrypted = encrypt(originalText)
const decrypted = decrypt(encrypted)
```

**Expected Result:**
- ✅ `encrypted` khác hoàn toàn với `originalText`
- ✅ `encrypted` có format `iv:encryptedData`
- ✅ `decrypted === originalText`
- ✅ Throw error nếu decrypt invalid format

### TC3.2: Password utilities
**Steps:**
```javascript
const password = generateSecurePassword(16)
const hash = hashPassword("testpass")
const isValid = verifyPassword("testpass", hash)
```

**Expected Result:**
- ✅ Password có độ dài chính xác (16 chars)
- ✅ Password chứa chữ hoa, thường, số, ký tự đặc biệt
- ✅ Hash password khác với password gốc
- ✅ `isValid === true`

### TC3.3: Username generation
**Steps:**
```javascript
const username = generateUsername("Spotify Premium")
```

**Expected Result:**
- ✅ Format: `spotifypremium_XXXX@premium.com`
- ✅ Chỉ chứa ký tự alphanumeric và underscore
- ✅ Random suffix 4 chữ số

---

## 👤 Test Case 4: User Dashboard - Credentials View

### TC4.1: Credentials page access
**Precondition:** User logged in

**Steps:**
1. Truy cập `/dashboard/credentials`
2. Kiểm tra statistics hiển thị

**Expected Result:**
- ✅ Redirect login nếu chưa đăng nhập
- ✅ Hiển thị stats: Tổng tài khoản, Đơn hàng đã giao, Tổng giá trị
- ✅ Chỉ hiển thị orders của user hiện tại
- ✅ Chỉ hiển thị orders đã giao (`deliveryStatus = 'delivered'`)

### TC4.2: Empty state
**Precondition:** User chưa có order nào được giao

**Expected Result:**
- ✅ Hiển thị icon, title, description phù hợp
- ✅ Button "Khám phá sản phẩm" link đến `/products`
- ✅ Stats hiển thị 0

### TC4.3: Credential cards display
**Precondition:** User có orders đã được giao

**Expected Result:**
- ✅ Mỗi order hiển thị trong CredentialCard riêng biệt
- ✅ Order ID hiển thị dạng 8 ký tự cuối
- ✅ Ngày giao hiển thị định dạng vi-VN
- ✅ Status badge với màu phù hợp
- ✅ Delivery notes hiển thị trong box xanh nếu có

---

## 🎴 Test Case 5: CredentialCard Component

### TC5.1: Card information display
**Expected Result:**
- ✅ Product image hiển thị hoặc placeholder nếu không có
- ✅ Product name, quantity, duration hiển thị đúng
- ✅ Button "Xem tài khoản" chỉ hiển thị khi `deliveryStatus = 'delivered'`

### TC5.2: Fetch và hiển thị credentials
**Steps:**
1. Click "Xem tài khoản"
2. Kiểm tra API call và UI update

**Expected Result:**
- ✅ Loading spinner hiển thị khi fetch
- ✅ API call đến `/api/credentials/[deliveryId]`
- ✅ Button text thay đổi thành "Ẩn thông tin" sau khi load
- ✅ Credentials hiển thị trong layout đẹp

### TC5.3: Credentials content display
**Expected Result:**
- ✅ Username/Email trong field readonly với button copy
- ✅ Password hiển thị plain text (có thể copy)
- ✅ Login URL là clickable link mở tab mới
- ✅ Expiration date với color coding:
  - Xanh: >7 ngày
  - Vàng: 1-7 ngày  
  - Đỏ: Đã hết hạn
- ✅ Notes hiển thị trong box trắng nếu có

### TC5.4: Copy to clipboard
**Steps:**
1. Click các button copy
2. Kiểm tra clipboard và feedback

**Expected Result:**
- ✅ Text được copy vào clipboard
- ✅ Toast hiển thị "Đã copy [type]!"
- ✅ Icon thay đổi thành checkmark trong 2 giây
- ✅ Copy hoạt động cho username, password, URL

### TC5.5: Usage instructions
**Expected Result:**
- ✅ Box hướng dẫn màu vàng hiển thị
- ✅ 4 bullet points về cách sử dụng tài khoản
- ✅ Icon warning và text màu vàng đậm

---

## 🔑 Test Case 6: API - User Credential Access

### TC6.1: GET /api/credentials/[id] - Success
**Precondition:** User owns the order

**Expected Response:**
```json
{
  "success": true,
  "credentials": {
    "username": "user@example.com",
    "password": "Pass123!",
    "loginUrl": "https://spotify.com/login",
    "expirationDate": "2024-12-31",
    "notes": "Account notes"
  },
  "deliveryInfo": {
    "deliveredAt": "2024-01-01T00:00:00Z",
    "deliveryStatus": "delivered",
    "deliveryNotes": "Delivery notes"
  }
}
```

### TC6.2: Security validation
**Steps:**
1. User A cố access credential của User B → 403 Forbidden
2. Access credential chưa được delivered → 400 Bad Request  
3. Access credential không tồn tại → 404 Not Found
4. Không đăng nhập → 401 Unauthorized

### TC6.3: Decryption error handling
**Steps:**
1. Corrupt encrypted data trong database
2. Call API

**Expected Result:**
- ✅ 500 Internal Server Error
- ✅ Log "Decryption error" trong console
- ✅ Response: `{"error": "Failed to decrypt credentials"}`

---

## 🔔 Test Case 7: Notification System

### TC7.1: Toast notifications
**Steps:**
1. Trigger các loại toast từ admin form
2. Kiểm tra hiển thị và styling

**Expected Result:**
- ✅ `notify.success()`: Nền xanh, icon checkmark, 4s duration
- ✅ `notify.error()`: Nền đỏ, icon X, 5s duration  
- ✅ Position: top-right
- ✅ Font weight: 500

### TC7.2: Custom credential notification
**Steps:**
1. Trigger `notify.credentialDelivered()`
2. Kiểm tra custom toast

**Expected Result:**
- ✅ Toast custom với green icon (key)
- ✅ Title: "Tài khoản mới đã sẵn sàng!"
- ✅ Message include product name
- ✅ Button "Xem ngay" link to `/dashboard/credentials`
- ✅ Button "Đóng" dismiss toast
- ✅ 8s duration

### TC7.3: Database notification
**Steps:**
1. Admin giao credential thành công
2. Kiểm tra database

**Expected Result:**
- ✅ `Notification` record được tạo trong DB
- ✅ `userId` = user của order
- ✅ `type = 'credential_delivered'`
- ✅ `title = 'Tài khoản mới đã sẵn sàng!'`
- ✅ `message` chứa tên sản phẩm
- ✅ `metadata` chứa orderId, productName, deliveryId
- ✅ `isRead = false`

---

## 🚨 Test Case 8: Error Handling

### TC8.1: Network errors
**Steps:**
1. Disconnect internet
2. Try submit admin form
3. Try fetch user credentials

**Expected Result:**
- ✅ Toast error với message thích hợp
- ✅ Form không reset
- ✅ Loading state tắt
- ✅ User có thể retry

### TC8.2: Server errors  
**Steps:**
1. Mock server return 500
2. Try các API calls

**Expected Result:**
- ✅ Graceful error handling
- ✅ User-friendly error messages
- ✅ Console.error logs chi tiết
- ✅ No app crash

### TC8.3: Invalid data handling
**Steps:**
1. Corrupt database data
2. Try decrypt invalid format
3. Try parse invalid JSON

**Expected Result:**
- ✅ Catch exceptions properly
- ✅ Return appropriate error codes
- ✅ Log errors for debugging
- ✅ Fallback UI nếu cần

---

## ✅ Test Case 9: End-to-End Flow

### TC9.1: Complete delivery flow
**Steps:**
1. User tạo order và thanh toán thành công
2. Admin nhận order với status 'paid'
3. Admin vào delivery page và giao credential
4. User vào dashboard và xem credential

**Expected Result:**
- ✅ Order status update sau delivery
- ✅ Notification hiển thị trong dashboard
- ✅ User nhận được tài khoản đầy đủ thông tin
- ✅ Credentials được decrypt chính xác
- ✅ UI hiển thị mượt mà trong toàn bộ flow

### TC9.2: Multiple products flow
**Steps:**
1. Order chứa nhiều sản phẩm khác nhau
2. Admin giao credential  
3. User xem credential

**Expected Result:**
- ✅ Auto-generate phù hợp với sản phẩm đầu tiên
- ✅ Expiration date theo duration của package
- ✅ Credential card hiển thị tất cả items
- ✅ Security instructions hiển thị

---

## 📊 Performance Test Cases

### TC10.1: Large credential data
**Steps:**
1. Create credential với notes rất dài (>1000 chars)
2. Test encrypt/decrypt performance
3. Test UI rendering

**Expected Result:**
- ✅ Encryption/decryption < 100ms
- ✅ UI không lag khi render
- ✅ Mobile responsive vẫn ổn

### TC10.2: Multiple concurrent deliveries
**Steps:**
1. Admin giao 10 credential cùng lúc
2. Monitor server performance

**Expected Result:**  
- ✅ Tất cả thành công
- ✅ Database không bị deadlock
- ✅ Notifications không bị duplicate

---

## 🛡️ Security Test Cases

### TC11.1: SQL Injection attempts
**Steps:**
1. Try inject SQL trong delivery API
2. Try inject trong credential fetch API

**Expected Result:**
- ✅ Prisma ORM protect automatically
- ✅ No data leakage
- ✅ Proper error response

### TC11.2: XSS attempts
**Steps:**
1. Input script tags trong credential notes
2. Check UI rendering

**Expected Result:**
- ✅ Script không execute
- ✅ Content được escape properly
- ✅ UI không bị broken

### TC11.3: Access control bypass
**Steps:**
1. Try access admin endpoints với user token
2. Try modify request parameters
3. Try CORS bypass

**Expected Result:**
- ✅ 403 Forbidden cho unauthorized access
- ✅ Proper role checking
- ✅ Secure headers present

---

## 📱 Mobile & Responsive Tests

### TC12.1: Mobile admin form
**Steps:**
1. Open admin delivery form trên mobile
2. Test form interaction

**Expected Result:**
- ✅ Form fields đầy đủ không bị cắt
- ✅ Buttons accessible
- ✅ Auto-generate button hoạt động
- ✅ Keyboard không che form

### TC12.2: Mobile credential view  
**Steps:**
1. Open user credentials trên mobile
2. Test credential card interaction

**Expected Result:**
- ✅ Cards stack vertically đẹp
- ✅ Copy buttons accessible
- ✅ Credential text readable
- ✅ Stats grid responsive

---

## 📋 Test Environment Setup

### Prerequisites:
- ✅ Database with sample orders (paid status)
- ✅ Admin user account
- ✅ Regular user account  
- ✅ ENCRYPTION_KEY environment variable
- ✅ NextAuth configuration

### Test Data Required:
- ✅ Order với multiple products
- ✅ Order với single product
- ✅ User với nhiều orders
- ✅ User chưa có order nào
- ✅ Various product categories (Spotify, Netflix, etc.)

### Tools:
- ✅ Browser DevTools
- ✅ Database client
- ✅ Postman/Thunder Client cho API testing
- ✅ Mobile device emulator

---

**📝 Notes:**
- Chạy test trên multiple browsers (Chrome, Firefox, Safari)  
- Test với different screen sizes
- Verify accessibility (keyboard navigation, screen readers)
- Monitor console for any errors
- Check network tab for API performance
- Validate all Vietnamese text display correctly

**⏱️ Estimated Test Time:** 4-6 giờ cho full test suite