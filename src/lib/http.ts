import { Env } from '..'

export function jsonResponse(data: unknown, init: ResponseInit = {}): Response {
	const headers = { ...init.headers, 'Content-Type': 'application/json; charset=UTF-8' }
	return new Response(JSON.stringify(data), { ...init, headers })
}

export function authenticate(request: Request, env: Env) {
	const auth = request.headers.get('Authorization')
	const match = auth?.match(/^(?<user>[^@]*?)@(?<password>.*)$/)
	if (!match) {
		throw new Response('Unauthorized', { status: 401 })
	}

	const { user, password } = match.groups!
	const variable = `USER__${user}` as const
	if (variable in env && env[variable] === password) {
		return
	}
	throw new Response('Unauthorized', { status: 401 })
}

export function queryKey(receiver: Request | URLSearchParams) {
	if (receiver instanceof Request) {
		receiver = new URL(receiver.url).searchParams
	}
	return receiver.get('key') ?? undefined
}

export function queryNumber(params: URLSearchParams, name: string) {
	const value = params.get(name)
	if (value == null) return
	if (Number.isNaN(value)) {
		throw new Response(`Bad query parameter ${name}`, { status: 400 })
	}
	return +value
}
