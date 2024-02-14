'use client'

import { NpBackButton } from '@/components/NpBackButton'
import { NpMain } from '@/components/NpMain'
import { useRouter } from 'next/navigation'
import React from 'react'
import { NpSubTitle } from '../../components/NpTitle'

export default function Home() {
  const router = useRouter()

  return (
    <NpMain title='Tuotteet'>
      <NpBackButton onClick={() => router.push('/')} />

      <NpSubTitle>Vanhat laskut</NpSubTitle>

      <div className='text-indigo-300'>Toiminnallisuus kesken</div>
    </NpMain>
  )
}
