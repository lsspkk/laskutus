import { atom } from 'recoil'
import { ImportRule, Order, Product } from './models'

const basicProductData = JSON.parse(process.env.NEXT_PUBLIC_PRODUCTS ?? '[]') as { name: string; eanCode: string; priceNoTax: string }[]

const defaultProducts: Product[] = basicProductData.map((p, i) => ({
	id: i.toString(),
	name: p.name,
	eanCode: p.eanCode,
	priceNoTax: parseFloat(parseFloat(p.priceNoTax).toFixed(2)),
	priceTax: parseFloat((parseFloat(p.priceNoTax) * 1.14).toFixed(2)),
}))

export const productAtom = atom<Product[]>({ key: 'productAtom', default: defaultProducts.sort((a, b) => a.name.localeCompare(b.name)) })

const defaultOrders: Order[] = []

export const orderAtom = atom<Order[]>({ key: 'orderAtom', default: defaultOrders })

export const messageAtom = atom<string>({ key: 'messageAtom', default: '' })

const defaultImportRules = JSON.parse(process.env.NEXT_PUBLIC_IMPORT_RULES ?? '[]') as ImportRule[]

export const importRulesAtom = atom<ImportRule[]>({ key: 'importRulesAtom', default: defaultImportRules })
