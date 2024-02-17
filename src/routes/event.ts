import type { Env } from '..'
import { putEvent, setEventPublished } from '../lib/db'
import { parseEvent } from '../lib/event'
import { authenticate, queryKey } from '../lib/http'

/*
	Everyone can fetch the list of published events. Only authorized users (admins) can
	edit published events, and (un)publish events.
*/

// publish
export async function POST(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	authenticate(request, env)

	const key = queryKey(request)
	if (!key) {
		throw new Response('Missing key', { status: 401 })
	}
	await setEventPublished(env, key, true)
	return new Response('OK')
}

// edit
export async function PUT(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	authenticate(request, env)

	const receivedEvent = parseEvent(await request.json())
	const key = queryKey(request) ?? receivedEvent.key
	if (!key) {
		throw new Response('Missing key', { status: 401 })
	}
	receivedEvent.key = key
	await putEvent(env, key, receivedEvent, true)
	return new Response('OK')
}

// unpublish
export async function DELETE(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	authenticate(request, env)

	const key = queryKey(request)
	if (!key) {
		throw new Response('Missing key', { status: 401 })
	}
	await setEventPublished(env, key, false)
	return new Response('OK')
}
