import React, { useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  fetchResult,
} from '~/modules/endUser/modules/campaigns/core/anonym'
import { RootState } from '~/modules/endUser/core/rootReducers'
import Assessment from '~/modules/admin/modules/campaigns/interfaces/Assessment'
import { AgileUserAssessment } from '~/modules/endUser/modules/campaigns/routes/AgileUserAssessment'
import { Common as CommonAssessment } from './Assessments/Common'

const connector = connect(
  (state: RootState) => ({
    anonym: state.anonym,
  }),
  {
    fetchResult,
  },
)
export type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps {
  anonym: {
    loaded: boolean
    error: boolean
    assessment: Assessment
  }
}

type Props = PropsFromRedux & OwnProps

const AnonymComponent: React.FC<Props> = ({
  anonym: {
    loaded, error, assessment,
    results: { agileUserAssessmentUrl, agileUserAssessmentId },
  },
  fetchResult,
}) => {
  const params = useParams() as { assessmentKey: string }
  useEffect(() => {
    fetchResult(params.assessmentKey)
  }, [])

  if (!loaded || error) { return null }

  return assessment.category === 'agile'
    ? <AgileUserAssessment {...{ agileUserAssessmentUrl, agileUserAssessmentId }} />
    : <CommonAssessment />
}

export const Anonym = connector(AnonymComponent)
