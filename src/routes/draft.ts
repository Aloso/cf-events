import { v4 as uuidv4 } from 'uuid'
import type { Env } from '..'
import { jsonResponse, queryKey } from '../lib/http'
import { parseEvent } from '../lib/event'
import { addEvent, deleteEvent, getEvent, putEvent } from '../lib/db'
import { mdToHtml } from '../lib/markdown'

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

	const draft = await getEvent(env, key, false)
	return jsonResponse(draft)
}

// create
export async function POST(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const event = parseEvent(await request.json())
	const key = uuidv4()
	event.key = key
	event.descHtml = mdToHtml(event.description)

	await addEvent(env, key, event, false)
	return jsonResponse(event)
}

// edit
export async function PUT(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const key = queryKey(request)
	if (!key) {
		return new Response('Missing key', { status: 401 })
	}

	const event = parseEvent(await request.json())
	event.key = key
	event.descHtml = mdToHtml(event.description)

	await putEvent(env, key, event, false)
	return jsonResponse(event)
}

// delete
export async function DELETE(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const key = queryKey(request)
	if (!key) {
		return new Response('Missing key', { status: 401 })
	}

	await deleteEvent(env, key, false)
	return new Response('OK')
}
