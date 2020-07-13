/* eslint-disable no-control-regex */
import _ from 'lodash'

const ILLEGAL_CHARS_REGEX = /[(#<$+%>!`&*'|{?"=}/:\\\s@)]+/g
const CONTROL_CHARS_RANGE = /[\x00-\x1f\x80-\x9f]+/g
const BLANK_FILE_NAME = /^[\s_-]*$/

const sanitize = (fileName: string, replacement = '_'): string => {
  replacement = replacement.replace(ILLEGAL_CHARS_REGEX, '_')

  fileName = _.trim(fileName)

  let sanitizedFileName = fileName.replace(ILLEGAL_CHARS_REGEX, replacement)
    .replace(CONTROL_CHARS_RANGE, replacement)

  const index = sanitizedFileName.lastIndexOf('.')
  let fileNameWithoutExtension = sanitizedFileName.substr(0, index)

  if (BLANK_FILE_NAME.test(fileNameWithoutExtension)) {
    fileNameWithoutExtension = 'file'
    sanitizedFileName = fileNameWithoutExtension + sanitizedFileName.substr(index)
  }
  return sanitizedFileName
}

export default sanitize
