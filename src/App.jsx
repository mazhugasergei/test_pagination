import md5 from "md5"
import { useEffect, useState } from "react"
import Nav from "./components/Nav"
import { useSearchParams } from "react-router-dom"

export default () => {
	const [searchParams, setSearchParams] = useSearchParams()
	const page = searchParams.get("page") | 0
	const [ids, setIds] = useState([])
	const [items, setItems] = useState()
	const perPage = 50

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
		await fetchWithRetry("https://api.valantis.store:41000/", {
			body: JSON.stringify({
				action: "get_ids",
			}),
		}).then(({ result }) => {
			let res = []
			for (let i = 0; i < result.length; i += perPage) {
				res.push(result.slice(i, i + perPage))
			}
			setIds(res)
		})
	}

	const fetchItems = async () => {
		await fetchWithRetry("https://api.valantis.store:41000/", {
			body: JSON.stringify({
				action: "get_items",
				params: { ids: ids[searchParams.get("page")] },
			}),
		}).then(({ result }) => {
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
		if (!searchParams.get("page")) {
			setSearchParams({ page: 0 })
		}

		fetchIds()
	}, [])

	useEffect(() => {
		setItems()
		if (ids.length) fetchItems()
	}, [page])

	useEffect(() => {
		if (ids.length) fetchItems()
	}, [ids])

	return (
		<div className="max-w-[40rem] border rounded-xl p-4 my-4 mx-auto">
			<Nav {...{ ids }} />

			<div className="grid grid-cols-2 gap-2 my-2">
				{items?.map(({ id, brand, product, price }, i) => (
					<div key={id} className="flex flex-col border rounded-md p-2">
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
