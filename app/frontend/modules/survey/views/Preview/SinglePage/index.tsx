import React from 'react'
import cs from 'classnames'
import { RootState } from 'modules/survey/core/rootReducers'
import { connect, ConnectedProps } from 'react-redux'
import { getAllAnsweredQuestions } from 'modules/survey/core/preview/FlowProcessor/selectors'
import QuestionList from '../QuestionList'
import styles from './styles.scss'

export type PropsFromRedux = ConnectedProps<typeof connecter>

interface Props extends PropsFromRedux {
  questions: []
}

const SinglePage: React.FC<Props> = ({
  questions,
}) => (
  <div className={styles.page}>
    <div className={cs(styles.block)}>
      <div>
        <div className={cs(styles.questionsBlock)}>
          <QuestionList page={null} readOnly questions={questions} backButtonPressed={false} />
        </div>
      </div>
    </div>
  </div>
)

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
