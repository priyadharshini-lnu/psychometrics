import { useParams } from 'react-router-dom'
import {
  Row, Col, Button, App, Space,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import _ from 'lodash'
import ReportList from './ReportList'
import AssessmentList from './AssessmentList'
import { Strategies } from '../../../AssessmentsReports/routes/AssessmentsReports/AddReportModal/interfaces'
import { ProctoringSessionList } from './ProctoringSessionList'
import styles from './styles.less'
import { PropsFromRedux } from './connect'

const { I18n } = window

interface OwnProps {
  openModal(name: string, data?: { campaignId: number, userId: number, strategy: Strategies }): void,
}

export type Props = OwnProps & PropsFromRedux

const AssessmentsReports: React.FC<Props> = ({
  user,
  openModal,
  selectedIds,
  regenerateReports,
  regenerateInProgress,
  proctoringSessions,
  bulkDownload,
  bulkDownloadInProgress,
}) => {
  const { campaignId, id } = useParams() as {campaignId:string, tab:string, id: string}
  const parsedCampaignId = parseInt(campaignId, 10)
  const parsedUserId = parseInt(id, 10)
  const { message } = App.useApp()

  const handleDownload = () => {
    bulkDownload(parsedCampaignId, selectedIds).then(() => {
      message.success(I18n.t('campaign_report.messages.bulk_download_successful'))
    })
  }

  const handleRegenerateReports = () => {
    regenerateReports(parsedCampaignId, selectedIds).then(() => {
      message.success(I18n.t('user_reports.messages.regenerate_successful'))
    })
  }

  return (
    <div>
      <Row justify="space-between">
        <Col span={4} className="pls">
          <h3>{I18n.t('common.model.reports')}</h3>
        </Col>
        <div>
          <div className={styles.newReportButton}>
            <Space>
              {user.permissions.bulkDownload && (
                <Button
                  type="default"
                  onClick={handleDownload}
                  disabled={_.isEmpty(selectedIds) || bulkDownloadInProgress}
                  loading={bulkDownloadInProgress}
                >
                  <span>{I18n.t('user_reports.actions.download')}</span>
                </Button>
              )}
              {user.permissions.regenerateReport && (
                <Button
                  type="default"
                  onClick={handleRegenerateReports}
                  disabled={_.isEmpty(selectedIds) || regenerateInProgress}
                  loading={regenerateInProgress}
                >
                  <span>{I18n.t('user_reports.actions.regenerate')}</span>
                </Button>
              )}
              {user.permissions.addReport && (
                <Button
                  type="primary"
                  onClick={() => openModal('AddReportModal', {
                    campaignId: parsedCampaignId,
                    userId: parsedUserId,
                    strategy: Strategies.SINGLE,
                  })}
                >
                  <PlusOutlined />
                  <span>{I18n.t('user_reports.actions.add')}</span>
                </Button>
              )}
            </Space>
          </div>
        </div>
      </Row>
      <div>
        <ReportList />
        <div className={styles.tableDivider} />
        <h3>{I18n.t('common.model.assessments')}</h3>
        <AssessmentList />
        <div className={styles.tableDivider} />
        {proctoringSessions.length !== 0 && (
          <>
            <div className={styles.tableDivider} />
            <h3>{I18n.t('administration.proctoring_sessions.resource_name')}</h3>
            <ProctoringSessionList proctoringSessions={proctoringSessions} />
          </>
        )}
      </div>
    </div>
  )
}

export default AssessmentsReports
