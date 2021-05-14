import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { SafeHTML } from 'components/SafeHTML'

import styles from './TextEntry.scss'
import Previews from './Previews'
import connect from '../connect'

export class Preview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  renderAnswersType () {
    const {
      readOnly, model, awsSpeechTextPresignedUrl, activeDictationOnQuestion, setDictationActiveOnQuestion,
    } = this.props
    const { type } = model.props
    const View = Previews[type]

    return (
      <View
        model={model}
        readOnly={readOnly}
        awsSpeechTextPresignedUrl={awsSpeechTextPresignedUrl}
        activeDictationOnQuestion={activeDictationOnQuestion}
        setDictationActiveOnQuestion={setDictationActiveOnQuestion}
      />
    )
  }

  render () {
    const { model, I18n } = this.props

    return (
      <div>
        <SafeHTML
          className={styles.questionTextPreview}
          html={I18n.tQuestion(model, 'questionText')}
          config="adminRichText"
        />
        {this.renderAnswersType()}
      </div>
    )
  }
}

export default connect(Preview)
