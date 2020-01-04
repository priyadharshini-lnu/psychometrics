import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Previews from 'components/modules/Previews'
import store from 'store/AssessmentPreviewStore'
import QuestionSerializer from 'models/QuestionSerializer'
import styles from './Question.scss'

class Question extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    page: PropTypes.object.isRequired,
    readOnly: PropTypes.bool,
  }

  update = () => {
    this.forceUpdate()
  }

  addLtrStyleIfNeed = phrase => (phrase.match(/[A-Za-z]+(?:\|;|\.|!|\?|:)/) !== null ? { direction: 'ltr' } : {})

  renderPreview () {
    const { model, result } = this.props
    const View = Previews[`${model.type}Preview`] || Previews.MultipleChoice
    return <View {...this.props} model={QuestionSerializer.wrap(model, result.answers)} preview />
  }

  renderError () {
    const { errors } = this.props
    return (
      errors.map((err, i) => (
        <div key={i} className={styles.error} style={this.addLtrStyleIfNeed(err.message)}>
          {err.message}
        </div>
      ))
    )
  }

  render () {
    const { model, moduleConfig } = this.props
    const hidden = store.hideHiddenQuestions && moduleConfig.hidden
    const stylesProps = {
      display: hidden ? 'none' : 'flex',
      overflow: 'auto',
      marginTop: '20px',
    }
    return (
      <div
        style={stylesProps}
        ref={(ref) => { this.question = ref }}
        name={`question_${model.id}`}
        className={`${styles.question}`}
      >
        <div className={styles.content}>
          {!model.valid && this.renderError()}
          <div className={styles.contentOuter}>
            {this.renderPreview()}
          </div>
        </div>
      </div>
    )
  }
}

export default Question
