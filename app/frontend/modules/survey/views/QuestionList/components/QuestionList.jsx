import FlipMove from 'react-flip-move'
import Question from '~/modules/survey/views/Question'
import PageBreak from '~/modules/survey/components/PageBreak'
import styles from './QuestionList.less'

export default function QuestionList ({ block, questions }) {
  return (
    <div className={styles.main}>
      <FlipMove style={{ position: 'initial' }}>
        {questions.map(question => (
          <div key={question.id}>
            {question.type === 'PageBreak'
              ? <PageBreak block={block} model={question} key={question.id} />
              : <Question model={question} block={block} />}
          </div>
        ))}
      </FlipMove>
    </div>
  )
}
