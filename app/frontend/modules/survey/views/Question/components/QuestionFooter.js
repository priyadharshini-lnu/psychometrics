import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './Question.scss'
import CommentsList from './CommentsList'
import SkipLogic from './SkipLogic'

class QuestionFooter extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  renderSkipLogic () {
    return (
      <div>
        <SkipLogic {...this.props} />
      </div>
    )
  }

  render () {
    const { model: { showComments, comments } } = this.props
    return (
      <div className={styles.footer}>
        {(showComments || comments.length > 0) && <CommentsList {...this.props} />}
        {this.renderSkipLogic()}
      </div>
    )
  }
}

export default QuestionFooter
