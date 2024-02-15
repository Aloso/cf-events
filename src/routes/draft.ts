import { v4 as uuidv4 } from 'uuid'
import type { Env } from '..'
import { jsonResponse, queryKey } from '../lib/http'
import { deleteDraft, getDraft, putDraft } from '../lib/kv'
import { parseEvent } from '../lib/event'

/*
	The permissions for drafts are opposite to published event permissions:

	Everyone can create new drafts, edit and delete them. However, the `key` of drafts is a
	secret - only the creator of a draft knows it, therefore, editing or deleting a draft can
	only be done by the creator.

	The exception are authorized users (admins), who are the only ones who can fetch the
	list of drafts (including keys), and therefore edit/delete everything.
*/

// fetch
export async function GET(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const key = queryKey(request)
	if (!key) {
		return new Response('Missing key', { status: 401 })
	}

	const draft = await getDraft(env, key)
	return jsonResponse(draft)
}

// create
export async function POST(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const event = parseEvent(await request.json())
	const key = uuidv4()
	event.key = key

	await putDraft(env, key, event)
	return jsonResponse({ key })
}

// edit
export async function PUT(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const key = queryKey(request)
	if (!key) {
		return new Response('Missing key', { status: 401 })
	}

	const event = parseEvent(await request.json())
	event.key = key
	await putDraft(env, key, event)
	return new Response('OK')
}

// delete
export async function DELETE(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const key = queryKey(request)
	if (!key) {
		return new Response('Missing key', { status: 401 })
	}

	await deleteDraft(env, key)
	return new Response('OK')
}
