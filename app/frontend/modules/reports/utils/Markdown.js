import Remarkable from 'remarkable'

export const md = new Remarkable()

export function renderMarkdown (str) {
  try {
    return md.render(str)
  // eslint-disable-next-line no-console
  } catch (e) { console.warn(e) }
  return str
}
