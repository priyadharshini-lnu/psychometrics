import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Previews from 'components/modules/Previews'
import styles from './Question.scss'

class Question extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    hidden: PropTypes.bool,
    page: PropTypes.object.isRequired,
    readOnly: PropTypes.bool,
  }

  update = () => {
    this.forceUpdate()
  }

  addLtrStyleIfNeed = phrase => (phrase.match(/[A-Za-z]+(?:\|;|\.|!|\?|:)/) !== null ? { direction: 'ltr' } : {})

  renderPreview () {
    const { model } = this.props
    const View = Previews[`${model.type}Preview`] || Previews.MultipleChoice
    return <View {...this.props} preview />
  }

  renderError () {
    const { model } = this.props
    return (
      model.errors.map((err, i) => (
        <div key={i} className={styles.error} style={this.addLtrStyleIfNeed(err.message)}>
          {err.message}
        </div>
      ))
    )
  }

  render () {
    const { model, hidden } = this.props
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
