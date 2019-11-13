import _ from 'lodash'

const VideoResponse = function (result) {
  this.result = result
  this.videoResponse = true
}

_.extend(VideoResponse.prototype, {
  answer (url, mediaId) {
    if (url) {
      this.result.answers = [{ value: url, media_id: mediaId }]
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

export default VideoResponse
