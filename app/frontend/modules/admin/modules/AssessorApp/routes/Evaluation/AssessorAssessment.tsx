import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Layout, Card, Progress,
} from 'antd'
import AssessmentContainer from 'modules/survey/containers/AssessmentContainer'
import { getProgress } from 'core/preview/FlowProcessor/selectors'
import _ from 'lodash'
import styles from './styles.scss'

const { Content } = Layout

const mapStateToProps = state => ({
  loaded: state.assessors.evaluation.loaded,
  assessment: state.assessors.evaluation.assessment,
  result: state.assessors.evaluation.result,
  preview: state.preview,
  progress: state.preview.initialized && getProgress(state.preview),
})

const mapDispatchToProps = {}

const connecter = connect(mapStateToProps, mapDispatchToProps)

interface Props extends ConnectedProps<typeof connecter> {
  userAssessmentId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store: any
}

const AssessorAssessment: React.FC<Props> = ({
  store,
  loaded,
  userAssessmentId,
  assessment,
  result,
  progress,
  preview: {
    initialized,
    enableProgress,
  },
}) => {
  const bodyStyles = { padding: 0 }

  return (
    <Card
      loading={!loaded}
      title={_.get(assessment, 'name', '')}
      bordered={false}
      bodyStyle={bodyStyles}
      className={styles.card}
      extra={[
        enableProgress
          && (<Progress key="1" percent={progress} style={{ width: '200px' }} />),
      ]}
    >
      <Content className="fluid-container">
        {loaded && (
          <AssessmentContainer
            id="pass_assessment"
            initialized={initialized}
            type="pass_assessment"
            data={assessment}
            result={result}
            resultsUrl={`/assessors/evaluations/${userAssessmentId}/results/${result.id}`}
            rstore={store}
          />
        )}
      </Content>
    </Card>
  )
}

export default connecter(AssessorAssessment)
