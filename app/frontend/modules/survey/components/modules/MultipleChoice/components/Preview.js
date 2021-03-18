import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { SafeHTML } from 'components/SafeHTML'
import styles from './MultipleChoice.scss'
import Previews from './Previews'
import connect from '../connect'
import { ScoringTable } from './ScoringTable'

export class Preview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  renderAnswersType () {
    const { model, readOnly } = this.props
    const { type } = model.props
    const View = Previews[type]
    return <View model={model} preview readOnly={readOnly} />
  }

  renderContainer (html, classWithLtr) {
    return (
      <SafeHTML
        className={classWithLtr}
        html={html}
        config="adminRichText"
      />
    )
  }

  renderScoring () {
    const {
      scores, factors, I18n,
    } = this.props

    if (!scores || !_.size(scores)) { return null }

    return (
      <div>
        <ScoringTable factors={factors} scoring={scores} I18n={I18n} />
      </div>
    )
  }

  render () {
    const { model, I18n, showQuestionScoring } = this.props
    const html = I18n.tQuestion(model, 'questionText')
    let previewWithLtr = styles.questionTextPreview
    if (model.isNeedToAddLtrManually) {
      if (previewWithLtr.indexOf('ltr_direction') === -1) {
        previewWithLtr += ` ${styles.ltr_direction}`
      }
    }
    return (
      <div>
        {this.renderContainer(html, previewWithLtr)}
        {this.renderAnswersType()}
        {showQuestionScoring && this.renderScoring()}
      </div>
    )
  }
}

export default connect(Preview)
