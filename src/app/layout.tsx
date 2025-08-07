import type { Metadata } from 'next'
import './globals.css'
import { UserProvider } from '@/contexts/UserContext'

export const metadata: Metadata = {
  title: 'Tennis Player Development',
  description: 'A comprehensive platform for tennis player development and coaching',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  )
}