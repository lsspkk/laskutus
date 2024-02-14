'use client'
import React from 'react'

export const NpToast = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000)
    return () => clearTimeout(timer)
  }, [onClose])
  return (
    <div
      className={`fixed bottom-4 right-4 bg-gray-100 p-4 rounded-lg shadow-lg flex items-center gap-4 transition-opacity duration-500`}
    >
      {children}
    </div>
  )
}
