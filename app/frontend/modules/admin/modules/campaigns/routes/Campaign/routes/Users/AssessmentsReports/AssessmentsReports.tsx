import React, { useEffect } from 'react'
import {
  Row, Col, Button, PageHeader, Descriptions, Switch, Tag,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import Modals from 'modules/admin/components/Modals/'
import _ from 'lodash'
import array from 'utils/array'
import ReportList from './ReportList'
import AssessmentList from './AssessmentList'
import AddReportModal from '../../AssessmentsReports/AddReportModal'
import UpdateNormModal from '../AssessmentsReports/UpdateNormModal'
import { Strategies } from '../../AssessmentsReports/AddReportModal/interfaces'
import styles from './styles.scss'
import { PropsFromRedux } from './connect'

const { I18n } = window

const MODALS = {
  AddReportModal,
  UpdateNormModal,
}

interface OwnProps {
  match: {
    params: {
      projectId: string, campaignId: string, id: string,
    }
  },
  openModal(name: string, data?: { campaignId: number, userId: number, strategy: Strategies }): void
}
export type Props = OwnProps & PropsFromRedux

const AssessmentsReports: React.FC<Props> = ({
  user,
  assessmentStatuses,
  fetchSingleUser,
  match: { params: { projectId, campaignId, id } },
  openModal,
}) => {
  const parsedCampaignId = parseInt(campaignId, 10)
  const parsedUserId = parseInt(id, 10)

  useEffect(() => {
    fetchSingleUser(parsedCampaignId, parsedUserId)
  }, [])

  if (!user) { return null }

  const statusToColor = { new: 'blue', progress: 'orange', completed: 'green' }

  const userCampaigns = () => {
    const campaigns = user.campaigns.map((campaign) => {
      if (campaign.id === parsedCampaignId) { return campaign.name }
      return (
        <a key={campaign.id} href={`/administration/projects/${projectId}/new_campaigns/${campaignId}`}>
          {campaign.name}
        </a>
      )
    })
    return array.joinJSXElements(campaigns, ', ')
  }

  return (
    <div>
      <Row justify="space-between" className="pm">
        <PageHeader
          ghost={false}
          onBack={() => window.history.back()}
          title={user.fullName}
          subTitle={user.email}
          extra={[
            <Button key="3">{I18n.t('common.actions.remove')}</Button>,
          ]}
        >
          <Descriptions size="small" column={3}>
            <Descriptions.Item label={I18n.t('common.column.status')}>
              <Switch checked={user.disabled} />
            </Descriptions.Item>
            <Descriptions.Item label={I18n.t('common.model.campaigns')}>
              {userCampaigns()}
            </Descriptions.Item>
            <Descriptions.Item label={I18n.t('campaign_users.details.completion_status')}>
              {_.map(assessmentStatuses, (value, status) => (
                <Tag key={status} color={statusToColor[status]}>{`${value} ${_.capitalize(status)}`}</Tag>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label={I18n.t('campaign_users.details.last_login')}>
              {user.lastSignInAt || I18n.t('campaign_users.details.not_logged_in_yet')}
            </Descriptions.Item>
            <Descriptions.Item label={I18n.t('common.column.created_at')}>
              {user.createdAt}
            </Descriptions.Item>
          </Descriptions>
        </PageHeader>
        <Col span={4} className="pls">
          <h3>{I18n.t('common.model.reports')}</h3>
        </Col>
        <div>
          <div className={styles.newReportButton}>
            <Button
              type="primary"
              onClick={() => openModal('AddReportModal', {
                campaignId: parsedCampaignId,
                userId: parsedUserId,
                strategy: Strategies.SINGLE,
              })}
            >
              <PlusOutlined />
              <span>{I18n.t('reports.actions.add')}</span>
            </Button>
          </div>
        </div>
      </Row>
      <div className="pm">
        <ReportList />
        <div className={styles.tableDivider} />
        <h3>{I18n.t('common.model.assessments')}</h3>
        <AssessmentList />
      </div>
      <Modals modals={MODALS} />
    </div>
  )
}

export default AssessmentsReports
