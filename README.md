# Premium Account Marketplace

Nền tảng thương mại điện tử bán tài khoản premium cho các dịch vụ số như YouTube Premium, ChatGPT Plus, Notion Pro với giá cả phải chăng.

## Công nghệ sử dụng

- **Frontend:** Next.js 14 (App Router), TypeScript, TailwindCSS
- **Authentication:** NextAuth.js / Firebase Auth
- **Payments:** Stripe, VNPay, Momo
- **Database:** Supabase PostgreSQL với Prisma ORM
- **Localization:** next-i18next (Tiếng Việt)

## Tính năng chính

- ✅ Đăng ký/Đăng nhập (Email + Google OAuth)
- ✅ Danh sách sản phẩm và trang chi tiết
- ✅ Giỏ hàng và thanh toán
- ✅ Dashboard người dùng và admin
- ✅ Hỗ trợ tiếng Việt đầy đủ

## Cài đặt và chạy

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build cho production
npm run build

# Chạy production
npm start
```

## Cấu trúc dự án

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (main)/            # Main application pages
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Reusable components
├── lib/                   # Utility functions
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## Database & MCP

### Supabase Configuration
- **Project ID**: `vbdmsprstoxqgjycbyrv`
- **Database**: PostgreSQL hosted on Supabase
- **Real-time**: Server-Sent Events cho notifications
- **MCP Integration**: Supabase MCP server enabled

### Health Check
```bash
# Kiểm tra tình trạng hệ thống
node scripts/health-check.js
```

### Database Commands
```bash
# Xem database trong Prisma Studio
npx prisma studio

# Migrate database
npx prisma migrate dev

# Seed database
npx prisma db seed

# Reset database
npx prisma migrate reset
```

## Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## License

Dự án này được phát hành dưới MIT License.