
export const shortify = (str: string) => {
  const text = str.replace(/[^a-z0-9\s]/gi, '')
    .toUpperCase().split(' ').filter(x => x.length)
  if (text.length === 0) return ''
  if (text.length === 1 && text[0].length === 0) return ''
  if (text.length > 1) return `${text[0][0]}${text[1][0]}`
  if (text[0].length > 1) return text[0].substr(0, 2)
  return text[0][0]
}

export const truncateWithStartEndCharCount = (str: string, start_length: number, end_length: number) => {
  if (str.length <= (start_length + end_length)) return str
  return (
    `${str.substr(0, start_length)}...${str.substr(str.length - end_length)}`
  )
}

export const slugify = (str: string) => String(str)
  .normalize('NFKD') // split accented characters into their base characters and diacritical marks
  .replace(/[\u0300-\u036f]/g, '') // remove all the accents, which happen to be all in the \u03xx UNICODE block.
  .trim() // trim leading or trailing whitespace
  .toLowerCase() // convert to lowercase
  .replace(/[^a-z0-9 \-_]/g, '') // remove non-alphanumeric characters expect hyphens, spaces and underscores
  .replace(/\s+/g, '_') // replace spaces with underscores
  .replace(/-+/g, '_')

export const escapeSpecialChars = str => str.replace(/\\n/g, '\\n')
  .replace(/\\'/g, "\\'")
  .replace(/\\"/g, '\\"')
  .replace(/\\&/g, '\\&')
  .replace(/\\r/g, '\\r')
  .replace(/\\t/g, '\\t')
  .replace(/\\b/g, '\\b')
  .replace(/\\f/g, '\\f')
