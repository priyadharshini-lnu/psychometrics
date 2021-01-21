import { connect, ConnectedProps } from 'react-redux'
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { PageHeader } from 'antd'
import Breadcrumb from 'modules/admin/modules/campaigns/components/Breadcrumb'
import { getCurrent, fetchSingle } from 'modules/admin/modules/campaigns/core/assessors'
import { RootState } from 'modules/admin/core/rootReducers'
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
  const { campaignId, id } = useParams<{ campaignId: string, id: string }>()
  const parsedCampaignId = parseInt(campaignId, 10)
  const parsedId = parseInt(id, 10)

  useEffect(() => {
    fetchSingle(parsedCampaignId, parsedId)
  }, [])

  if (!assessor) { return null }

  return (
    <>
      <Breadcrumb
        request={{
          fields: ['project', 'campaign', 'client'],
          data: {
            campaignId: parsedCampaignId,
          },
        }}
        crumbs={[{
          link: () => '/administration',
          label: () => I18n.t('administration.clients.tenancies'),
        }, {
          link: state => `/administration/clients/${state.client.id}/projects`,
          label: state => state.client.name,
        }, {
          link: state => `/administration/projects/${state.project.id}/new_campaigns`,
          label: state => state.project.name,
        }, {
          link: state => (
            `/administration/projects/${state.project.id}/new_campaigns/${state.campaign.id}/participants/assessors`
          ),
          label: state => state.campaign?.name,
        },
        {
          label: () => assessor.email,
        },
        ]}
      />
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
