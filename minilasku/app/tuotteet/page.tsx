'use client'

import { NpBackButton } from '@/components/NpBackButton'
import { NpMain } from '@/components/NpMain'
import { productAtom } from '@/models/atoms'
import { Product } from '@/models/models'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useRecoilValue } from 'recoil'
import { NpSubTitle } from '../../components/NpTitle'

export default function Home() {
  const router = useRouter()
  const products: Product[] = useRecoilValue(productAtom)

  return (
    <NpMain title='Tuotteet'>
      <NpBackButton onClick={() => router.push('/')} />

      <NpSubTitle>Tuotteet</NpSubTitle>

      {/* <NpButton onClick={() => router.push('/tuotteet/create')}>Luo uusi tuote</NpButton> */}

      <div className='flex flex-col gap-4 w-8/12'>
        {products?.map((product) => (
          <div key={product.id} className='flex gap-8 w-full justify-start'>
            <div className='w-1/4'>{product.name}</div>
            <div className='w-3/12'>ean: {product.eanCode}</div>
            <div className='w-2/12'>hinta: {product.priceNoTax}</div>
            <div className='w-2/12'>hinta(alv): {product.priceTax?.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </NpMain>
  )
}
