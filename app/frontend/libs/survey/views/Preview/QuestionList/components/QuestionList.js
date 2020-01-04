import React from 'react'
import Question from 'views/Preview/Question'
import store from 'store/AssessmentPreviewStore'
import QuestionSerializer from 'models/QuestionSerializer'
import styles from './QuestionList.scss'

const QuestionList = ({ page, questions }) => (
  <div className={styles.main}>
    {questions.map((q) => {
      const question = QuestionSerializer.wrap(q)
      return <Question readOnly={store.readOnly} page={page} model={q} key={question.id} />
    })}
  </div>
)

export default QuestionList
