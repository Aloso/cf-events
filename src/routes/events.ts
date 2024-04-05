import type { Env } from '..'
import { getAllEvents } from '../lib/db'
import { Event } from '../lib/event'
import { jsonResponse, tryAuthentication } from '../lib/http'

/*
	Everyone can fetch the list of published events. Only authorized users (admins) can
	edit published events, and (un)publish events.
*/

// fetch all
export async function GET(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const { events }: { events: Partial<Event>[] } = await getAllEvents(env, {}, true)

	const authenticated = tryAuthentication(request, env)
	if (!authenticated) {
		events.forEach((event) => {
			delete event.submitter
			delete event.orgaNotes
		})
	}
	return jsonResponse(events)
}
