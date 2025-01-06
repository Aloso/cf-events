import { z } from 'zod'
import { jsonResponse } from './http'

export interface Event {
	key?: string
	title: string
	descHtml: string
	website?: string
	time: Time | Time[]
	place: Place
	organizer?: Organizer // TODO: make non-optional
	pictureUrl?: string
	tags: string[]
	submitter: Submitter
	orgaNotes?: string
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
	name?: string
	room?: string
	address?: string
	url?: string
	type: 'PHYSICAL' | 'ONLINE'
}

interface Organizer {
	name?: string
	phone?: string
	email?: string
	website?: string
}

interface Submitter {
	name: string
	email: string
}

const timeSchema = z.object({
	start: z.string().min(1, 'Bitte Beginn der Veranstaltung angeben'),
	end: z.string().optional(),
})

const placeSchema = z.object({
	name: z.string().optional(),
	room: z.string().optional(),
	address: z.string().optional(),
	url: z.string().url('Die Teilnahme-URL ist ungültig').optional(),
	type: z.enum(['PHYSICAL', 'ONLINE'], { invalid_type_error: 'Ungültiger Typ des Orts' }),
})

const phoneRegex = /^\s*\+?[0-9 /()-]+\s*$/

const organizerSchema = z.object({
	name: z.string().min(1, 'Bitte Name der Organisator*innen angeben').optional(),
	phone: z.string().regex(phoneRegex, 'Ungültige Telefonnummer angegeben').optional(),
	email: z.string().email('Ungültige E-Mail-Adresse bei Organisator*innen angegeben').optional(),
	website: z.string().url('Ungültige URL bei Organisator*innen angegeben').optional(),
})

const submitterSchema = z.object({
	name: z.string().min(1, 'Dein Name fehlt'),
	email: z
		.string()
		.min(1, 'Deine E-Mail-Adresse fehlt')
		.email('Ungültige E-Mail-Adresse angegeben'),
})

const schema = z.object({
	key: z.string().optional(),
	title: z.string().min(1, 'Bitte Titel der Veranstaltung angeben'),
	descHtml: z.string().min(1, 'Bitte Beschreibung der Veranstaltung angeben'),
	website: z.string().url('Die angegebene Website ist keine gültige URL').optional(),
	time: z.array(timeSchema).or(timeSchema),
	place: placeSchema,
	organizer: organizerSchema.optional(),
	pictureUrl: z.string().url('Ungültige URL beim Bild angegeben').optional(),
	tags: z.string().min(1, 'Tag darf nicht leer sein').array(),
	submitter: submitterSchema,
	orgaNotes: z.string().optional(),
})

export function parseEvent(data: unknown): Event {
	if (typeof data === 'object' && data && 'description' in data) {
		delete data.description
	}
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
