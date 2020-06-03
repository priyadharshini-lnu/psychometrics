export default {
  run: (file, allowedFileTypes, maxFileSize) => {
    const errorCodes = []
    if (maxFileSize && file.size > (maxFileSize * 1000000)) {
      errorCodes.push('EntityTooLarge')
    }

    const extension = file.name.split('.').pop()
    allowedFileTypes = _.includes(allowedFileTypes, 'jpg') ? [...allowedFileTypes, 'jpeg'] : allowedFileTypes
    if (!_.includes(allowedFileTypes, extension)) {
      errorCodes.push('WrongFileType')
    }
    return errorCodes
  },
}
