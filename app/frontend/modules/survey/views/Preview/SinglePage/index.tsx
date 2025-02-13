import React, { useState, useRef } from 'react'
import cs from 'classnames'
import { connect, ConnectedProps } from 'react-redux'
import { Button, Alert } from 'antd'
import _ from 'lodash'
import { useMessageBus } from '~/hooks/useMessageBus'
import { RootState } from '~/modules/survey/core/rootReducers'
import { getAllAnsweredQuestions } from '~/modules/survey/core/preview/FlowProcessor/selectors'
import QuestionList from '../QuestionList'
import styles from './styles.less'
import StaticContent from '~/modules/survey/views/Preview/StaticContent'

export type PropsFromRedux = ConnectedProps<typeof connecter>

const { I18n } = window
interface Props extends PropsFromRedux {
  questions: []
}
let divScrollTop = 0

const SinglePage: React.FC<Props> = ({
  questions, blocks, preview,
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


  const withSymbols = filteredQuestions.map(
    (q:{block_id: number}) => ({ ...q, block_id: Symbol.for(q.block_id.toString()) }),
  )
  const visibleBlocks = _.groupBy(withSymbols, 'block_id') as object

  if (!questions.length) {
    return (
      <div ref={ref} className={styles.page}>
        <Alert type="warning" message={I18n.t('administration.assessor.moderate_score.no_results')} />
      </div>
    )
  }

  return (
    <div ref={ref} className={styles.page}>
      {visibleQuestions.length > 0 && (
        <div className={styles.message}>
          {I18n.t('assessments.single_page.display_linked_questions')}
          <Button type="link" onClick={() => updateVisibility([])}>Show All</Button>
        </div>
      )}
      {_.map(Reflect.ownKeys(visibleBlocks), (blockId: symbol) => {
        const questions = visibleBlocks[blockId]
        const block = blocks[blockId.description as string]
        const { staticContent } = block.props

        return (
          <div className={cs(styles.block)} key={blockId.description}>
            <div>
              {staticContent && <StaticContent {...{ block }} key={blockId.description} />}
              <div className={cs(styles.questionsBlock)}>
                <QuestionList
                  allErrors={preview.errors}
                  focusFirstError={preview.focusFirstError}
                  page={null}
                  readOnly
                  questions={questions}
                  backButtonPressed={false}
                  singleQuestionPerPage={preview.enableSingleQuestionPage}
                />
              </div>
            </div>
          </div>
        )
      })}

    </div>
  )
}

export const connecter = connect(
  (state: RootState) => {
    const { preview, preview: { initialized } } = state

    return {
      preview,
      questions: initialized && getAllAnsweredQuestions(preview),
      blocks: preview.blocks,
      results: preview.results,
    }
  },
  {},
)

export default connecter(SinglePage)
