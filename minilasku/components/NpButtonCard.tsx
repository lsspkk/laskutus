'use client'

import React from 'react'

const ButtonCard = ({
  children,
  ref,
  ...props
}: {
  children?: React.ReactNode
  ref?: React.Ref<HTMLDivElement>
} & React.HTMLAttributes<HTMLDivElement>) => {
  const hover = props.onClick ? 'hover:bg-cyan-600 hover:text-white cursor-pointer' : ''
  return (
    <div ref={ref} {...props} className={`rounded-sm shadow-md p-2 flex border border-gray-400 w-full ${hover}`}>
      {children}
    </div>
  )
}

export const NpButtonCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(ButtonCard)
