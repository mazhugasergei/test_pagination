import md5 from "md5"
import { useEffect, useState } from "react"
import Nav from "./components/Nav"
import { useSearchParams } from "react-router-dom"
import Filters from "./components/Filters"

export default () => {
	const [searchParams, setSearchParams] = useSearchParams()
	const page = searchParams.get("page") | 0
	const product = searchParams.get("product")
	const brand = searchParams.get("brand")
	const price = searchParams.get("price")
	const [ids, setIds] = useState([])
	const [items, setItems] = useState()
	const perPage = 50

	const resetPage = () => {
		const params = {}
		searchParams.forEach((value, key) => (params[key] = value))
		setSearchParams({ ...params, page: 0 })
	}

	const fetchWithRetry = async (url, options, retries = 5, retryDelay = 1000) => {
		try {
			const res = await fetch(url, {
				...options,
				method: "POST",
				headers: {
					"X-Auth": md5(`Valantis_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`),
					"Content-Type": "application/json",
				},
			}).then((res) => res.json())
			return res
		} catch (error) {
			if (retries > 0) {
				console.error(error)
				await new Promise((resolve) => setTimeout(resolve, retryDelay))
				return fetchWithRetry(url, options, retries - 1, retryDelay)
			} else {
				throw new Error("Exceeded maximum retries")
			}
		}
	}

	const fetchIds = async () => {
		const reqBody = { action: "get_ids" }
		if (product || brand || price) {
			reqBody.action = "filter"
			reqBody.params = {}
		}
		if (product) reqBody.params.product = product
		if (brand) reqBody.params.brand = brand
		if (price) reqBody.params.price = parseFloat(price)

		await fetchWithRetry("https://api.valantis.store:41000/", {
			body: JSON.stringify(reqBody),
		}).then(({ result }) => {
			const arr = [...new Set(result)] // remove ids duplicates
			let res = []
			// split ids into perPage size chunks
			for (let i = 0; i < arr.length; i += perPage) res.push(arr.slice(i, i + perPage))
			setIds(res)
		})
	}

	const fetchItems = async () => {
		if (page >= ids.length) {
			resetPage()
			return
		}

		await fetchWithRetry("https://api.valantis.store:41000/", {
			body: JSON.stringify({
				action: "get_items",
				params: { ids: ids[searchParams.get("page")] },
			}),
		}).then(({ result }) => {
			// remove items duplicates
			const seen = {}
			const res = []

			for (const obj of result) {
				if (!seen[obj.id]) {
					seen[obj.id] = true
					res.push(obj)
				}
			}

			setItems(res)
		})
	}

	useEffect(() => {
		if (!searchParams.get("page")) resetPage()
	}, [])

	useEffect(() => {
		setItems()
		fetchIds()
	}, [product, brand, price])

	useEffect(() => {
		setItems()
		if (ids.length) fetchItems()
	}, [page])

	useEffect(() => {
		if (ids.length) fetchItems()
	}, [ids])

	return (
		<div className="max-w-[45rem] border rounded-xl p-4 my-4 mx-auto">
			<Filters />

			<Nav {...{ ids }} />

			<div className="grid grid-cols-2 gap-2 my-2">
				{items?.map(({ id, brand, product, price }, i) => (
					<div key={id} className="flex flex-col border rounded-md p-2">
						<p>[{id}]</p>
						{brand && <p className="font-bold">{brand}</p>}
						<p>{product}</p>
						<p className="font-bold mt-auto">{price}</p>
					</div>
				)) || "loading..."}
			</div>

			<Nav {...{ ids }} />
		</div>
	)
}
