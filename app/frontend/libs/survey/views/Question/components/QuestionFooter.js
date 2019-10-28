import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './Question.scss'
import CommentsList from './CommentsList'
import SkipLogic from './SkipLogic'

class QuestionFooter extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
  }

  renderSkipLogic () {
    return (
      <div>
        <SkipLogic {...this.props} />
      </div>
    )
  }

  render () {
    const { model } = this.props
    return (
      <div className={styles.footer}>
        {model.showComments && <CommentsList {...this.props} />}
        {this.renderSkipLogic()}
      </div>
    )
  }
}

export default QuestionFooter
