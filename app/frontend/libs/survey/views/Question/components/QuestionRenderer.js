import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modules } from 'components/modules'
import styles from './Question.scss'

class QuestionRenderer extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    blockStore: PropTypes.object.isRequired,
  }

  renderModule () {
    const { model } = this.props
    const View = Modules[model.type] || Modules.MultipleChoice
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
