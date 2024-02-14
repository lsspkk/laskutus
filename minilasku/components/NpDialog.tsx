'use client'
import React from 'react'

export const NpDialog = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => {
  return (
    <React.Fragment>
      <div
        className='fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 flex justify-center items-center'
        onClick={onClose}
      />

      <div className='fixed top-20 left-0 flex justify-center w-full'>
        <div className='bg-white rounded-md shadow-md p-6 max-w-md'>{children}</div>
      </div>
    </React.Fragment>
  )
}
