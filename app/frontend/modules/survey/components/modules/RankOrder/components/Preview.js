/* eslint-disable react/no-danger */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './RankOrder.scss'
import Previews from './Previews'
import connect from '../connect'

export class Preview extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  componentDidMount () {
    const { model } = this.props
    model.result.reduxAnswer()
  }

  renderAnswersType () {
    const { model, readOnly } = this.props
    const { type } = model.props
    const View = Previews[type]
    return <View model={model} preview readOnly={readOnly} />
  }

  render () {
    const { model, I18n } = this.props
    return (
      <div>
        <div
          className={styles.questionTextPreview}
          dangerouslySetInnerHTML={{ __html: I18n.tQuestion(model, 'questionText') }}
        />
        {this.renderAnswersType()}
      </div>
    )
  }
}

export default connect(Preview)
