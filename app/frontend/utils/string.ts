
export const shortify = (str: string) => {
  const text = str.replace(/[^a-z0-9\s]/gi, '').toUpperCase().split(' ')
  if (text.length === 0) return ''
  if (text.length === 1 && text[0].length === 0) return ''
  if (text.length > 1) return `${text[0][0]}${text[1][0]}`
  if (text[0].length > 1) return text[0].substr(0, 2)
  return text[0][0]
}
