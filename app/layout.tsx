import './globals.css'
import type { Metadata, Viewport } from 'next'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'

export const metadata: Metadata = {
  title: 'Nupoo — blokový editor',
  description: 'Rychlý lokální Notion-like blokový editor.',
  applicationName: 'Nupoo',
  manifest: '/nupoo/manifest.webmanifest',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#09090b',
}

const themeInit = `(() => { try { const saved = localStorage.getItem('nupoo.theme'); const dark = saved === null ? true : saved === 'dark'; document.documentElement.classList.toggle('dark', dark); document.documentElement.style.colorScheme = dark ? 'dark' : 'light'; } catch (_) { document.documentElement.classList.add('dark'); document.documentElement.style.colorScheme = 'dark'; } })()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
