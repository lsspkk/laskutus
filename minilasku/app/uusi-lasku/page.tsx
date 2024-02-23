'use client'

import { NpBackButton } from '@/components/NpBackButton'
import { NpButton } from '@/components/NpButton'
import { NpDialog } from '@/components/NpDialog'
import { NpMain } from '@/components/NpMain'
import { NpTextArea } from '@/components/NpTextarea'
import { NpToast } from '@/components/NpToast'
import { messageAtom, orderAtom, productAtom } from '@/models/atoms'
import { createOrder, Order, Product } from '@/models/models'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { NpSubTitle } from '../../components/NpTitle'
import { extractDeliveryDate, extractItems, extractOrderNumber, OrderBox, toShortDate } from './OrderBox'

export type DialogType = 'NONE' | 'CLEAR_ORDERS' | 'SAVE' | 'LOAD'

export default function Home() {
	const router = useRouter()
	const products: Product[] = useRecoilValue(productAtom)
	const [orders, setOrders] = useRecoilState<Order[]>(orderAtom)
	const [newOrderText, setNewOrderText] = React.useState('')
	const [errors, setErrors] = React.useState<string[]>([])
	const [dialog, setDialog] = React.useState<DialogType>('NONE')
	const fileRef = React.useRef<HTMLInputElement>(null)
	const [message, setMessage] = useRecoilState<string>(messageAtom)
	const [hideInput, setHideInput] = React.useState(false)

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
			setTimeout(() => setErrors(errors.filter((error) => error !== e.message)), 5000)
		}
	}
	const onClearOrders = () => {
		setOrders([])
		setDialog('NONE')
	}

	const onSave = () => {
		const shortDates = orders.map((order) => toShortDate(order.deliveryDate)).join('_')
		const dataToSave = JSON.stringify(orders)
		const file = new Blob([dataToSave], { type: 'text/plain' })
		const url = URL.createObjectURL(file)
		const a = document.createElement('a')
		a.href = url
		a.download = `laskurivit_${shortDates}.json`
		a.click()
		URL.revokeObjectURL(url)
		document.removeChild(a)
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
				const orders = JSON.parse(text as string) as Order[]
				orders.sort((a, b) => {
					const aDate = a.deliveryDate ?? ''
					const bDate = b.deliveryDate ?? ''
					return aDate.localeCompare(bDate)
				})
				orders.forEach((order) => {
					order.items.forEach((item) => {
						item.product = products.find((product) => product.eanCode === item.eanCode)
					})
				})
				setOrders(orders)
			} catch (e: any) {
				setErrors([...errors, 'Tiedoston lataus epäonnistui', e.message])
				setTimeout(() => setErrors(errors.filter((error) => error !== e.message)), 5000)
			}
		}
		reader.readAsText(file)
	}

	const onDeleteOrder = (index: number) => {
		const newOrders = orders.filter((order, i) => i !== index)
		setTimeout(() => setOrders(newOrders), 100)
	}

	return (
		<NpMain title='Uusi lasku'>
			<NpBackButton onClick={() => router.push('/')} />
			{errors.length > 0 && (
				<NpToast onClose={() => setErrors([])}>
					{errors.map((error, index) => (
						<div className='rounded-sm bg-red-200 p-4 min-w-[400px]' key={`error-${index}-${error}`}>{error}</div>
					))}
				</NpToast>
			)}
			{message.length > 0 && (
				<NpToast variant='info' onClose={() => setMessage('')}>
					<div className='p-4 min-w-[400px]'>{message}</div>
				</NpToast>
			)}

			{dialog === 'CLEAR_ORDERS' && <ClearOrdersDialog onClose={() => setDialog('NONE')} onClearOrders={onClearOrders} />}
			{dialog === 'SAVE' && <SaveDialog onClose={() => setDialog('NONE')} onSave={onSave} />}

			<div className='flex flex-row gap-4 w-full justify-between items-center'>
				<NpSubTitle>Lisää laskun tilaukset</NpSubTitle>
				<NpTick label='Piilota syöttökenttä' checked={hideInput} onChange={() => setHideInput(!hideInput)} />
			</div>

			{hideInput === false && (
				<div className='flex flex-col gap-6 w-full'>
					<NpTextArea
						rows={10}
						placeholder='Copy pastaa tähän sähköpostitilaus, ja klikkaa Lisää tilaus -nappia.'
						value={newOrderText}
						onChange={(e) => setNewOrderText(e.target.value)}
					/>

					<div className='flex flex-row gap-4 w-full justify-end'>
						<NpButton variant='secondary' onClick={onLoad}>
							Lataa
							<input type='file' id='file' onChange={(e) => onLoadFileContent(e)} ref={fileRef} className='hidden' />
						</NpButton>
						<NpButton variant='secondary' onClick={() => setDialog('SAVE')}>Tallenna</NpButton>
						<NpButton variant='secondary' onClick={() => setDialog('CLEAR_ORDERS')}>Tyhjennä</NpButton>
						<NpButton className='ml-20' onClick={readOrder}>Lisää tilaus</NpButton>
					</div>
				</div>
			)}

			<div className='flex gap-12 mt-10 items-start'>
				<NpSubTitle className='self-start'>Tilauksia: {orders?.length || 0} kpl</NpSubTitle>
				<OrderTotal orders={orders} />
			</div>
			<div className='flex flex-col gap-4 mt-2'>
				{orders?.map((order, index) => (
					<OrderBox
						key={order.id}
						order={order}
						orderIndex={index}
						onDeleteOrder={() => onDeleteOrder(index)}
					/>
				))}
			</div>
		</NpMain>
	)
}

