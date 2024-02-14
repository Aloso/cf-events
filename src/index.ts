import { routes } from './routes'

type EnvVars = {
	[key in `USER__${string}`]: string
}

export interface Env extends EnvVars {
	EVENTS_KV: KVNamespace
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		try {
			const response = await getRouteFunction(request)(request, env, ctx)
			return response
		} catch (error) {
			if (error instanceof Response) {
				return error
			}
			const message = error instanceof Error ? error.message : 'Internal Server Error'
			return new Response(message, { status: 500 })
		}
	},
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
