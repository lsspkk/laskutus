'use client'
import { NpButton } from '@/components/NpButton'
import { messageAtom, orderAtom } from '@/models/atoms'
import { Order, OrderItem } from '@/models/models'
import React from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { NpSubTitle } from '../../components/NpTitle'

export const OrderBox = ({ order, orderIndex, onDeleteOrder }: { order: Order; orderIndex: number; onDeleteOrder: () => void }) => {
	const shortDate = toShortDate(order.deliveryDate)

	return (
		<div className='flex flex-col gap-4 border border-gray-400 p-2'>
			{order.items && (
				<div className='flex flex-col gap-2'>
					<div className='flex flex-row gap-4 justify-between'>
						<NpSubTitle>{shortDate}</NpSubTitle>
						<NpButton tabIndex={-1} variant='secondary' onClick={onDeleteOrder}>Poista</NpButton>
					</div>

					{order.items.map((item, itemIndex) => (
						<OrderItemBox
							key={item.id}
							item={item}
							order={order}
							nextItemIndex={itemIndex + 1 === order.items.length ? -1 : itemIndex + 1}
							orderIndex={orderIndex}
						/>
					))}
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
const OrderItemBox = (
	{ item, order, nextItemIndex, orderIndex }: { item: OrderItem; order: Order; nextItemIndex: number; orderIndex: number },
) => {
	const orders = useRecoilValue(orderAtom)
	const nextOrderIndex = orderIndex + 1 === orders.length ? 0 : orderIndex + 1
	const nextRowId = nextItemIndex === -1 ? orders[nextOrderIndex].items[0].id : orders[orderIndex].items[nextItemIndex].id
	const { id } = item

	return (
		<div className='border border-gray-400 p-2'>
			<div className='flex flex-row gap-8 justify-start'>
				<div className='flex flex-col gap-0'>
					<RowLabel>Tuotenumero</RowLabel>
					<InvoiceData value={item.eanCode} id={id} dataIndex={0} />
				</div>
				<div className='flex flex-col gap-0'>
					<RowLabel>Tuotenimi</RowLabel>
					<InvoiceData className='w-40' value={item.product?.name} id={id} dataIndex={1} />
				</div>
				<div className='flex flex-col gap-0'>
					<RowLabel>Määrä</RowLabel>
					<InvoiceData className='w-20' value={item.amount.toFixed(0)} id={id} dataIndex={2} />
				</div>
				<div className='flex flex-col gap-0'>
					<RowLabel>Yksikkö</RowLabel>
					<InvoiceData className='w-20' value='kpl' id={id} dataIndex={3} />
				</div>
				<div className='flex flex-col gap-0'>
					<RowLabel>Hinta</RowLabel>
					<InvoiceData className='w-20' value={item.product?.priceNoTax?.toFixed(2).replace('.', '.')} id={id} dataIndex={4} />
				</div>
				<div className='flex flex-col gap-0'>
					<RowLabel>ALV%</RowLabel>
					<InvoiceData className='w-20' value='14' id={id} dataIndex={5} />
				</div>
				<div className='flex flex-col gap-0'>
					<RowLabel>Ostotilauksen Päivämäärä</RowLabel>
					<InvoiceData value={order.deliveryDate} id={id} dataIndex={6} />
				</div>
				<div className='flex flex-col gap-0'>
					<RowLabel>Ostotilauksen numero</RowLabel>
					<InvoiceData value={order.orderNumber} id={id} dataIndex={7} nextRowId={nextRowId} />
				</div>
			</div>
		</div>
	)
}
const InvoiceData = (
	{ value = '', className = '', id, dataIndex, nextRowId }: {
		value?: string
		className?: string
		id: string
		dataIndex: number
		nextRowId?: string
	},
) => {
	const [, setMessage] = useRecoilState<string>(messageAtom)
	const divRef = React.useRef<HTMLDivElement>(null)

	const nextId = nextRowId ? `id-${nextRowId}-dataIndex-0` : `id-${id}-dataIndex-${dataIndex + 1}`

	const copyAndChooseNext = (e: React.KeyboardEvent<HTMLDivElement>) => {
		console.debug({ key: e.key })
		if (e.key === 'c') {
			console.debug({ divRef })
			const text = e.currentTarget.textContent
			if (text) {
				navigator.clipboard.writeText(text).then(() => {
					setMessage(`${text}`)
					setTimeout(() => setMessage((prev) => prev === text ? '' : prev), 3000)
				})
			}
			document.getElementById(nextId)?.focus()
		}
	}

	return (
		<div
			id={`id-${id}-dataIndex-${dataIndex}`}
			ref={divRef}
			className={`w-40 focus:border-[2px] focus:-ml-[2px] focus:-my-[1px] focus:pl-[2px] focus:border-cyan-600 ${className}`}
			tabIndex={0}
			onKeyDown={copyAndChooseNext}
		>
			{value}
		</div>
	)
}
