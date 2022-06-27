import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modules } from 'components/modules'
import QuestionSerializer from 'models/QuestionSerializer'
import styles from './Question.less'

class QuestionRenderer extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  renderModule () {
    const { model, model: { type } } = this.props
    const View = Modules[type] || Modules.MultipleChoice
    return <View {...this.props} model={QuestionSerializer.wrap(model)} />
  }

  render () {
    return (
      <div className={styles.contentOuter}>
        {this.renderModule()}
      </div>
    )
  }
}

export default QuestionRenderer
