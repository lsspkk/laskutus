'use client'
import { SWRConfig } from 'swr'
import { useRouter, usePathname } from 'next/navigation'

export const SWRProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const pathname = usePathname() || ''
  return (
    <SWRConfig
      value={{
        onError: (error, key) => {
          if (error.status === 401 || error.status === 403) {
            router.push(`/login?pathname=${encodeURIComponent(pathname)}`)
          }
        },
      }}
    >
      {children}
    </SWRConfig>
  )
}
