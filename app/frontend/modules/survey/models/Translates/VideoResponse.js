import BaseTranslate from './BaseTranslate'

class VideoResponse extends BaseTranslate {
  getValueByCode (field) {
    if (field === 'questionText') {
      return this.question.props.questionText
    }
  }

  exportLocales () {
    const result = {
      questionText: this.question.props.questionText,
    }
    return result
  }
}

export default VideoResponse
