import { z } from 'zod'
import { jsonResponse } from './http'

export interface Event {
	key?: string
	title: string
	description: string
	website?: string
	time: Time
	place: Place
	organizer?: Organizer
	pictureUrl?: string
	tags: string[]
}

interface Time {
	start: string
	end?: string
	repeats?: Repeats
}

interface Repeats {
	cycle: 'DAY' | 'WEEK' | 'MONTH'
	days?: number
}

interface Place {
	name: string
	room?: string
	address?: string
	type: 'PHYSICAL' | 'ONLINE'
}

interface Organizer {
	name: string
	phone?: string
	email?: string
	website?: string
}

const schema = z.object({
	key: z.string().optional(),
	title: z.string(),
	description: z.string(),
	website: z.string().optional(),
	time: z.object({
		start: z.string(),
		end: z.string().optional(),
		repeats: z
			.object({
				cycle: z.enum(['DAY', 'WEEK', 'MONTH']),
				days: z.number().optional(),
			})
			.optional(),
	}),
	place: z.object({
		name: z.string(),
		room: z.string().optional(),
		address: z.string().optional(),
		type: z.enum(['PHYSICAL', 'ONLINE']),
	}),
	organizer: z
		.object({
			name: z.string(),
			phone: z.string().optional(),
			email: z.string().optional(),
			website: z.string().optional(),
		})
		.optional(),
	pictureUrl: z.string().optional(),
	tags: z.string().array(),
})

export function parseEvent(data: unknown): Event {
	try {
		return schema.parse(data)
	} catch (error) {
		const { issues } = error as z.ZodError
		throw jsonResponse({ errors: issues }, { status: 400 })
	}
}

// Ensure the type definitions are equivalent
type ZodEvent = z.infer<typeof schema>
const {}: Event = {} as ZodEvent
const {}: ZodEvent = {} as Event
