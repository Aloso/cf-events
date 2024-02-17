import { Env } from '..'
import { Event } from './event'

function error(message: string, status = 500): never {
	throw new Response(message, { status })
}

interface GetAllEventsOptions {
	start?: number
	limit?: number
}

export async function getAllEvents(
	env: Env,
	options: GetAllEventsOptions,
	published: boolean,
): Promise<{ length: number; events: Event[] }> {
	const lengthQuery = 'SELECT count(*) length FROM events WHERE isPublished = ?'
	const resultsQuery = 'SELECT jsonData FROM events WHERE isPublished = ?'
	const resultsQueryLimit = 'SELECT jsonData FROM events WHERE isPublished = ? LIMIT ? OFFSET ?'

	const lengthResult = await env.DB.prepare(lengthQuery)
		.bind(published ? 1 : 0)
		.first<{ length: number }>()
	const { length } = lengthResult ?? error('Failed to get number of events')

	if (options.limit) {
		const { results } = await env.DB.prepare(resultsQueryLimit)
			.bind(published ? 1 : 0, options.limit, options.start ?? 0)
			.all<{ jsonData: string }>()
		const events = results.map((res) => JSON.parse(res.jsonData))
		return { length, events }
	} else {
		const { results } = await env.DB.prepare(resultsQuery)
			.bind(published ? 1 : 0)
			.all<{ jsonData: string }>()
		const events = results.map((res) => JSON.parse(res.jsonData))
		return { length, events }
	}
}

export async function getEvent(env: Env, key: string, published: boolean): Promise<Event> {
	const query = 'SELECT jsonData FROM events WHERE id = ? AND isPublished = ?'

	const result = await env.DB.prepare(query)
		.bind(key, published ? 1 : 0)
		.first<{ jsonData: string }>()
	const { jsonData } = result ?? error('Event not found', 404)

	return JSON.parse(jsonData)
}

export async function addEvent(
	env: Env,
	key: string,
	event: Event,
	published: boolean,
): Promise<void> {
	const query = 'INSERT INTO events (id, isPublished, jsonData) VALUES (?, ?, ?)'

	const result = await env.DB.prepare(query)
		.bind(key, published ? 1 : 0, JSON.stringify(event))
		.run()
	if (!result.success) {
		error('Failed to create event')
	}
}

export async function putEvent(
	env: Env,
	key: string,
	event: Event,
	published: boolean,
): Promise<void> {
	const query = 'UPDATE events SET jsonData = ? WHERE id = ? AND isPublished = ?'

	const result = await env.DB.prepare(query)
		.bind(JSON.stringify(event), key, published ? 1 : 0)
		.run()
	if (!result.success) {
		await getEvent(env, key, published) // throws 404 if the event doesn't exist
		error('Failed to update event')
	}
}

export async function deleteEvent(env: Env, key: string, published: boolean): Promise<void> {
	const query = 'DELETE FROM events WHERE id = ? AND isPublished = ?'

	const result = await env.DB.prepare(query)
		.bind(key, published ? 1 : 0)
		.run()
	if (!result.success) {
		await getEvent(env, key, published) // throws 404 if the event doesn't exist
		error('Failed to delete event')
	}
}

export async function setEventPublished(env: Env, key: string, published: boolean): Promise<void> {
	const query = `UPDATE events SET isPublished = ? WHERE id = ? AND isPublished = ?`

	const result = await env.DB.prepare(query)
		.bind(published ? 1 : 0, key, published ? 0 : 1)
		.run()
	if (!result.success) {
		await getEvent(env, key, !published) // throws 404 if the event doesn't exist
		error('Failed to delete event')
	}
}
