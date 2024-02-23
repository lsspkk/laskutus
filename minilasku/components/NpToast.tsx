'use client'
import React from 'react'

export const NpToast = (
	{ children, onClose, variant = 'error' }: { children: React.ReactNode; onClose: () => void; variant?: 'error' | 'info' },
) => {
	React.useEffect(() => {
		const timer = setTimeout(() => onClose(), 3000)
		return () => clearTimeout(timer)
	}, [onClose])
	const variantClassName = variant === 'error' ? 'bottom-4 bg-red-200 p-4' : 'top-4 bg-blue-100 p-2'
	return (
		<div className={`fixed ${variantClassName} right-4 rounded-lg shadow-lg flex items-center gap-4 transition-opacity duration-500`}>
			{children}
		</div>
	)
}
