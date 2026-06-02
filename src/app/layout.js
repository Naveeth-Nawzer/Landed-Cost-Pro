import { Hanken_Grotesk } from 'next/font/google'
import './globals.css'

const hankenGrotesk = Hanken_Grotesk({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hanken-grotesk',
})

export const metadata = {
  title: 'Landed Cost Pro',
  description: 'Precision Finance Dashboard for Landed Cost Calculation',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light">
      <head>
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
        />
      </head>
      <body className={hankenGrotesk.className}>
        {children}
      </body>
    </html>
  )
}