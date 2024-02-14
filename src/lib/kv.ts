import { Env } from '..'
import { Event } from './event'

interface GetAllDraftOptions {
	start?: number
	limit?: number
}

export async function getAllDrafts(
	env: Env,
	{ start = 0, limit }: GetAllDraftOptions = {},
): Promise<{ length: number; events: Event[] }> {
	const { keys } = await env.EVENTS_KV.list()
	if (!limit && keys.length - start > 100) {
		throw new Response('Too many drafts', { status: 400 })
	}
	const length = keys.length

	const drafts = await Promise.all(
		keys
			.slice(start, limit)
			.filter(({ name }) => name.startsWith('draft:'))
			.map(({ name }) => env.EVENTS_KV.get(name)),
	)

	// assume the stored events are valid
	const events = drafts.filter((s): s is string => s != null).map((s) => JSON.parse(s))
	return { length, events }
}

export async function getDraft(env: Env, key: string): Promise<Event> {
	const event = await env.EVENTS_KV.get(`draft:${key}`)
	if (!event) {
		throw new Response('Event not found', { status: 404 })
	}
	// assume the stored event is valid
	return JSON.parse(event)
}

export async function putDraft(env: Env, key: string, event: Event): Promise<void> {
	await env.EVENTS_KV.put(`draft:${key}`, JSON.stringify(event))
}

export async function deleteDraft(env: Env, key: string): Promise<void> {
	await env.EVENTS_KV.delete(`draft:${key}`)
}

export async function getPublishedEvents(env: Env): Promise<Event[]> {
	const events = await env.EVENTS_KV.get('publishedEvents')
	if (!events) {
		await env.EVENTS_KV.put('publishedEvents', '[]')
		return getPublishedEvents(env)
	}
	// assume the stored events are valid
	return JSON.parse(events)
}

export async function putPublishedEvents(env: Env, events: Event[]) {
	await env.EVENTS_KV.put('publishedEvents', JSON.stringify(events))
}
