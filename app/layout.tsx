import type { Metadata } from 'next'
import './globals.css'
import SessionProvider from '@/components/providers/SessionProvider'
import NotificationProvider from '@/components/providers/NotificationProvider'
import AnalyticsProvider from '@/components/providers/AnalyticsProvider'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'Premium Account Marketplace',
  description: 'Nền tảng bán tài khoản premium uy tín tại Việt Nam',
  keywords: 'tài khoản premium, YouTube Premium, ChatGPT Plus, Notion Pro',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen">
        <SessionProvider>
          <AnalyticsProvider>
            <NotificationProvider>
              <Header />

              <main className="flex-1">
                {children}
              </main>
            </NotificationProvider>
          </AnalyticsProvider>
          
          <footer className="bg-gray-800 text-white">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <p className="text-sm">
                  © 2024 Premium Account Marketplace. Tất cả quyền được bảo lưu.
                </p>
              </div>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  )
}