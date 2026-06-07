import type { Metadata } from 'next'
import './globals.css'
import Nav from './components/Nav'

export const metadata: Metadata = {
  title: 'The Internet Atlas',
  description: 'Welcome to the internet. A guide to the best websites and tools — organized by what you want to do.',
  metadataBase: new URL('https://theinternetatlas.com'),
  openGraph: {
    title: 'The Internet Atlas',
    description: 'Welcome to the internet. A guide to the best websites and tools — organized by what you want to do.',
    url: 'https://theinternetatlas.com',
    siteName: 'The Internet Atlas',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main>{children}</main>
        <footer style={{
          borderTop: '0.5px solid var(--border)',
          padding: '2rem 1.5rem',
          marginTop: '4rem',
          textAlign: 'center',
          fontFamily: 'var(--mono)',
          fontSize: '11px',
          color: 'var(--ink-3)',
          letterSpacing: '0.03em',
        }}>
          THE INTERNET ATLAS — A free guide to the internet. No pay-to-play. No ads in listings.
        </footer>
      </body>
    </html>
  )
}
