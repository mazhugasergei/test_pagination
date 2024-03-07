import { useSearchParams } from "react-router-dom"

export default ({ ids }) => {
	const [searchParams, setSearchParams] = useSearchParams()
	const page = searchParams.get("page") | 0

	const getParams = () => {
		const params = {}
		searchParams.forEach((value, key) => (params[key] = value))
		return params
	}

	return (
		<nav className="flex gap-2">
			<button
				disabled={!page}
				onClick={() => {
					setSearchParams({ ...getParams(), page: parseInt(searchParams.get("page")) - 1 })
				}}
				className="disabled:opacity-50 w-8 h-8 text-xs border rounded-md"
			>
				←
			</button>

			<ul className="flex gap-1 mx-auto">
				{ids.map((chunk, i) => {
					if (!i || (i >= page - 3 && i <= page + 3) || i === ids.length - 1)
						return (
							<li key={i}>
								<button
									className={`${i === page ? "bg-[#eee]" : ""} w-8 h-8 text-xs border rounded-md`}
									onClick={() => setSearchParams({ ...getParams(), page: i })}
								>
									{i}
								</button>
							</li>
						)
					else if (i === page - 4 || i === page + 4) return <li key={i}>...</li>
				})}
			</ul>

			<button
				disabled={page === ids.length - 1}
				onClick={() => setSearchParams({ ...getParams(), page: parseInt(searchParams.get("page")) + 1 })}
				className="disabled:opacity-50 w-8 h-8 text-xs border rounded-md"
			>
				→
			</button>
		</nav>
	)
}
