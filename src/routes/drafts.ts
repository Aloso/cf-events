import type { Env } from '..'
import { getAllEvents } from '../lib/db'
import { authenticate, jsonResponse, queryNumber } from '../lib/http'

/*
	The permissions for drafts are opposite to published event permissions:

	Everyone can create new drafts, edit and delete them. However, the `key` of drafts is a
	secret - only the creator of a draft knows it, therefore, editing or deleting a draft can
	only be done by the creator.

	The exception are authorized users (admins), who are the only ones who can fetch the
	list of drafts (including keys), and therefore edit/delete everything.
*/

// fetch all
export async function GET(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	authenticate(request, env)

	const params = new URL(request.url).searchParams
	const start = queryNumber(params, 'start')
	const limit = queryNumber(params, 'limit')

	const { length, events } = await getAllEvents(env, { start, limit }, false)
	return jsonResponse({ length, events })
}
