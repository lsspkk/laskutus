'use client'

import { NpBackButton } from '@/components/NpBackButton'
import { NpButton } from '@/components/NpButton'
import { NpDialog } from '@/components/NpDialog'
import { NpMain } from '@/components/NpMain'
import { NpTextArea } from '@/components/NpTextarea'
import { NpToast } from '@/components/NpToast'
import { orderAtom, productAtom } from '@/models/atoms'
import { createOrder, Order, OrderItem, Product, uuidGenerator } from '@/models/models'
import { assert, error } from 'console'
import { set } from 'mongoose'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { NpSubTitle } from '../../components/NpTitle'

export type ManagingSection = 'NONE' | 'LOGIN' | 'MANAGE'

export default function Home({ params }: { params: { archiveId: string } }) {
	const router = useRouter()
	const products: Product[] = useRecoilValue(productAtom)
	const [orders, setOrders] = useRecoilState<Order[]>(orderAtom)
	const [newOrderText, setNewOrderText] = React.useState('')
	const [errors, setErrors] = React.useState<string[]>([])
	const [showClearOrdersDialog, setShowClearOrdersDialog] = React.useState(false)

	const readOrder = async () => {
		console.log('readOrder', newOrderText)

		try {
			const newOrder: Order = createOrder(newOrderText)
			newOrder.items = extractItems(newOrderText, products)
			newOrder.orderNumber = extractOrderNumber(newOrderText)
			newOrder.deliveryDate = extractDeliveryDate(newOrderText)

			setOrders([...orders, newOrder])
			setNewOrderText('')
		} catch (e: any) {
			setErrors([...errors, e.message])
			setTimeout(() => setErrors(errors.filter((error) => error !== e.message)), 3000)
		}
	}
	const clearOrders = () => {
		setOrders([])
		setShowClearOrdersDialog(false)
	}

	return (
		<NpMain title='Uusi lasku'>
			<NpBackButton onClick={() => router.push('/')} />

			{showClearOrdersDialog && (
				<NpDialog onClose={() => setShowClearOrdersDialog(false)}>
					<div className='flex flex-col gap-4'>
						<div>Oletko varma, että haluat tyhjentää tilaukset?</div>
						<div className='flex flex-row gap-4 justify-between'>
							<NpButton variant='secondary' onClick={() => setShowClearOrdersDialog(false)}>Peruuta</NpButton>
							<NpButton onClick={clearOrders}>Kyllä</NpButton>
						</div>
					</div>
				</NpDialog>
			)}

			<NpSubTitle>Lisää laskun tilaukset</NpSubTitle>

			{errors && (
				<NpToast onClose={() => setErrors([])}>
					<div>{errors.join(', ')}</div>
				</NpToast>
			)}

			<div className='flex flex-col gap-6 w-full'>
				<NpTextArea
					rows={10}
					placeholder='Copy pastaa tähän sähköpostitilaus, ja klikkaa Lisää tilaus -nappia.'
					value={newOrderText}
					onChange={(e) => setNewOrderText(e.target.value)}
				/>

				<div className='flex flex-row gap-24 w-full justify-end'>
					<NpButton variant='secondary' onClick={() => setShowClearOrdersDialog(true)}>Tyhjennä tilaukset</NpButton>
					<NpButton onClick={readOrder}>Lisää tilaus</NpButton>
				</div>
			</div>

			<NpSubTitle className='mt-10'>Tilauksia: {orders?.length || 0} kpl</NpSubTitle>
			<div className='flex flex-col gap-4 mt-2'>
				{orders?.map((order, index) => <OrderBox key={order.id} order={order} index={index} />)}
			</div>
		</NpMain>
	)
}

const OrderBox = ({ order, index }: { order: Order; index: number }) => {
	const shortDateParts = order.deliveryDate?.split('.')
	const shortDate = shortDateParts?.length === 3 ? `${shortDateParts[0]}.${shortDateParts[1]}.` : ''

	return (
		<div className='flex flex-col gap-4 border border-gray-400 p-2'>
			{order.items && (
				<div className='flex flex-col gap-2'>
					<NpSubTitle>{shortDate}</NpSubTitle>
					{order.items.map((item) => <OrderItemBox key={item.id} item={item} order={order} />)}
				</div>
			)}
		</div>
	)
}

const RowLabel = ({ children }: { children: React.ReactNode }) => {
	return <div className='text-xs text-gray-500'>{children}</div>
}

const OrderItemBox = ({ item, order }: { item: OrderItem; order: Order }) => {
	return (
		<div className='border border-gray-400 p-2'>
			<div className='flex flex-row gap-8 '>
				<div className='flex flex-col gap-0'>
					<RowLabel>Tuotenumero</RowLabel>
					<div>{item.eanCode}</div>
				</div>
				<div className='flex flex-col gap-0'>
					<RowLabel>Tuotenimi</RowLabel>
					<div className='w-40'>{item.product?.name}</div>
				</div>
				<div className='flex flex-col gap-0'>
					<RowLabel>Määrä</RowLabel>
					<div>{item.amount}</div>
				</div>
				<div className='flex flex-col gap-0'>
					<RowLabel>Hinta</RowLabel>
					<div>{item.product?.priceNoTax?.toFixed(2).replace('.', ',')}</div>
				</div>
				<div className='flex flex-col gap-0'>
					<RowLabel>Ostotilauksen Päivämäärä</RowLabel>
					<div>{order.deliveryDate}</div>
				</div>
				<div className='flex flex-col gap-0'>
					<RowLabel>Ostotilauksen numero</RowLabel>
					<div>{order.orderNumber}</div>
				</div>
			</div>
		</div>
	)
}

const extractOrderNumber = (text: string) => {
	const row = text.split('\n').find((line) => line.includes('Tilausnumero'))
	return row?.split(':')[1].trim()
}

const extractDeliveryDate = (text: string) => {
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
const extractItems = (text: string, products: Product[]): OrderItem[] => {
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
