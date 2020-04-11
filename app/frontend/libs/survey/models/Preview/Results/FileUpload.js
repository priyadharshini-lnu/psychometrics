import _ from 'lodash'

const FileUpload = function (result) {
  this.result = result
  this.fileUpload = true
}

_.extend(FileUpload.prototype, {
  meta (data) {
    this.result.meta = data
  },

  answer (url, mediaId, filename) {
    if (url) {
      this.result.answers = [{ value: url, media_id: mediaId, filename }]
    } else {
      this.result.answers = []
    }
  },

  results () {
    return this.result.answers
  },

  // Force Response
  requiredValidation () {
    return _.compact(_.map(this.result.answers, 'value')).length
  },
})

export default FileUpload
