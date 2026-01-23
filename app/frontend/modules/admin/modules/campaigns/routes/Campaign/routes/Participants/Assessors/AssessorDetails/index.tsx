import { connect, ConnectedProps } from 'react-redux'
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { PageHeader } from '@ant-design/pro-components'
import { getCurrent, fetchSingle } from '~/modules/admin/modules/campaigns/core/assessors'
import { RootState } from '~/modules/admin/core/rootReducers'
import AssessmentList from './AssessmentList'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    assessor: getCurrent(state),
  }),
  {
    fetchSingle,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>
export type Props = PropsFromRedux

const AssessorDetails: React.FC<Props> = ({ assessor, fetchSingle }) => {
  const { campaignId, id } = useParams() as { campaignId: string, id: string }
  const parsedCampaignId = parseInt(campaignId, 10)
  const parsedId = parseInt(id, 10)

  useEffect(() => {
    fetchSingle(parsedCampaignId, parsedId)
  }, [])

  if (!assessor) { return null }

  return (
    <>
      <PageHeader
        ghost={false}
        title={assessor.fullName}
        subTitle={assessor.email}
      />
      <div className="pl">
        <h3>{I18n.t('common.model.assessments')}</h3>
        <AssessmentList />
      </div>
    </>
  )
}
export default connecter(AssessorDetails)
