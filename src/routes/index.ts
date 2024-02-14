import * as events from './events'
import * as drafts from './drafts'
import { Env } from '..'

type Route = (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>
type RouteMethods = Record<string, Route>

export const routes: Record<string, RouteMethods> = {
	'/events': events,
	'/drafts': drafts,
}
