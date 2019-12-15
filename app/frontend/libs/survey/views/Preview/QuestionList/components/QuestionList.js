import React from 'react'
import Question from 'views/Preview/Question'
import store from 'store/AssessmentPreviewStore'
import styles from './QuestionList.scss'

const QuestionList = ({ page }) => {
  const list = page.questions
  return (
    <div className={styles.main}>
      {list.map((question, i) => {
        if (store.hideHiddenQuestions && question.moduleConfig.hidden) {
          return <Question readOnly={store.readOnly} page={page} model={question} key={i} hidden />
        }
        return <Question readOnly={store.readOnly} page={page} model={question} key={i} />
      })}
    </div>
  )
}

export default QuestionList
