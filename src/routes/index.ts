import * as event from './event'
import * as events from './events'
import * as draft from './draft'
import * as drafts from './drafts'
import { Env } from '..'

type Route = (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>
type RouteMethods = Record<string, Route>

export const routes: Record<string, RouteMethods> = {
	'/event': event,
	'/events': events,
	'/draft': draft,
	'/drafts': drafts,
}
