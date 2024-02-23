'use client'

import { NpBackButton } from '@/components/NpBackButton'
import { NpButton } from '@/components/NpButton'
import { NpDialog } from '@/components/NpDialog'
import { NpMain } from '@/components/NpMain'
import { NpToast } from '@/components/NpToast'
import { messageAtom, productAtom } from '@/models/atoms'
import { Product } from '@/models/models'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useRecoilState } from 'recoil'
import { NpSubTitle } from '../../components/NpTitle'

type DialogType = 'NONE' | 'SAVE'

export default function Home() {
	const router = useRouter()
	const [products, setProducts] = useRecoilState<Product[]>(productAtom)
	const [message, setMessage] = useRecoilState<string>(messageAtom)
	const fileRef = React.useRef<HTMLInputElement>(null)
	const [errors, setErrors] = React.useState<string[]>([])
	const [dialog, setDialog] = React.useState<DialogType>('NONE')

	const updateProductName = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
		const newProducts = products.map((product) => {
			if (product.id === id) {
				return { ...product, name: e.target.value }
			}
			return product
		})
		setProducts(newProducts)
	}

	const updateProductEanCode = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
		const newProducts = products.map((product) => {
			if (product.id === id) {
				return { ...product, eanCode: e.target.value }
			}
			return product
		})
		setProducts(newProducts)
	}

	const updatePriceNoTax = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
		const newProducts = products.map((product) => {
			if (product.id === id) {
				const priceNoTax = parseFloat(e.target.value)
				const priceTax = Number((product.priceNoTax * 1.14).toFixed(2))
				return { ...product, priceNoTax, priceTax }
			}
			return product
		})
		setProducts(newProducts)
	}

	const onSave = () => {
		const shortDate = new Date().toISOString().split('T')[0]
		const dataToSave = JSON.stringify(products)
		const file = new Blob([dataToSave], { type: 'text/plain' })
		const url = URL.createObjectURL(file)
		const a = document.createElement('a')
		a.href = url
		a.download = `tuotteet_${shortDate}.json`
		a.click()
		URL.revokeObjectURL(url)
		try {
			document.removeChild(a)
		} catch (e: any) {
			console.log('error removing child', e.message)
		}
		setDialog('NONE')
	}

	const onLoad = () => {
		fileRef.current?.click()
		document.getElementById('file')?.click()
	}
	const onLoadFileContent = (e: any) => {
		const file = e.target.files[0]
		const reader = new FileReader()
		reader.onload = function(e) {
			const text = e.target?.result
			console.log('loaded file text', text)
			try {
				const products = JSON.parse(text as string) as Product[]
				setProducts(products)
			} catch (e: any) {
				setErrors([...errors, 'Tiedoston lataus epäonnistui', e.message])
				setTimeout(() => setErrors(errors.filter((error) => error !== e.message)), 5000)
			}
		}
		reader.readAsText(file)
	}

	return (
		<NpMain title='Tuotteet'>
			<NpBackButton onClick={() => router.push('/')} />

			{message.length > 0 && <NpToast variant='info' onClose={() => setMessage('')}>{message}</NpToast>}

			{errors.length > 0 && (
				<NpToast variant='error' onClose={() => setErrors([])}>{errors.map((error, index) => <div key={index}>{error}</div>)}</NpToast>
			)}

			<div className='flex flex-row gap-8 w-full justify-end'>
				<NpButton variant='secondary' onClick={onLoad}>
					Lataa
					<input type='file' id='file' onChange={(e) => onLoadFileContent(e)} ref={fileRef} className='hidden' />
				</NpButton>
				<NpButton variant='secondary' onClick={() => setDialog('SAVE')}>Tallenna</NpButton>
				<NpButton className='ml-20' onClick={() => router.push('/tuotteet/uusi')}>Lisää tuote</NpButton>
			</div>

			{dialog === 'SAVE' && <SaveProductsDialog onClose={() => setDialog('NONE')} onSave={onSave} />}

			<NpSubTitle>Tuotteiden muokkaus</NpSubTitle>

			{products?.map((product) => (
				<div key={product.id} className='flex gap-8 w-full justify-between'>
					<div className='flex flex-col gap-2 justify-start'>
						<label htmlFor='name' className='text-sm opacity-50 w-full'>Nimi</label>
						<input className='w-full' id='name' type='text' value={product.name} onChange={(e) => updateProductName(e, product.id)} />
					</div>
					<div className='flex flex-col gap-2 justify-start'>
						<label htmlFor='eanCode' className='text-sm opacity-50 w-full'>EAN-koodi</label>

						<input className='w-full' id='eanCode' onChange={(e) => updateProductEanCode(e, product.id)} value={product.eanCode} />
					</div>
					<div className='flex flex-col gap-2 justify-start'>
						<label htmlFor='priceNoTax' className='text-sm opacity-50 w-full'>Hinta (ilman alv:tä)</label>
						<input className='w-full' id='priceNoTax' onChange={(e) => updatePriceNoTax(e, product.id)} value={product.priceNoTax} />
					</div>
					<div className='flex flex-col gap-2 justify-start w-2/12'>
						<label htmlFor='priceTax' className='text-sm opacity-50 w-full'>hinta(alv 14%)</label>
						<input className='w-full' id='priceTax' value={product.priceTax?.toFixed(2)} disabled />
					</div>
					<div className='flex items-center justify-center'>
						<NpButton
							variant='secondary'
							className='text-xs py-1 px-1'
							onClick={() => {
								const newProducts = products.filter((p) => p.id !== product.id)
								setProducts(newProducts)
							}}
						>
							Poista
						</NpButton>
					</div>
				</div>
			))}
		</NpMain>
	)
}

const SaveProductsDialog = ({ onClose, onSave }: { onClose: () => void; onSave: () => void }) => {
	const shortDate = new Date().toISOString().split('T')[0]

	const fileName = `tuotteet_${shortDate}.json`
	return (
		<NpDialog onClose={onClose}>
			<div className='flex flex-col gap-4'>
				<div>Tallennetaanko tuotteet?</div>

				<div className='mt-2 -mb-2'>Tiedoston nimi</div>
				<div className='mb-2 opacity-80 text-xs'>{fileName}</div>
				<div className='flex flex-row gap-4 justify-between'>
					<NpButton variant='secondary' onClick={onClose}>Peruuta</NpButton>
					<NpButton onClick={onSave}>Tallenna</NpButton>
				</div>
			</div>
		</NpDialog>
	)
}
