import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modules } from 'components/modules'
import styles from './Question.scss'

class QuestionRenderer extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
  }

  renderModule () {
    const { model: { type } } = this.props
    const View = Modules[type] || Modules.MultipleChoice
    return <View {...this.props} />
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
