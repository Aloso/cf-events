import { Renderer, parse } from 'marked'

export function mdToHtml(markdown: string): string {
	const renderer = new SafeRenderer({ gfm: true })
	return parse(markdown, { gfm: true, renderer }) as string
}

const allowedHtmlRegex =
	/^<\/?(br|details|summary|figure|table|tbody|thead|tfoot|tr|th|td|colgroup|col|caption)(\s+(align|colspan|rowspan)=("[^"]*"|'[^']*'))*\s*\/?>$/i

class SafeRenderer extends Renderer {
	html(html: string, block?: boolean | undefined): string {
		if (allowedHtmlRegex.test(html)) {
			return html
		}
		return ''
	}
}
