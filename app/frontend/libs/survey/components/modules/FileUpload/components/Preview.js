/* eslint-disable react/no-danger */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import textEntryStyles from 'components/modules/TextEntry/components/TextEntry.scss'
import FileUploadBlock from 'components/FileUpload'
import connect from './connect'

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
    const {
      model, mediaUrl, type, readOnly,
    } = this.props
    const preview = type === 'preview_assessment'

    return (
      <FileUploadBlock
        mediaUrl={mediaUrl}
        model={model}
        readOnly={readOnly}
        fakeUpload={preview}
        onSuccessUpload={this.successUpload}
        onRemoveFile={this.removeFile}
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
        {this.renderFileUploadBlock()}
      </div>
    )
  }
}

export default connect(Preview)
