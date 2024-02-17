import { jsonResponse } from './lib/http'
import { routes } from './routes'

type EnvVars = {
	[key in `USER__${string}`]: string
}

export interface Env extends EnvVars {
	DB: D1Database
	ALLOW_ORIGIN: string
}

function addCorsHeaders(env: Env, headers: Headers) {
	headers.set('Allow', 'OPTIONS, GET, HEAD, PUT, POST, DELETE')
	headers.set('Access-Control-Allow-Origin', env.ALLOW_ORIGIN)
	headers.set('Access-Control-Allow-Headers', 'Authorization')
	headers.set('Access-Control-Allow-Methods', 'OPTIONS, GET, HEAD, PUT, POST, DELETE')
	headers.set('Access-Control-Max-Age', '86400')
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const response = await fetchWrapper(request, env, ctx)
		addCorsHeaders(env, response.headers)
		return response
	},
}

async function fetchWrapper(request: Request, env: Env, ctx: ExecutionContext) {
	if (request.method === 'OPTIONS') {
		return new Response(null)
	}

	try {
		const response = await getRouteFunction(request)(request, env, ctx)
		return response
	} catch (error) {
		if (error instanceof Response) {
			return error
		} else if (error instanceof Error) {
			console.error(error.message, error.stack)
		} else {
			console.error(JSON.stringify(error))
		}
		return jsonResponse('Internal Server Error', { status: 500 })
	}
}

function getRouteFunction(request: Request) {
	const url = new URL(request.url)
	if (url.pathname in routes) {
		const routeMethods = routes[url.pathname]
		if (request.method in routeMethods) {
			return routeMethods[request.method]
		}
		throw new Response('Method not allowed', { status: 405 })
	}
	throw new Response('Not found', { status: 404 })
}
