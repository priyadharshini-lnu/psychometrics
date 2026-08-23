import { useParams } from 'react-router-dom'
import {
  Row, Col, Button, App, Space, theme, Flex,
} from 'antd'
import _ from 'lodash'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import ReportList from './ReportList'
import AssessmentList from './AssessmentList'
import { Strategies } from '../../../AssessmentsReports/routes/AssessmentsReports/AddReportModal/interfaces'
import { ProctoringSessionList } from './ProctoringSessionList'
import styles from './styles.less'
import { PropsFromRedux } from './connect'
import { SectionTitle } from '~/modules/admin/components/TableTitle'

const { I18n } = window

interface OwnProps {
  openModal(name: string, data?: { campaignId: number, userId: number, strategy: Strategies }): void,
}

export type Props = OwnProps & PropsFromRedux

const AssessmentsReports: React.FC<Props> = ({
  user,
  reports,
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
  const { token } = theme.useToken()

  const handleRegenerateReports = (selectedReports: { [key: string]: string[] }) => {
    regenerateReports(parsedCampaignId, selectedReports, id, selectedIds).then(() => {
      message.success(I18n.t('user_reports.messages.regenerate_successful'))
    })
  }

  const handleDownloadReports = (selectedReports: { [key: string]: string[] }) => {
    bulkDownload(parsedCampaignId, selectedReports, id, selectedIds)
      .then(() => {
        message.success(I18n.t('campaign_report.messages.bulk_download_successful'))
      })
      .catch((error) => {
        message.error(error)
      })
  }

  return (
    <div>
      <Row justify="space-between" style={{ marginTop: token.margin }}>
        <Col span={4}>
          <SectionTitle>{I18n.t('admin.reports')}</SectionTitle>
        </Col>
        <div>
          <div className={styles.newReportButton}>
            <Space>
              {user.permissions.bulkDownload && (
                <Button
                  type="default"
                  onClick={() => openModal(
                    'ReportsLanguageSelectionModal', {
                      selectedIds,
                      handleReportsLanguageSelection: handleDownloadReports,
                      reports,
                      isDownload: true,
                    },
                  )}
                  disabled={_.isEmpty(selectedIds) || bulkDownloadInProgress}
                  loading={bulkDownloadInProgress}
                >
                  <span>{I18n.t('shared.download')}</span>
                </Button>
              )}
              {user.permissions.regenerateReport && (
                <Button
                  type="default"
                  onClick={() => openModal(
                    'ReportsLanguageSelectionModal', {
                      selectedIds,
                      handleReportsLanguageSelection: handleRegenerateReports,
                      reports,
                    },
                  )}
                  disabled={_.isEmpty(selectedIds) || regenerateInProgress}
                  loading={_.isEmpty(selectedIds) ? false : regenerateInProgress}
                >
                  <span>{I18n.t('shared.generate')}</span>
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
      <Flex vertical>
        <ReportList />
        <div className={styles.tableDivider} />
        <SectionTitle>{I18n.t('admin.assessments')}</SectionTitle>
        <AssessmentList />
        <div className={styles.tableDivider} />
        {proctoringSessions.length !== 0 && (
          <>
            <div className={styles.tableDivider} />
            <SectionTitle>{I18n.t('admin.proctoring_sessions_resource_name')}</SectionTitle>
            <ProctoringSessionList proctoringSessions={proctoringSessions} />
          </>
        )}
      </Flex>
    </div>
  )
}

export default AssessmentsReports
