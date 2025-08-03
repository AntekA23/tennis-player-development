import type { Metadata } from 'next'
import './globals.css'

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
        {children}
      </body>
    </html>
  )
}