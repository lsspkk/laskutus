'use client'
import { NpButton } from '@/components/NpButton'
import React from 'react'

export const NpBackButton = (
	{ onClick, text, className = '' }: {
		onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
		text?: string
		className?: string
	},
) => {
	const top = 'top-0 right-0'

	return (
		<NpButton
			className={`fixed ${top} border border-gray-300 shadow-md px-[7px] py-[2px] m-[5px] rounded-full  z-30 ${className}`}
			onClick={onClick}
		>
			{text ?? '<-'}
		</NpButton>
	)
}
