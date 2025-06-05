import React, { useEffect, useState } from 'react'
import {
  Row, Col, Button, Space, App,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import _ from 'lodash'
import dayjs from 'dayjs'
import Modals from '~/modules/admin/components/Modals'
import ReportList from './ReportList'
import { OtherReportList } from './OtherReportList'
import AssessmentList from './AssessmentList'
import { OtherAssessmentList } from './OtherAssessmentList'
import { OtherAssessorAssessmentList } from './OtherAssessorAssessmentList'
import AssessorAssessmentList from './AssessorAssessmentList'
import AddReportModal from './AddReportModal'
import { DateRangeSelectorModal } from '~/modules/admin/components/DateRangeSelectorModal'
import { Strategies } from './AddReportModal/interfaces'
import UniversalLinkModal from './UniversalLinkModal'
import ImportRawModal from './ImportRawModal'
import UpdateNormModal from './UpdateNormModal'
import UpdateAssessorFormModal from './UpdateAssessorFormModal'
import ImportScoringModal from './ImportScoringModal'
import RemoveReportModal from './RemoveReportModal'
import { AddAssessorAssessmentModal } from './AddAssessorAssessmentModal'
import RemoveAssessmentModal from './RemoveAssessmentModal'
import { UpdateExternalConfigModal } from './AssessmentList/UpdateExternalConfigModal'
import ToggleUserAccessModal from './ToggleUserAccessModal'
import UpdateLocalesModal from './UpdateLocalesModal'
import { PropsFromRedux } from './connect'
import styles from './styles.less'
import { useResources } from '~/hooks/useResources'
import {
  CampaignAssessorAssessments, useCampaignAssessorAssessmentsStore,
} from '~/modules/admin/modules/client/core/campaignAssessorAssessments'
import { SchedulingCampaignAssessmentModal } from './AssessmentList/SchedulingCampaignAssessmentModal'
import { UserFilterModal } from '../../../Participants/Subjects/UserFilterModal'
import { ApplyToExistingUsersFormModal } from './AssessmentList/ApplyToExistingUsersModal'

const MODALS = {
  AddReportModal,
  UniversalLinkModal,
  ImportRawModal,
  ImportScoringModal,
  UpdateNormModal,
  RemoveReportModal,
  ToggleUserAccessModal,
  RemoveAssessmentModal,
  UpdateLocalesModal,
  UpdateExternalConfigModal,
  UpdateAssessorFormModal,
  AddAssessorAssessmentModal,
  ApplyToExistingUsersFormModal,
  SchedulingCampaignAssessmentModal,
  UserFilterModal,
}

const { I18n } = window

type Props = PropsFromRedux

const Manage: React.FC<Props> = ({
  fetchAssessmentAndReports,
  fetchOtherReports,
  fetchOtherAssessments,
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
  otherAsessorAssessments,
  otherReports,
  otherAssessments,
}) => {
  useEffect(() => {
    fetchOtherReports(campaignId)
    fetchOtherAssessments(campaignId)
    fetchAssessmentAndReports(campaignId)
  }, [])

  const { campaignId } = useParams() as { campaignId: string }
  const parsedCampaignId = parseInt(campaignId, 10)

  const stateManager = useCampaignAssessorAssessmentsStore()
  const [downloadModalVisible, setDownloadModalVisible] = useState<boolean>(false)


  const { message } = App.useApp()

  const handleRegenerateReports = () => {
    regenerateReports(parsedCampaignId, selectedIds).then(() => {
      message.success(I18n.t('user_reports.messages.regenerate_successful'))
    })
  }

  const handleDownload = (startDate: dayjs.Dayjs, endDate: dayjs.Dayjs, includeInactiveUsers: boolean) => {
    if (!startDate || !endDate) return
    bulkDownload(parsedCampaignId, selectedIds, startDate?.toDate(), endDate?.toDate(), includeInactiveUsers)
      .then(() => {
        message.success(I18n.t('campaign_report.messages.bulk_download_successful'))
        handleCloseDownloadModal()
      })
      .catch((error) => {
        message.error(error)
        handleCloseDownloadModal()
      })
  }


  const handleOpenDownloadModal = () => {
    setDownloadModalVisible(true)
  }

  const handleCloseDownloadModal = () => {
    setDownloadModalVisible(false)
  }


  const {
    createResource,
  } = useResources<CampaignAssessorAssessments>(
    'campaign_assessor_assessments',
    {
      stateManager,
      basePath: `campaigns/${campaignId}`,
    },
  )

  return (
    <div>
      <Row justify="space-between">
        <Col span={4} className="pls">
          <h3>{I18n.t('administration.reports.name')}</h3>
        </Col>
        <div>
          <div className={styles.newReportButton}>
            <Space>
              {reportPermissions.bulkDownload && (
                <>
                  <Button
                    type="default"
                    onClick={handleOpenDownloadModal}
                    disabled={_.isEmpty(selectedIds) || bulkDownloadInProgress}
                    loading={bulkDownloadInProgress}
                  >
                    <span>{I18n.t('campaign_report.actions.bulk_download')}</span>
                  </Button>
                  <DateRangeSelectorModal
                    open={downloadModalVisible}
                    onCancel={handleCloseDownloadModal}
                    onDownload={handleDownload}
                    showTime
                  />
                </>
              )}

              {reportPermissions.regenerate && (
                <>
                  <Button
                    type="default"
                    onClick={handleRegenerateReports}
                    disabled={_.isEmpty(selectedIds) || regenerateInProgress}
                    loading={regenerateInProgress}
                  >
                    <span>{I18n.t('user_reports.actions.regenerate')}</span>
                  </Button>
                </>
              )}

              {reportPermissions.addReport && (
                <Button
                  type="primary"
                  onClick={
                    () => openModal('AddReportModal', { campaignId: parsedCampaignId, strategy: Strategies.MULTIPLE })
                  }
                >
                  <PlusOutlined />
                  <span>{I18n.t('reports.actions.add')}</span>
                </Button>
              )}
            </Space>
          </div>
        </div>
      </Row>
      <div>
        <ReportList />
        <div className={styles.tableDivider} />
        <h3>{I18n.t('administration.assessments.assessment_report')}</h3>
        <AssessmentList />

        <div className={styles.tableDivider} />

        <Row justify="space-between" className="pm">
          <Col span={8} className="pls">
            <h3>
              {I18n.t('campaigns.assessments_and_reports.assessor_assessments')}
            </h3>
          </Col>
          <Button
            type="primary"
            onClick={
              () => openModal('AddAssessorAssessmentModal', {
                addAssessorAssessment: createResource,
              })
            }
          >
            <PlusOutlined />
            <span>
              {I18n.t('administration.assessor_assessment.add')}
            </span>
          </Button>
        </Row>

        <AssessorAssessmentList />

        {campaignPermissions.viewAssessors && otherAsessorAssessments.length > 0 && (
          <>
            <div className={styles.tableDivider} />
            <h3>{I18n.t('campaigns.assessments_and_reports.other_assessor_assessments')}</h3>
            <OtherAssessorAssessmentList />
          </>
        )}

        <div className={styles.tableDivider} />
        {otherReports.total > 0 && (
          <>
            <h3>{I18n.t('campaigns.assessments_and_reports.other_reports')}</h3>
            <OtherReportList />
          </>
        )}

        <div className={styles.tableDivider} />
        {otherAssessments.total > 0 && (
          <>
            <h3>{I18n.t('campaigns.assessments_and_reports.other_assessments')}</h3>
            <OtherAssessmentList />
          </>
        )}
      </div>
      <Modals modals={MODALS} />
    </div>
  )
}

export default Manage
