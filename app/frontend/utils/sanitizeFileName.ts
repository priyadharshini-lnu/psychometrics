/* eslint-disable no-control-regex */

const ILLEGAL_CHARS_REGEX = /[(#<$+%>!`&*'|{?"=}/:\\@)]+/g
const CONTROL_CHARS_RANGE = /[\x00-\x1f\x80-\x9f]+/g
const SPACE_REGEX = /\s/g
const WINDOWS_RESERVED_RANGE = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i
const RESERVED_FILE_NAMES_FOR_UNIX = /^\.+$/
const RESERVED_FILE_NAMES_FOR_WINDOWS = /[. ]+$/

export const sanitize = (fileName: string): string => (
  fileName.replace(SPACE_REGEX, '')
    .replace(ILLEGAL_CHARS_REGEX, '_')
    .replace(CONTROL_CHARS_RANGE, '_')
    .replace(WINDOWS_RESERVED_RANGE, '_')
    .replace(RESERVED_FILE_NAMES_FOR_UNIX, '_')
    .replace(RESERVED_FILE_NAMES_FOR_WINDOWS, '_')
)
