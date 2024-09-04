import { useTransition, animated as a } from 'react-spring'
import Question from '~/modules/survey/views/Preview/Question'
import QuestionSerializer from '~/modules/survey/models/QuestionSerializer'
import styles from './QuestionList.less'


const QuestionList = ({
  page, questions, readOnly, backButtonPressed = false, defaultLanguage = 'en',
}) => {
  const transition = useTransition(questions, {
    from: { opacity: 0, transform: `translate(0px, ${backButtonPressed ? -100 : 100}px)` },
    enter: {
      opacity: 1,
      position: 'relative',
      transform: 'translate(0px, 0px)',
      delay: 300,
      pointerEvents: 'auto',
    },
    leave: {
      opacity: 0,
      position: 'absolute',
      transform: `translate(0px, ${backButtonPressed ? 100 : -100}px)`,
      pointerEvents: 'none',
    },
    config: (item, state) => {
      switch (state) {
        case 'enter': return { delay: 200, duration: 500 }
        case 'leave': return { duration: 300 }
        default: return {}
      }
    },
    key: q => q.id,
  })

  return transition((style, q) => {
    const question = QuestionSerializer.wrap(q)

    return (
      <a.div className={styles.main} style={{ ...style }} key={q.key}>
        <Question
          readOnly={readOnly}
          page={page}
          model={q}
          key={question.id}
          defaultLanguage={defaultLanguage}
          questionCount={questions.length}
        />
      </a.div>
    )
  })
}

export default QuestionList
