/* eslint-disable no-control-regex */

const ILLEGAL_CHARS_REGEX = /[(#<$+%>!`&*'|{?"=}/:\\\s@)]+/g
const CONTROL_CHARS_RANGE = /[\x00-\x1f\x80-\x9f]+/g

export const sanitize = (fileName: string): string => (
  fileName.replace(ILLEGAL_CHARS_REGEX, '_')
    .replace(CONTROL_CHARS_RANGE, '_')
)
