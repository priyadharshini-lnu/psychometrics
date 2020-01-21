import React from 'react'
import Question from 'views/Question'
import PageBreak from 'components/PageBreak'
import FlipMove from 'react-flip-move'
import styles from './QuestionList.scss'

export default function QuestionList ({ block, questions }) {
  return (
    <div className={styles.main}>
      <FlipMove style={{ position: 'initial' }}>
        {questions.map((question) => {
          if (question.type === 'PageBreak') {
            return <PageBreak block={block} model={question} key={question.id} />
          }
          return <Question model={question} block={block} key={question.id} />
        })}
      </FlipMove>
    </div>
  )
}
