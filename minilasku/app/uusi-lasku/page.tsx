'use client'

import { NpBackButton } from '@/components/NpBackButton'
import { NpButton } from '@/components/NpButton'
import { NpDialog } from '@/components/NpDialog'
import { NpMain } from '@/components/NpMain'
import { NpTextArea } from '@/components/NpTextarea'
import { NpToast } from '@/components/NpToast'
import { orderAtom, productAtom } from '@/models/atoms'
import { createOrder, Order, OrderItem, Product, uuidGenerator } from '@/models/models'
import { set } from 'mongoose'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { NpSubTitle } from '../../components/NpTitle'

export type DialogType = 'NONE' | 'CLEAR_ORDERS' | 'SAVE' | 'LOAD'

export default function Home() {
  const router = useRouter()
  const products: Product[] = useRecoilValue(productAtom)
  const [orders, setOrders] = useRecoilState<Order[]>(orderAtom)
  const [newOrderText, setNewOrderText] = React.useState('')
  const [errors, setErrors] = React.useState<string[]>([])
  const [dialog, setDialog] = React.useState<DialogType>('NONE')
  const fileRef = React.useRef<HTMLInputElement>(null)

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
    reader.onload = function (e) {
      const text = e.target?.result
      console.log('loaded file text', text)
      try {
        const orders = JSON.parse(text as string) as Order[]
        orders.sort((a, b) => {
          const aDate = a.deliveryDate ?? ''
          const bDate = b.deliveryDate ?? ''
          return aDate.localeCompare(bDate)
        })
        setOrders(orders)
      } catch (e: any) {
        setErrors([...errors, e.message])
        setTimeout(() => setErrors(errors.filter((error) => error !== e.message)), 3000)
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

      {dialog === 'CLEAR_ORDERS' && (
        <ClearOrdersDialog onClose={() => setDialog('NONE')} onClearOrders={onClearOrders} />
      )}
      {dialog === 'SAVE' && <SaveDialog onClose={() => setDialog('NONE')} onSave={onSave} />}

      <NpSubTitle>Lisää laskun tilaukset</NpSubTitle>

      {errors && (
        <NpToast onClose={() => setErrors([])}>
          <div> {errors.join(', ')}</div>
        </NpToast>
      )}

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
          <NpButton variant='secondary' onClick={() => setDialog('SAVE')}>
            Tallenna
          </NpButton>
          <NpButton variant='secondary' onClick={() => setDialog('CLEAR_ORDERS')}>
            Tyhjennä
          </NpButton>
          <NpButton className='ml-20' onClick={readOrder}>
            Lisää tilaus
          </NpButton>
        </div>
      </div>

      <div className='flex gap-12 mt-10 items-start'>
        <NpSubTitle className='self-start'>Tilauksia: {orders?.length || 0} kpl</NpSubTitle>
        <OrderTotal orders={orders} />
      </div>
      <div className='flex flex-col gap-4 mt-2'>
        {orders?.map((order, index) => (
          <OrderBox key={order.id} order={order} index={index} onDeleteOrder={() => onDeleteOrder(index)} />
        ))}
      </div>
    </NpMain>
  )
}

const OrderTotal = ({ orders }: { orders: Order[] }) => {
  const totalWithoutTax = orders.reduce((acc, order) => {
    return (
      acc +
      order.items.reduce((acc, item) => {
        return acc + (item.product?.priceNoTax || 0) * item.amount
      }, 0)
    )
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
          <NpButton variant='secondary' onClick={onClose}>
            Peruuta
          </NpButton>
          <NpButton onClick={onClearOrders}>Kyllä</NpButton>
        </div>
      </div>
    </NpDialog>
  )
}

const SaveDialog = ({ onClose, onSave }: { onClose: () => void; onSave: () => void }) => {
  const [orders, setOrders] = useRecoilState<Order[]>(orderAtom)

  const shortDates = orders.map((order) => toShortDate(order.deliveryDate)).join('_')
  const fileName = `laskurivit_${shortDates}.json`
  return (
    <NpDialog onClose={onClose}>
      <div className='flex flex-col gap-4'>
        <div>Tallennetaanko tilaukset?</div>

        <div className='mt-2 -mb-2'>Tiedoston nimi</div>
        <div className='mb-2 opacity-80 text-xs'>{fileName}</div>
        <div className='flex flex-row gap-4 justify-between'>
          <NpButton variant='secondary' onClick={onClose}>
            Peruuta
          </NpButton>
          <NpButton onClick={onSave}>Tallenna</NpButton>
        </div>
      </div>
    </NpDialog>
  )
}

const toShortDate = (date?: string) => {
  if (!date) {
    return ''
  }
  const parts = date.split('.')
  return `${parts[0]}.${parts[1]}.`
}

const OrderBox = ({ order, index, onDeleteOrder }: { order: Order; index: number; onDeleteOrder: () => void }) => {
  const shortDate = toShortDate(order.deliveryDate)

  return (
    <div className='flex flex-col gap-4 border border-gray-400 p-2'>
      {order.items && (
        <div className='flex flex-col gap-2'>
          <div className='flex flex-row gap-4 justify-between'>
            <NpSubTitle>{shortDate}</NpSubTitle>
            <NpButton tabIndex={-1} variant='secondary' onClick={onDeleteOrder}>
              Poista
            </NpButton>
          </div>

          {order.items.map((item) => (
            <OrderItemBox key={item.id} item={item} order={order} />
          ))}
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
          <RowLabel>Hinta</RowLabel>
          <InvoiceData className='w-20' value={item.product?.priceNoTax?.toFixed(2).replace('.', '.')} />
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
  return <input type='text' className={`w-40 ${className}`} tabIndex={0} value={value} />
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
