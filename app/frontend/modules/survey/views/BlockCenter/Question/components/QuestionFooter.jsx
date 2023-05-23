import styles from './Question.less'
import CommentsList from './CommentsList'

const QuestionFooter = (props) => {
  const { model } = props
  return (
    <div className={styles.footer}>
      {model.showComments && <CommentsList {...props} />}
    </div>
  )
}

export default QuestionFooter
