import type { Env } from '..'
import { Event, parseEvent } from '../lib/event'
import { authenticate, queryKey } from '../lib/http'
import { getDraft, putDraft, deleteDraft, getPublishedEvents, putPublishedEvents } from '../lib/kv'

/*
	Everyone can fetch the list of published events. Only authorized users (admins) can
	edit published events, and (un)publish events.
*/

// publish
export async function POST(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	authenticate(request, env)

	const key = queryKey(request)
	await publishDraft(env, key)
	return new Response('OK')
}

// edit
export async function PUT(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	authenticate(request, env)

	const receivedEvent = parseEvent(await request.json())
	receivedEvent.key ??= queryKey(request)
	await editPublished(env, receivedEvent)
	return new Response('OK')
}

// unpublish
export async function DELETE(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	authenticate(request, env)

	const key = queryKey(request)
	await unpublishDraft(env, key)
	return new Response('OK')
}

async function publishDraft(env: Env, key: string | null | undefined) {
	if (!key) {
		throw new Response('Missing key', { status: 401 })
	}

	const draft = await getDraft(env, key)
	const publishedEvents = await getPublishedEvents(env)
	publishedEvents.push(draft)

	await deleteDraft(env, key)
	await putPublishedEvents(env, publishedEvents)
}

async function unpublishDraft(env: Env, key: string | null | undefined) {
	if (!key) {
		throw new Response('Missing key', { status: 401 })
	}

	const publishedEvents = await getPublishedEvents(env)
	const eventIdx = publishedEvents.findIndex((e) => e.key === key)
	if (eventIdx === -1) {
		return new Response('Event does not exist', { status: 404 })
	}

	const [removedEvent] = publishedEvents.splice(eventIdx, 1)

	await putDraft(env, removedEvent.key!, removedEvent)
	await putPublishedEvents(env, publishedEvents)
}

async function editPublished(env: Env, event: Event) {
	if (!event.key) {
		throw new Response('Missing key', { status: 401 })
	}

	const publishedEvents = await getPublishedEvents(env)
	const eventIdx = publishedEvents.findIndex((e) => e.key === event.key)
	if (eventIdx === -1) {
		return new Response('Event does not exist', { status: 404 })
	}
	publishedEvents[eventIdx] = event
	await putPublishedEvents(env, publishedEvents)
}
