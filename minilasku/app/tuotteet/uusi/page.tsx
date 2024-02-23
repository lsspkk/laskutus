'use client'

import { NpBackButton } from '@/components/NpBackButton'
import { NpButton } from '@/components/NpButton'
import { NpMain } from '@/components/NpMain'
import { NpSubTitle } from '@/components/NpTitle'
import { messageAtom, productAtom } from '@/models/atoms'
import { createProduct, Product } from '@/models/models'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useRecoilState } from 'recoil'

export default function Home() {
	const router = useRouter()
	const [products, setProducts] = useRecoilState<Product[]>(productAtom)
	const [product, setProduct] = useState<Product>(createProduct())
	const [, setMessage] = useRecoilState<string>(messageAtom)

	const updateProductName = (e: React.ChangeEvent<HTMLInputElement>) => {
		setProduct({ ...product, name: e.target.value })
	}

	const updateProductEanCode = (e: React.ChangeEvent<HTMLInputElement>) => {
		setProduct({ ...product, eanCode: e.target.value })
	}

	const updatePriceNoTax = (e: React.ChangeEvent<HTMLInputElement>) => {
		const n = parseFloat(e.target.value) ?? 0
		const priceNoTax = Number(n.toFixed(2))
		const priceTax = Number((priceNoTax * 1.14).toFixed(2))
		setProduct({ ...product, priceNoTax, priceTax })
	}

	const onAddProduct = () => {
		setProducts([...products, product])
		setMessage('Tuote lisätty')
		setTimeout(() => setMessage(''), 5000)
		router.push('/tuotteet')
	}

	return (
		<NpMain title='Uusi Tuote'>
			<NpBackButton onClick={() => router.back()} />

			<div className='flex flex-col gap-4 w-full justify-center items-center'>
				<div key={product.id} className='flex flex-col gap-8 w-4/12 min-w-[400px]'>
					<NpSubTitle>Lisää uusi tuote</NpSubTitle>
					<div className='w-full flex justify-stretch'>
						<label htmlFor='name' className='w-40'>Nimi</label>
						<input className='ml-4 w-full' id='name' type='text' value={product.name} onChange={updateProductName} />
					</div>
					<div className='w-full flex justify-stretch'>
						<label htmlFor='eanCode' className='w-40'>EAN-koodi</label>

						<input className='ml-4 w-full' id='eanCode' onChange={updateProductEanCode} value={product.eanCode} />
					</div>
					<div className='w-full flex justify-stretch'>
						<label htmlFor='priceNoTax' className='w-40'>
							Hinta<br />(ilman alv:tä)
						</label>
						<input className='ml-4 w-full' id='priceNoTax' onChange={updatePriceNoTax} value={product.priceNoTax} />
					</div>
					<div className='w-full flex justify-stretch'>
						<label htmlFor='priceTax' className='w-40'>hinta(alv 14%)</label>
						<input className='ml-4 w-full' id='priceTax' value={product.priceTax?.toFixed(2)} disabled />
					</div>
					<div className='flex gap-8 w-full justify-end'>
						<NpButton variant='secondary' onClick={() => router.push('/tuotteet')}>Peruuta</NpButton>
						<NpButton onClick={onAddProduct}>Lisää tuote</NpButton>
					</div>
				</div>
			</div>
		</NpMain>
	)
}
