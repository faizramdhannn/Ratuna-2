import './globals.css'

export const metadata = {
  title: 'Ratuna',
  icons: "/Logo_Ratuna.png",
  description: 'Dashboard Ratuna',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  )
}