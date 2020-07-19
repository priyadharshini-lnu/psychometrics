import React from 'react'
import PropTypes from 'prop-types'
import styles from './Question.scss'
import CommentsList from './CommentsList'

const QuestionFooter = (props) => {
  const { model } = props
  return (
    <div className={styles.footer}>
      {model.showComments && <CommentsList {...props} />}
    </div>
  )
}

QuestionFooter.propTypes = {
  model: PropTypes.object.isRequired,
}

export default QuestionFooter
