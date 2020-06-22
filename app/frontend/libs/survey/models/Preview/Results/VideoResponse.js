import _ from 'lodash'

const VideoResponse = function (result) {
  this.result = result
}

_.extend(VideoResponse.prototype, {
  answer (url, mediaId, takeNo = 1) {
    if (!url) {
      this.result.answers = []
      return
    }
    if (!this.result.answers) { this.result.answers = [] }
    this.result.answers = [
      ...this.result.answers,
      { value: url, media_id: mediaId, take_no: takeNo },
    ]
  },

  userSelectedTake (takeNo) {
    this.result.answers = this.result.answers.map(answer => (
      { ...answer, user_selected: answer.take_no === takeNo }
    ))
    this.result.reduxAnswer()
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
