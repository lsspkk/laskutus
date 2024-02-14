import React from 'react'

export const NpTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`text-2xl font-bold text-gray-500 text-shadow-sm shadow-sky-100 ${className}`}>
      {children}
    </div>
  )
}

export const NpSubTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`text-xl font-bold text-gray-500 text-shadow-sm shadow-sky-100 ${className}`}>
      {children}
    </div>
  )
}
