'use client'
import { NpButton } from '@/components/NpButton'
import { messageAtom } from '@/models/atoms'
import { Order, OrderItem, Product, uuidGenerator } from '@/models/models'
import React from 'react'
import { useRecoilState } from 'recoil'
import { NpSubTitle } from '../../components/NpTitle'

export const OrderBox = ({ order, index, onDeleteOrder }: { order: Order; index: number; onDeleteOrder: () => void }) => {
	const shortDate = toShortDate(order.deliveryDate)

	return (
		<div className='flex flex-col gap-4 border border-gray-400 p-2'>
			{order.items && (
				<div className='flex flex-col gap-2'>
					<div className='flex flex-row gap-4 justify-between'>
						<NpSubTitle>{shortDate}</NpSubTitle>
						<NpButton tabIndex={-1} variant='secondary' onClick={onDeleteOrder}>Poista</NpButton>
					</div>

					{order.items.map((item) => <OrderItemBox key={item.id} item={item} order={order} />)}
				</div>
			)}
		</div>
	)
}
export const toShortDate = (date?: string) => {
	if (!date) {
		return ''
	}
	const parts = date.split('.')
	return `${parts[0]}.${parts[1]}.`
}
const RowLabel = ({ children }: { children: React.ReactNode }) => {
	return <div className='text-xs text-gray-500'>{children}</div>
}
const OrderItemBox = ({ item, order }: { item: OrderItem; order: Order }) => {
	return (
		<div className='border border-gray-400 p-2'>
			<div className='flex flex-row gap-8 justify-start'>
				<div className='flex flex-col gap-0'>
					<RowLabel>Tuotenumero</RowLabel>
					<InvoiceData value={item.eanCode} />
				</div>
				<div className='flex flex-col gap-0'>
					<RowLabel>Tuotenimi</RowLabel>
					<InvoiceData className='w-40' value={item.product?.name} />
				</div>
				<div className='flex flex-col gap-0'>
					<RowLabel>Määrä</RowLabel>
					<InvoiceData className='w-20' value={item.amount.toFixed(0)} />
				</div>
				<div className='flex flex-col gap-0'>
					<RowLabel>Yksikkö</RowLabel>
					<InvoiceData className='w-20' value='kpl' />
				</div>
				<div className='flex flex-col gap-0'>
					<RowLabel>Hinta</RowLabel>
					<InvoiceData className='w-20' value={item.product?.priceNoTax?.toFixed(2).replace('.', '.')} />
				</div>
				<div className='flex flex-col gap-0'>
					<RowLabel>ALV%</RowLabel>
					<InvoiceData className='w-20' value='14' />
				</div>
				<div className='flex flex-col gap-0'>
					<RowLabel>Ostotilauksen Päivämäärä</RowLabel>
					<InvoiceData value={order.deliveryDate} />
				</div>
				<div className='flex flex-col gap-0'>
					<RowLabel>Ostotilauksen numero</RowLabel>
					<InvoiceData value={order.orderNumber} />
				</div>
			</div>
		</div>
	)
}
const InvoiceData = ({ value = '', className = '' }: { value?: string; className?: string }) => {
	const [, setMessage] = useRecoilState<string>(messageAtom)

	const copyAndChooseNext = (e: React.KeyboardEvent<HTMLDivElement>) => {
		console.debug({ key: e.key })
		if (e.key === 'Tab') {
			const text = e.currentTarget.textContent
			if (text) {
				navigator.clipboard.writeText(text).then(() => {
					setMessage(`Kopioitu leikepöydälle: ${text}`)
					setTimeout(() => setMessage(''), 3000)
				})
			}
			document.getElementsByTagName('div')[e.currentTarget.tabIndex + 1].focus()
		}
	}

	return (
		<div
			className={`w-40 focus:border-[2px] focus:-ml-[2px] focus:-my-[1px] focus:pl-[2px] focus:border-cyan-600 ${className}`}
			tabIndex={0}
			onKeyDown={copyAndChooseNext}
		>
			{value}
		</div>
	)
}
export const extractOrderNumber = (text: string) => {
	const row = text.split('\n').find((line) => line.includes('Tilausnumero'))
	return row?.split(':')[1].trim()
}
export const extractDeliveryDate = (text: string) => {
	const row = text.split('\n').find((line) => line.includes('Toimituspäivä'))
	return row?.split(':')[1].trim()
}
const extractItemRows = (text: string) => {
	const rows = text.split('\n').slice(8)
	const itemsRows = []
	let parseRow = false
	for (const row of rows) {
		if (row.startsWith('Rivi')) {
			parseRow = true
			continue
		}
		if (parseRow && row.trim().length > 0) {
			itemsRows.push(row)
		}
	}
	return itemsRows
}
export const extractItems = (text: string, products: Product[]): OrderItem[] => {
	const itemRows = extractItemRows(text)
	const items: OrderItem[] = itemRows.map((row) => {
		const columns = row.split('\t')
		return {
			id: uuidGenerator(),
			eanCode: columns[1],
			amount: parseInt(columns[4]),
			product: products.find((product) => product.eanCode === columns[1]),
		}
	})
	return items
}
