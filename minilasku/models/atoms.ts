import { atom } from 'recoil'
import { Order, Product } from './models'

console.log(process.env.NEXT_PUBLIC_PRODUCTS)
const basicProductData = JSON.parse(process.env.NEXT_PUBLIC_PRODUCTS || '[]') as {
  name: string
  eanCode: string
  priceNoTax: string
}[]

const defaultProducts: Product[] = basicProductData.map((p, i) => ({
  id: i.toString(),
  name: p.name,
  eanCode: p.eanCode,
  priceNoTax: parseFloat(parseFloat(p.priceNoTax).toFixed(2)),
  priceTax: parseFloat((parseFloat(p.priceNoTax) * 1.14).toFixed(2)),
}))

export const productAtom = atom<Product[]>({
  key: 'productAtom',
  default: defaultProducts.sort((a, b) => a.name.localeCompare(b.name)),
})

const defaultOrders: Order[] = []

export const orderAtom = atom<Order[]>({ key: 'orderAtom', default: defaultOrders })
