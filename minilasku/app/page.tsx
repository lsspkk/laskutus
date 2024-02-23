import { NpButton } from '@/components/NpButton'
import Link from 'next/link'
import React from 'react'
import { NpMain } from '../components/NpMain'

export default function Home() {
	return (
		<NpMain title='Laskun kasausohjelma'>
			<div className='flex flex-row gap-6'>
				<Link href='/tuotteet'>
					<NpButton>Tuotteet</NpButton>
				</Link>
				<Link href='/vanhat-laskut'>
					<NpButton>Vanhat Laskut</NpButton>
				</Link>
				<Link href='/uusi-lasku'>
					<NpButton>Uusi Lasku</NpButton>
				</Link>
			</div>

			<div className='flex flex-col self-end justify-self-end opacity-30 text-xs font-mono'>
				<div>Ohjelman versiot</div>

				<div>1.1 - 23.2.2024</div>
				<div>1.0 - 4.2.2024</div>
			</div>
		</NpMain>
	)
}
