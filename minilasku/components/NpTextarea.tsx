import React from 'react'

export const NpTextArea = ({
  label,
  value,
  onChange,
  placeholder,
  className,
  ...props
}: {
  label?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  className?: string
  [x: string]: any
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && <label className=''>{label}</label>}
      <textarea
        className='px-[2px] focus:border focus:border-cyan-300 focus-visible:border-cyan-300 focus-visible:border'
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  )
}
