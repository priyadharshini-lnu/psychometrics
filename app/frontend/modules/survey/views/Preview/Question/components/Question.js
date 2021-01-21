import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cs from 'classnames'
import Previews from 'components/modules/Previews'
import QuestionSerializer from 'models/QuestionSerializer'
import { initAudioPlayer } from 'modules/survey/hooks/useAudioPlayer'
import { isEmailTextEntryQuestion } from 'modules/survey/utils/question'
import styles from './Question.scss'

class Question extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    page: PropTypes.object.isRequired,
    readOnly: PropTypes.bool,
    randomseed: PropTypes.string,
  }

  componentDidMount () {
    initAudioPlayer(this.question)
  }

  update = () => {
    this.forceUpdate()
  }

  addLtrStyleIfNeed = phrase => (phrase.match(/[A-Za-z]+(?:\|;|\.|!|\?|:)/) !== null ? { direction: 'ltr' } : {})

  renderPreview () {
    const { model, result, randomseed } = this.props
    const View = Previews[`${model.type}Preview`] || Previews.MultipleChoice
    return (
      <View
        {...this.props}
        model={QuestionSerializer.wrap(model, result.answers, result.not_applicable, randomseed)}
        preview
      />
    )
  }

  renderError () {
    const { errors } = this.props
    return (
      errors.map((err, i) => (
        <div key={i} className={styles.error} style={this.addLtrStyleIfNeed(err.message || '')}>
          {err.message}
        </div>
      ))
    )
  }

  render () {
    const { model, moduleConfig, hideHiddenQuestions } = this.props
    const hidden = hideHiddenQuestions && moduleConfig.hidden

    const stylesProps = {
      display: hidden ? 'none' : 'flex',
      overflow: 'auto',
    }

    return (
      <div
        style={stylesProps}
        ref={(ref) => { this.question = ref }}
        name={`question_${model.id}`}
        className={`${styles.question} highlight-container`}
      >
        <div className={styles.content}>
          {!model.valid && !isEmailTextEntryQuestion(model) && this.renderError()}
          <div className={cs(styles.contentOuter, 'fr-view')}>
            {this.renderPreview()}
          </div>
        </div>
      </div>
    )
  }
}

export default Question
