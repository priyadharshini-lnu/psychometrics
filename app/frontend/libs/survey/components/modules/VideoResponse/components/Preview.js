/* eslint-disable react/no-danger */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import textEntryStyles from 'components/modules/TextEntry/components/TextEntry.scss'
import I18nStore from 'store/I18nStore'
import VideoRecorder from 'components/VideoRecorder'
import AssessmentPreviewStore from 'store/AssessmentPreviewStore'
import MultiLinePreview from './MultiLinePreview'

export class Preview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  successUpload = (data) => {
    const { model } = this.props
    model.result.answer(data.asset.url, data.id)
  }

  deleteMedia = () => {
    const { model } = this.props
    model.result.answer()
  }

  renderAnswersType () {
    const { model } = this.props
    return <MultiLinePreview model={model} />
  }

  renderVideoRecorder () {
    const { model } = this.props
    const { result } = model
    const preview = AssessmentPreviewStore.type === 'preview_assessment'
    return (
      <div className="col-md-10 col-md-offset-1 col-lg-8 col-lg-offset-2">
        <VideoRecorder
          key={model.id}
          model={model}
          preview={preview}
          maxDuration={model.props.duration}
          result={result}
          onSuccessUpload={this.successUpload}
          onDeleteMedia={this.deleteMedia}
        />

      </div>
    )
  }

  render () {
    const { model } = this.props
    I18nStore.tQuestion(model, 'questionText')
    return (
      <div>
        <div
          className={textEntryStyles.questionTextPreview}
          dangerouslySetInnerHTML={{ __html: I18nStore.tQuestion(model, 'questionText') }}
        />
        {/* {this.renderAnswersType()} */}
        {this.renderVideoRecorder()}
      </div>
    )
  }
}

export default Preview
