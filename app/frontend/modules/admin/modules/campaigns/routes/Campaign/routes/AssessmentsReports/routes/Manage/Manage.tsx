import React, { useEffect } from 'react'
import {
  Row, Col, Button, Space, message,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { RouteComponentProps } from 'react-router-dom'
import _ from 'lodash'
import Modals from '~/modules/admin/components/Modals/'
import ReportList from './ReportList'
import { OtherReportList } from './OtherReportList'
import AssessmentList from './AssessmentList'
import { OtherAssessmentList } from './OtherAssessmentList'
import AssessorAssessmentList from './AssessorAssessmentList'
import AddReportModal from './AddReportModal'
import { Strategies } from './AddReportModal/interfaces'
import UniversalLinkModal from './UniversalLinkModal'
import ImportRawModal from './ImportRawModal'
import UpdateNormModal from './UpdateNormModal'
import UpdateAssessorFormModal from './UpdateAssessorFormModal'
import ImportScoringModal from './ImportScoringModal'
import RemoveReportModal from './RemoveReportModal'
import RemoveAssessmentModal from './RemoveAssessmentModal'
import { UpdateExternalConfigModal } from './AssessmentList/UpdateExternalConfigModal'
import ToggleUserAccessModal from './ToggleUserAccessModal'
import UpdateLocalesModal from './UpdateLocalesModal'
import { PropsFromRedux } from './connect'
import styles from './styles.less'

const MODALS = {
  AddReportModal,
  UniversalLinkModal,
  ImportRawModal,
  ImportScoringModal,
  UpdateNormModal,
  UpdateAssessorFormModal,
  RemoveReportModal,
  ToggleUserAccessModal,
  RemoveAssessmentModal,
  UpdateLocalesModal,
  UpdateExternalConfigModal,
}

const { I18n } = window

interface Params {
  campaignId: string
}

type Props = PropsFromRedux & RouteComponentProps<Params>

const Manage: React.FC<Props> = ({
  fetchAssessmentAndReports,
  match: { params: { campaignId } },
  reports: {
    reportPermissions,
  },
  openModal,
  selectedIds,
  regenerateReports,
  regenerateInProgress,
  bulkDownload,
  bulkDownloadInProgress,
  campaignPermissions,
}) => {
  useEffect(() => {
    fetchAssessmentAndReports(campaignId)
  }, [])
  const parsedCampaignId = parseInt(campaignId, 10)

  const handleRegenerateReports = () => {
    regenerateReports(parsedCampaignId, selectedIds).then(() => {
      message.success(I18n.t('user_reports.messages.regenerate_successful'))
    })
  }

  const handleBulkDownload = () => {
    bulkDownload(parsedCampaignId, selectedIds).then(() => {
      message.success(I18n.t('campaign_report.messages.bulk_download_successful'))
    })
  }

  return (
    <div>
      <Row justify="space-between" className="pm">
        <Col span={4} className="pls">
          <h3>Reports</h3>
        </Col>
        <div>
          <div className={styles.newReportButton}>
            <Space>
              {reportPermissions.bulkDownload && (
                <Button
                  type="default"
                  onClick={handleBulkDownload}
                  disabled={_.isEmpty(selectedIds) || bulkDownloadInProgress}
                  loading={bulkDownloadInProgress}
                >
                  <span>{I18n.t('campaign_report.actions.bulk_download')}</span>
                </Button>
              )}

              {reportPermissions.regenerate && (
                <Button
                  type="default"
                  onClick={handleRegenerateReports}
                  disabled={_.isEmpty(selectedIds) || regenerateInProgress}
                  loading={regenerateInProgress}
                >
                  <span>{I18n.t('user_reports.actions.regenerate')}</span>
                </Button>
              )}

              {reportPermissions.addReport && (
                <Button
                  type="primary"
                  onClick={
                    () => openModal('AddReportModal', { campaignId: parsedCampaignId, strategy: Strategies.MULTIPLE })
                  }
                >
                  <PlusOutlined />
                  <span>Add Report</span>
                </Button>
              )}
            </Space>
          </div>
        </div>
      </Row>
      <div className="pm">
        <ReportList />
        <div className={styles.tableDivider} />
        <h3>Assessments</h3>
        <AssessmentList />

        {campaignPermissions.viewAssessors && (
          <>
            <div className={styles.tableDivider} />
            <h3>{I18n.t('campaigns.assessments_and_reports.assessor_assessments')}</h3>
            <AssessorAssessmentList />
          </>
        )}

        <div className={styles.tableDivider} />
        <h3>{I18n.t('campaigns.assessments_and_reports.other_reports')}</h3>
        <OtherReportList />

        <div className={styles.tableDivider} />
        <h3>{I18n.t('campaigns.assessments_and_reports.other_assessments')}</h3>
        <OtherAssessmentList />
      </div>
      <Modals modals={MODALS} />
    </div>
  )
}

export default Manage
