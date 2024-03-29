import { useState } from "react"
import { useSearchParams } from "react-router-dom"

export default () => {
	const [searchParams, setSearchParams] = useSearchParams()
	const [product, setProduct] = useState(searchParams.get("product") || "")
	const [brand, setBrand] = useState(searchParams.get("brand") || "")
	const [price, setPrice] = useState(searchParams.get("price") || "")

	const onSubmit = (e) => {
		e.preventDefault()
		const params = {}
		searchParams.forEach((value, key) => (params[key] = value))
		if (product) params.product = product
		else delete params.product
		if (brand) params.brand = brand
		else delete params.brand
		if (price) params.price = price
		else delete params.price
		setSearchParams({ ...params, page: 0 })
	}

	const clearFilters = () => {
		setProduct("")
		setBrand("")
		setPrice("")
		const params = {}
		searchParams.forEach((value, key) => (params[key] = value))
		delete params.product
		delete params.brand
		delete params.price
		setSearchParams({ ...params, page: 0 })
	}

	return (
		<form className="flex gap-2 mb-2" onSubmit={onSubmit}>
			<input
				placeholder="Product"
				value={product}
				onChange={(e) => setProduct(e.target.value)}
				className="flex-1 text-sm border rounded-md px-3 py-2"
			/>
			<input
				placeholder="Brand"
				value={brand}
				onChange={(e) => setBrand(e.target.value)}
				className="text-sm border rounded-md px-3 py-2"
			/>
			<input
				placeholder="Price"
				value={price}
				onChange={(e) => setPrice(e.target.value)}
				className="text-sm border rounded-md px-3 py-2"
			/>
			<button className="text-sm font-medium text-[#fff] bg-[#000] rounded-md px-3 py-2">Submit</button>
			<button
				type="button"
				onClick={clearFilters}
				className="text-sm font-medium text-[#000] bg-[#fff] border rounded-md px-3 py-2"
			>
				Clear
			</button>
		</form>
	)
}
