'use client'

import './globals.css'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Inter } from 'next/font/google'
import { RecoilRoot } from 'recoil'
import { SWRProvider } from './swr-provider'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='fi'>
			<body className={inter.className}>
				<RecoilRoot>
					<SWRProvider>{children}</SWRProvider>
					<SpeedInsights />
				</RecoilRoot>
			</body>
		</html>
	)
}
