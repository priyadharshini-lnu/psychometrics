import React from 'react'
import PropTypes from 'prop-types'
import textEntryStyles from 'components/modules/TextEntry/components/TextEntry.scss'
import TextEditor from 'components/TextEditor'
import FileUploadBlock from 'components/FileUpload'

export class FileUpload extends React.Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeQuestionText = (value) => {
    const { model } = this.props
    model.props.questionText = value
    model.update()
    this.forceUpdate()
  }

  render () {
    const { model, readOnly } = this.props
    return (
      <div className="position-relative">
        <div className={textEntryStyles.questionText}>
          <TextEditor model={model} value={model.props.questionText} onChange={this.changeQuestionText} />
        </div>
        <FileUploadBlock model={model} fakeUpload readOnly={readOnly} />
      </div>
    )
  }
}

export default FileUpload
