import type { Env } from '..'
import { getAllEvents } from '../lib/db'
import { jsonResponse } from '../lib/http'

/*
	Everyone can fetch the list of published events. Only authorized users (admins) can
	edit published events, and (un)publish events.
*/

// fetch all
export async function GET(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const { events } = await getAllEvents(env, {}, true)
	return jsonResponse(events)
}
