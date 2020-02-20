export default {
  run: (file, allowedMimeTypes, maxFileSize) => {
    const errorCodes = []
    if (maxFileSize && file.size > (maxFileSize * 1000000)) {
      errorCodes.push('EntityTooLarge')
    }

    if (!_.includes(allowedMimeTypes, file.type)) {
      errorCodes.push('WrongFileType')
    }
    return errorCodes
  },
}
