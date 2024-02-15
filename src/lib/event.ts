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
	submitter: Submitter
}

interface Time {
	start: string
	end?: string
	repeats?: Repeats
}

// every day = { cycle: DAY }
// every other week = { cycle: WEEK, times: 2 }
// every 3 months = { cycle: MONTH, times: 3 }
// every Monday and Thursday = not possible
interface Repeats {
	cycle: 'DAY' | 'WEEK' | 'MONTH'
	times?: number
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

interface Submitter {
	name: string
	email: string
}

const schema = z.object({
	key: z.string().optional(),
	title: z.string({ required_error: 'Bitte Titel der Veranstaltung angeben' }),
	description: z.string({ required_error: 'Bitte Beschreibung der Veranstaltung angeben' }),
	website: z.string().url('Die angegebene Website ist keine gültige URL').optional(),
	time: z.object({
		start: z.string({ required_error: 'Bitte Beginn der Veranstaltung angeben' }),
		end: z.string().optional(),
		repeats: z
			.object({
				cycle: z.enum(['DAY', 'WEEK', 'MONTH'], { invalid_type_error: 'Ungültige Wiederholung' }),
				times: z
					.number({ invalid_type_error: 'Ungültige Zahl angegeben' })
					.positive('Zahl ist nicht positiv')
					.optional(),
			})
			.optional(),
	}),
	place: z.object({
		name: z.string({ required_error: 'Bitte Ort angeben' }),
		room: z.string().optional(),
		address: z.string().optional(),
		type: z.enum(['PHYSICAL', 'ONLINE'], { invalid_type_error: 'Ungültiger Typ des Orts' }),
	}),
	organizer: z
		.object({
			name: z.string(),
			phone: z
				.string()
				.regex(/^\s*\+?[0-9 /()-]\s*$/, 'Ungültige Telefonnummer angegeben')
				.optional(),
			email: z
				.string()
				.email('Ungültige E-Mail-Adresse bei Organisator*innen angegeben')
				.optional(),
			website: z.string().url('Ungültige URL bei Organisator*innen angegeben').optional(),
		})
		.optional(),
	pictureUrl: z.string().url('Ungültige URL beim Bild angegeben').optional(),
	tags: z.string({ required_error: 'Array an Tags fehlt' }).array(),
	submitter: z.object({
		name: z.string({ required_error: 'Dein Name fehlt' }),
		email: z
			.string({ required_error: 'Deine E-Mail-Adresse fehlt' })
			.email('Ungültige E-Mail-Adresse angegeben'),
	}),
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
