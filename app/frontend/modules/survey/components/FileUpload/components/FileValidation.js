import _ from 'lodash'

export default {
  run: (file, allowedFileTypes, maxFileSize) => {
    const errorCodes = []
    if (maxFileSize && file.size > (maxFileSize * 1000000)) {
      errorCodes.push('EntityTooLarge')
    }

    const extension = _.toLower(file.name.split('.').pop())
    if (!_.includes(allowedFileTypes, extension)) {
      errorCodes.push('WrongFileType')
    }
    return errorCodes
  },
}
