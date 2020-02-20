/* eslint-disable react/no-danger */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import textEntryStyles from 'components/modules/TextEntry/components/TextEntry.scss'
import I18nStore from 'store/I18nStore'
import FileUploadBlock from 'components/FileUpload'
import AssessmentPreviewStore from 'store/AssessmentPreviewStore'

export class Preview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  successUpload = (data) => {
    const { model } = this.props
    model.result.answer(data.asset.url, data.id, data.filename)
  }

  removeFile = () => {
    const { model } = this.props
    model.result.answer()
  }

  renderFileUploadBlock () {
    const { model } = this.props
    const preview = AssessmentPreviewStore.type === 'preview_assessment'

    return (
      <FileUploadBlock
        model={model}
        fakeUpload={preview}
        onSuccessUpload={this.successUpload}
        onRemoveFile={this.removeFile}
      />
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
        {this.renderFileUploadBlock()}
      </div>
    )
  }
}

export default Preview
