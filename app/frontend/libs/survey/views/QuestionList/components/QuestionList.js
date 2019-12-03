import React from 'react'
import Question from 'views/Question'
import PageBreak from 'components/PageBreak'
import styles from './QuestionList.scss'

export default function QuestionList ({ block, questions }) {
  return (
    <div className={styles.main}>
      {questions.map((question, i) => {
        if (question.type === 'PageBreak') {
          return <PageBreak store={{}} model={question} key={i} />
        }
        return <Question model={question} block={block} key={question.id} />
      })}
    </div>
  )
}
