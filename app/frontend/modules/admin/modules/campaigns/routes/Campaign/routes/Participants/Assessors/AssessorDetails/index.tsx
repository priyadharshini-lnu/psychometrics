import { connect, ConnectedProps } from 'react-redux'
import React from 'react'
import { RouteComponentProps } from 'react-router-dom'
import {
  Row, Col, PageHeader,
} from 'antd'
import Breadcrumb from 'modules/admin/modules/campaigns/components/Breadcrumb'
import AssessmentList from './AssessmentList'
import { Strategies } from '../../../AssessmentsReports/routes/Manage/AddReportModal/interfaces'

const { I18n } = window

const connecter = connect(
  () => ({
  }),
  {
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>
interface OwnProps {
  openModal(name: string, data?: { campaignId: number, userId: number, strategy: Strategies }): void,
}

interface Params {
  projectId: string
  campaignId: string
  id: string
}

export type Props = OwnProps & PropsFromRedux & RouteComponentProps<Params>

const AssessorDetails: React.FC<Props> = ({
  match: { params: { campaignId } },
}) => {
  const parsedCampaignId = parseInt(campaignId, 10)

  return (
    <div>
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
          // eslint-disable-next-line max-len
          link: state => `/administration/projects/${state.project.id}/new_campaigns/${state.campaign.id}/participants/assessors`,
          label: state => state.campaign?.name,
        }]}
      />
      <Row justify="space-between" className="pm">
        <PageHeader
          ghost={false}
          title="user.fullName"
          subTitle="user.email"
        />
        <Col span={4} className="pls">
          Not implemented yet
        </Col>
      </Row>
      <div className="pm">
        <h3>{I18n.t('common.model.assessments')}</h3>
        <AssessmentList />
      </div>
    </div>
  )
}
export default connecter(AssessorDetails)
