import React, { useState, useRef } from 'react'
import cs from 'classnames'
import { connect, ConnectedProps } from 'react-redux'
import { Button } from 'antd'
import { useMessageBus } from '~/hooks/useMessageBus'
import { RootState } from '~/modules/survey/core/rootReducers'
import { getAllAnsweredQuestions } from '~/modules/survey/core/preview/FlowProcessor/selectors'
import QuestionList from '../QuestionList'
import styles from './styles.less'

export type PropsFromRedux = ConnectedProps<typeof connecter>

const { I18n } = window
interface Props extends PropsFromRedux {
  questions: []
}
let divScrollTop = 0

const SinglePage: React.FC<Props> = ({
  questions,
}) => {
  const [visibleQuestions, setVisibleQuestions] = useState<number[]>([])
  const ref = useRef<HTMLDivElement>(null)

  const updateVisibility = (questionIds) => {
    if (questionIds.length > 0) {
      if (ref.current) {
        divScrollTop = ref.current.scrollTop
        ref.current.scroll({
          top: 0,
          behavior: 'smooth',
        })
      }
    } else {
      setTimeout(() => {
        if (divScrollTop && ref.current) {
          ref.current.scroll({
            top: divScrollTop,
            behavior: 'smooth',
          })
        }
      }, 500)
    }

    setVisibleQuestions(questionIds)
  }

  useMessageBus('show_questions', (questionIds) => {
    updateVisibility(questionIds)
  })

  const filteredQuestions = visibleQuestions.length
    ? questions.filter((q:{id:number}) => visibleQuestions.includes(q.id))
    : questions

  return (
    <div ref={ref} className={styles.page}>
      {visibleQuestions.length > 0 && (
        <div className={styles.message}>
          {I18n.t('assessments.single_page.display_linked_questions')}
          <Button type="link" onClick={() => updateVisibility([])}>Show All</Button>
        </div>
      )}
      <div className={cs(styles.block)}>
        <div>
          <div className={cs(styles.questionsBlock)}>
            <QuestionList page={null} readOnly questions={filteredQuestions} backButtonPressed={false} />
          </div>
        </div>
      </div>
    </div>
  )
}

export const connecter = connect(
  (state: RootState) => {
    const { preview, preview: { initialized } } = state

    return {
      preview,
      questions: initialized && getAllAnsweredQuestions(preview),
      results: preview.results,
    }
  },
  {},
)

export default connecter(SinglePage)
