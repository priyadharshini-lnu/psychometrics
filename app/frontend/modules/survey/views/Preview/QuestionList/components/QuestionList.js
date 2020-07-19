import React from 'react'
import Question from 'views/Preview/Question'
import QuestionSerializer from 'models/QuestionSerializer'
import styles from './QuestionList.scss'

const QuestionList = ({ page, questions, readOnly }) => (
  <div className={styles.main}>
    {questions.map((q) => {
      const question = QuestionSerializer.wrap(q)
      return <Question readOnly={readOnly} page={page} model={q} key={question.id} />
    })}
  </div>
)

export default QuestionList
