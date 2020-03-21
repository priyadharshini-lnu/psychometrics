/* eslint-disable react/no-danger */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import textEntryStyles from 'components/modules/TextEntry/components/TextEntry.scss'
import VideoRecorder from 'components/VideoRecorder'
import connect from './connect'

export class Preview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  successUpload = (data) => {
    const { model } = this.props
    model.result.answer(data.asset.url, data.id, data.name)
  }

  deleteMedia = () => {
    const { model } = this.props
    model.result.answer()
  }

  renderVideoRecorder () {
    const { model, type, mediaUrl } = this.props
    const { result } = model
    const preview = type === 'preview_assessment'
    return (
      <div className="col-md-10 col-md-offset-1 col-lg-8 col-lg-offset-2">
        <VideoRecorder
          key={model.id}
          model={model}
          preview={preview}
          maxDuration={model.props.duration}
          result={result}
          mediaUrl={mediaUrl}
          onSuccessUpload={this.successUpload}
          onDeleteMedia={this.deleteMedia}
        />
      </div>
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
        {this.renderVideoRecorder()}
      </div>
    )
  }
}

export default connect(Preview)
