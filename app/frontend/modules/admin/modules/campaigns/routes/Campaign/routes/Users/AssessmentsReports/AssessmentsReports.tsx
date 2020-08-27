import React, { useEffect } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import {
  Row, Col, Button, PageHeader, Descriptions, Switch, Tag, Modal, message,
} from 'antd'
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import Modals from 'modules/admin/components/Modals/'
import _ from 'lodash'
import array from 'utils/array'
import ReportList from './ReportList'
import AssessmentList from './AssessmentList'
import AddReportModal from '../../AssessmentsReports/routes/Manage/AddReportModal'
import UpdateNormModal from '../../AssessmentsReports/routes/Manage/UpdateNormModal'
import { Strategies } from '../../AssessmentsReports/routes/Manage/AddReportModal/interfaces'
import styles from './styles.scss'
import { PropsFromRedux } from './connect'

const { I18n } = window

const MODALS = {
  AddReportModal,
  UpdateNormModal,
}

interface OwnProps {
  openModal(name: string, data?: { campaignId: number, userId: number, strategy: Strategies }): void,
}

interface Params {
  projectId: string
  campaignId: string
  id: string
}

export type Props = OwnProps & PropsFromRedux & RouteComponentProps<Params>

const AssessmentsReports: React.FC<Props> = ({
  user,
  assessmentStatuses,
  fetchSingleUser,
  match: { params: { projectId, campaignId, id } },
  openModal,
  remove,
  history,
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

  const campaignName = _.find(user.campaigns, { id: parsedCampaignId })?.name

  const handleDelete = () => {
    Modal.confirm({
      title: I18n.t('common.text.confirm'),
      icon: <ExclamationCircleOutlined />,
      centered: true,
      width: 650,
      content: I18n.t('campaign_users.details.modals.remove.title', { campaignName }),
      okText: I18n.t('common.text.ok'),
      cancelText: I18n.t('common.text.cancel'),
      onOk: () => {
        remove(campaignId, parsedUserId)
        history.push(`/administration/projects/${projectId}/new_campaigns/${campaignId}/users`)
        message.success(I18n.t('campaign_users.details.modals.remove.successfully', { email: user.email }))
      },
    })
  }

  return (
    <div>
      <Row justify="space-between" className="pm">
        <PageHeader
          ghost={false}
          onBack={() => history.push(`/administration/projects/${projectId}/new_campaigns/${campaignId}/users/`)}
          title={user.fullName}
          subTitle={user.email}
          extra={[
            <Button key="3" onClick={() => handleDelete()}>
              {I18n.t('common.actions.remove') }
            </Button>,
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
