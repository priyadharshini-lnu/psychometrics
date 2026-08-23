import { connect, ConnectedProps } from 'react-redux'
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Divider } from 'antd'
import { PageHeader } from '@ant-design/pro-components'
import { getCurrent, fetchSingle } from '~/modules/admin/modules/campaigns/core/assessors'
import { RootState } from '~/modules/admin/core/rootReducers'
import AssessmentList from './AssessmentList'

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
      <Divider style={{ margin: 0 }} />
      <AssessmentList />
    </>
  )
}
export default connecter(AssessorDetails)
