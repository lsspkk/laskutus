'use client'
import React, { HTMLAttributes } from 'react'

export const NpIconButton = ({
  children,
  ...props
}: { children: React.ReactNode } & HTMLAttributes<HTMLButtonElement>) => {
  return (
    <button className='rounded-full bg-amber-50 p-1 self-center' {...props}>
      {children}
    </button>
  )
}
