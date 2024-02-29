import type { Env } from '..'
import { putEvent, setEventPublished } from '../lib/db'
import { parseEvent } from '../lib/event'
import { authenticate, jsonResponse, queryKey } from '../lib/http'
import { mdToHtml } from '../lib/markdown'

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

	const event = parseEvent(await request.json())
	const key = queryKey(request) ?? event.key
	if (!key) {
		throw new Response('Missing key', { status: 401 })
	}
	event.key = key
	event.descHtml = mdToHtml(event.description)

	await putEvent(env, key, event, true)
	return jsonResponse(event)
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