const NpTick = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => {
	const id = label.toLowerCase().replace(' ', '_')
	return (
		<div className='flex flex-row gap-2 items-center'>
			<input id={label} type='checkbox' checked={checked} onChange={onChange} />
			<label htmlFor={id} onClick={onChange}>{label}</label>
		</div>
	)
}

const OrderTotal = ({ orders }: { orders: Order[] }) => {
	const totalWithoutTax = orders.reduce((acc, order) => {
		return (acc + order.items.reduce((acc, item) => {
			return acc + (item.product?.priceNoTax || 0) * item.amount
		}, 0))
	}, 0)
	const tax = totalWithoutTax * 0.14
	const total = totalWithoutTax * 1.14

	if (totalWithoutTax === 0) {
		return <div></div>
	}
	return (
		<div className='flex flex-col gap-1 text-sm'>
			<table>
				<tr>
					<td className='pr-2'>Yhteensä ilman alv</td>
					<td className='text-right'>{totalWithoutTax.toFixed(2).replace('.', ',')} €</td>
				</tr>
				<tr>
					<td className='pr-2'>ALV 24%</td>
					<td className='text-right'>{tax.toFixed(2).replace('.', ',')} €</td>
				</tr>
				<tr>
					<td>Yhteensä</td>
					<td className='text-right'>{total.toFixed(2).replace('.', ',')} €</td>
				</tr>
			</table>
		</div>
	)
}
const ClearOrdersDialog = ({ onClose, onClearOrders }: { onClose: () => void; onClearOrders: () => void }) => {
	return (
		<NpDialog onClose={onClose}>
			<div className='flex flex-col gap-4'>
				<div>Oletko varma, että haluat tyhjentää tilaukset?</div>
				<div className='flex flex-row gap-4 justify-between'>
					<NpButton variant='secondary' onClick={onClose}>Peruuta</NpButton>
					<NpButton onClick={onClearOrders}>Kyllä</NpButton>
				</div>
			</div>
		</NpDialog>
	)
}

const SaveDialog = ({ onClose, onSave }: { onClose: () => void; onSave: () => void }) => {
	const orders = useRecoilValue<Order[]>(orderAtom)

	const shortDates = orders.map((order) => toShortDate(order.deliveryDate)).join('_')
	const fileName = `laskurivit_${shortDates}.json`
	return (
		<NpDialog onClose={onClose}>
			<div className='flex flex-col gap-4'>
				<div>Tallennetaanko tilaukset?</div>

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
