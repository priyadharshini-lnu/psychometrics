
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
