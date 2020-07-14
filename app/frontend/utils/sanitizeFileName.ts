/* eslint-disable no-control-regex */
import _ from 'lodash'

const ILLEGAL_CHARS_REGEX = /[(#<$+%>!`&*'|{?"=}/:\\\s@)]+/g
const CONTROL_CHARS_RANGE = /[\x00-\x1f\x80-\x9f]+/g
const BLANK_FILE_NAME = /^[\s_-]*$/
const DEFAULT_FILE_NAME = 'file'

const sanitize = (fileName: string, replacement = '_'): string => {
  replacement = _.trim(replacement).replace(ILLEGAL_CHARS_REGEX, '_')

  let sanitizedFileName = _.trim(fileName)
    .replace(ILLEGAL_CHARS_REGEX, replacement)
    .replace(CONTROL_CHARS_RANGE, replacement)

  const index = sanitizedFileName.lastIndexOf('.')

  if (BLANK_FILE_NAME.test(sanitizedFileName.substr(0, index))) {
    sanitizedFileName = DEFAULT_FILE_NAME + sanitizedFileName.substr(index)
  }
  return sanitizedFileName
}

export default sanitize
