import sanitizeHtmlLib from 'sanitize-html'

// prettier-ignore
const allowedTags = [
	// inline formatting
	'abbr', 'b', 'bdi', 'bdo', 'cite', 'code', 'em', 'i', 'kbd', 'mark', 'q', 's', 'samp', 'small', 'strong', 'sub', 'sup', 'u', 'wbr', 'var',
	// block formatting
	'address', 'article', 'blockquote', 'br', 'dd', 'dl', 'dt', 'figcaption', 'figure', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hgroup', 'hr', 'p', 'pre', 'section',
	// non-semantic tags
	'div', 'span',
	// interactive
	'a', 'img', 'details', 'summary',
	// tables
	'caption', 'col', 'colgroup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'time', 'tr',
	// lists
	'li', 'ol', 'ul',
]

const allowedAttributes: sanitizeHtmlLib.IOptions['allowedAttributes'] = {
	a: ['href', 'name', 'target'],
	img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'],
	td: ['colspan', 'rowspan', 'scope', 'abbr'],
	th: ['colspan', 'rowspan', 'scope', 'abbr'],
	col: ['span'],
	time: ['datetime'],
	'*': ['align', 'data-*', 'style'],
}

const allowedStyles: sanitizeHtmlLib.IOptions['allowedStyles'] = {
	'*': {
		'text-align': [/.*/],
	},
}

export function sanitizeHtml(html: string): string {
	return sanitizeHtmlLib(html, {
		allowedTags,
		allowedAttributes,
		allowedStyles,
		allowedSchemes: ['http', 'https', 'mailto', 'tel'],
	})
}
