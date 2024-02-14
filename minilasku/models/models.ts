import exp from 'constants'

export const uuidGenerator = (): string => {
	return Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36)
}

export interface Product {
	id: string
	name: string
	eanCode: string
	priceNoTax: number
	priceTax: number
}

export const createProduct = (): Product => ({ id: uuidGenerator(), name: '', eanCode: '', priceNoTax: 0, priceTax: 0 })

export interface Invoice {
	id: string
	number: string
	reference: string
	dueDate: string
	priceNoTax: number
	description: string
	priceTax: number
	Row: []
}

export const createInvoice = (): Invoice => ({
	id: uuidGenerator(),
	number: '',
	reference: '',
	dueDate: '',
	priceNoTax: 0,
	description: '',
	priceTax: 0,
	Row: [],
})

export interface Row {
	id: string
	product: Product
	amount: number
	deliveryDate: string
	orderNumber: string
}

export const createRow = (): Row => ({ id: uuidGenerator(), product: createProduct(), amount: 0, deliveryDate: '', orderNumber: '' })

export interface OrderItem {
	id: string
	eanCode: string
	amount: number
	product?: Product
}

export const createOrderItem = (eanCode: string, amount: number, products: Product[]): OrderItem => ({
	id: uuidGenerator(),
	eanCode,
	amount,
	product: products.find((p) => p.eanCode === eanCode),
})

export interface Order {
	id: string
	text: string
	orderNumber?: string
	deliveryDate?: string
	items: OrderItem[]
}

export const createOrder = (text: string): Order => ({ id: uuidGenerator(), text, items: [] })
