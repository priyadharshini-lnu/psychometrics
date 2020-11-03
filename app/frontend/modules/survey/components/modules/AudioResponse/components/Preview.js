/* eslint-disable react/no-danger */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import textEntryStyles from 'components/modules/TextEntry/components/TextEntry.scss'
import AudioRecorder from 'components/AudioRecorder'
import connect from './connect'

export class Preview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    mediaUrl: PropTypes.string.isRequired,
  }

  successUpload = (data) => {
    const { addMediaResponse } = this.props
    addMediaResponse(data)
  }

  onRecordingDiscard = () => {
    const { model, removeMediaResponse } = this.props
    removeMediaResponse(model.id)
  }

  renderAudioResponseBlock () {
    const {
      model, type, mediaUrl, readOnly, markQuestionInProgress, removeQuestionInProgress, mediaResponse,
    } = this.props
    const preview = type === 'preview_assessment'

    return (
      <AudioRecorder
        mediaUrl={mediaUrl}
        model={model}
        fakeUpload={preview}
        readOnly={readOnly}
        mediaResponse={mediaResponse}
        onSuccessUpload={this.successUpload}
        onRecordingDiscard={this.onRecordingDiscard}
        markQuestionInProgress={markQuestionInProgress}
        removeQuestionInProgress={removeQuestionInProgress}
      />
    )
  }

  render () {
    const { model, I18n } = this.props
    I18n.tQuestion(model, 'questionText')
    return (
      <div>
        <div
          className={textEntryStyles.questionTextPreview}
          dangerouslySetInnerHTML={{ __html: I18n.tQuestion(model, 'questionText') }}
        />
        {this.renderAudioResponseBlock()}
      </div>
    )
  }
}

export default connect(Preview)
