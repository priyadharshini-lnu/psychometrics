import React, { useEffect } from 'react'
import {
  Row, Col, Button, Space, App,
} from 'antd'
import { useParams } from 'react-router-dom'
import _ from 'lodash'
import dayjs from 'dayjs'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import UpdateReportLanguagesModal from './UpdateReportLanguagesModal'
import Modals from '~/modules/admin/components/Modals'
import ReportList from './ReportList'
import { OtherReportList } from './OtherReportList'
import AssessmentList from './AssessmentList'
import { OtherAssessmentList } from './OtherAssessmentList'
import { OtherAssessorAssessmentList } from './OtherAssessorAssessmentList'
import AssessorAssessmentList from './AssessorAssessmentList'
import AddReportModal from './AddReportModal'
import { Strategies } from './AddReportModal/interfaces'
import UniversalLinkModal from './UniversalLinkModal'
import ImportRawModal from './ImportRawModal'
import UpdateNormModal from './UpdateNormModal'
import UpdateConditionSetModal from './UpdateConditionSetModal'
import UpdateAssessorFormModal from './UpdateAssessorFormModal'
import ImportScoringModal from './ImportScoringModal'
import ImportExternalScoringModal from './ImportExternalScoringModal'
import RemoveReportModal from './RemoveReportModal'
import UploadBulkAssetsModal from './UploadBulkAssetsModal'
import { AddAssessorAssessmentModal } from './AddAssessorAssessmentModal'
import RemoveAssessmentModal from './RemoveAssessmentModal'
import { UpdateExternalConfigModal } from './AssessmentList/UpdateExternalConfigModal'
import ToggleUserAccessModal from './ToggleUserAccessModal'
import ReportsLanguageSelectionModal from '~/modules/admin/components/ReportsLanguageSelectionModal'
import DownloadReportsModal from './DownloadReportsModal'
import UpdateLocalesModal from './UpdateLocalesModal'
import { PropsFromRedux } from './connect'
import styles from './styles.less'
import RescoreResponseModal from '~/modules/admin/modules/campaigns/components/RescoreResponseModal'
import { useResources } from '~/hooks/useResources'
import {
  CampaignAssessorAssessments, useCampaignAssessorAssessmentsStore,
} from '~/modules/admin/modules/client/core/campaignAssessorAssessments'
import { SchedulingCampaignAssessmentModal } from './AssessmentList/SchedulingCampaignAssessmentModal'
import { UserFilterModal } from '../../../Participants/Subjects/UserFilterModal'
import { ApplyToExistingUsersFormModal } from './AssessmentList/ApplyToExistingUsersModal'
import AssessorCampaignAssessmentGroupModal from
  './AssessorAssessmentCenterGroupModal/AssessorAssessmentCenterGroupModal'

const MODALS = {
  AddReportModal,
  UniversalLinkModal,
  ImportRawModal,
  ImportScoringModal,
  ImportExternalScoringModal,
  UpdateNormModal,
  UpdateConditionSetModal,
  RemoveReportModal,
  UpdateReportLanguagesModal,
  ToggleUserAccessModal,
  RemoveAssessmentModal,
  UpdateLocalesModal,
  UpdateExternalConfigModal,
  UpdateAssessorFormModal,
  AddAssessorAssessmentModal,
  ApplyToExistingUsersFormModal,
  SchedulingCampaignAssessmentModal,
  UserFilterModal,
  AssessorCampaignAssessmentGroupModal,
  ReportsLanguageSelectionModal,
  DownloadReportsModal,
  RescoreResponseModal,
  UploadBulkAssetsModal,
}

const { I18n } = window

type Props = PropsFromRedux

const Manage: React.FC<Props> = ({
  fetchAssessmentAndReports,
  fetchOtherReports,
  fetchOtherAssessments,
  reports: {
    list,
    reportPermissions,
  },
  openModal,
  selectedIds,
  regenerateReports,
  regenerateInProgress,
  bulkDownload,
  bulkDownloadInProgress,
  campaignPermissions,
  campaignTenantId,
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

  const { message } = App.useApp()

  const handleRegenerateReports = (selectedReports: { [key: string]: string[] }) => {
    regenerateReports(parsedCampaignId, { selectedReports, ids: selectedIds }).then(() => {
      message.success(I18n.t('user_reports.messages.regenerate_successful'))
    })
  }

  const handleDownloadReports = (selectedReports: { [key: string]: string[] },
    startDate: dayjs.Dayjs, endDate: dayjs.Dayjs, includeInactiveUsers: boolean) => {
    bulkDownload(parsedCampaignId, selectedReports, selectedIds,
      startDate?.toDate(), endDate?.toDate(), includeInactiveUsers)
      .then(() => {
        message.success(I18n.t('campaign_report.messages.bulk_download_successful'))
      })
      .catch((error) => {
        message.error(error)
      })
  }

  const {
    createResource, meta: campaignAssessorAssessmentsMeta,
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
          <h3>{I18n.t('admin.reports')}</h3>
        </Col>
        <div>
          <div className={styles.newReportButton}>
            <Space>
              {reportPermissions.bulkDownload && (
                <>
                  <Button
                    type="default"
                    onClick={() => openModal(
                      'DownloadReportsModal', { selectedIds, handleDownloadReports },
                    )}
                    disabled={_.isEmpty(selectedIds) || bulkDownloadInProgress}
                    loading={bulkDownloadInProgress}
                  >
                    <span>{I18n.t('shared.bulk_download')}</span>
                  </Button>
                </>
              )}

              {reportPermissions.regenerate && (
                <>
                  <Button
                    type="default"
                    onClick={() => openModal(
                      'ReportsLanguageSelectionModal', {
                        selectedIds,
                        handleReportsLanguageSelection: handleRegenerateReports,
                        reports: list,
                      },
                    )}
                    disabled={_.isEmpty(selectedIds) || regenerateInProgress}
                    loading={regenerateInProgress}
                  >
                    <span>{I18n.t('shared.generate')}</span>
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
                  <span>{I18n.t('admin.add_report')}</span>
                </Button>
              )}
            </Space>
          </div>
        </div>
      </Row>
      <div>
        <ReportList />
        <div className={styles.tableDivider} />
        <AssessmentList />

        <div className={styles.tableDivider} />

        <Row justify="space-between" className="pm">
          <Col span={8} className="pls">
            <h3>
              {I18n.t('admin.assessor_assessments')}
            </h3>
          </Col>

          {campaignAssessorAssessmentsMeta?.permissions?.create
            && (
              <Button
                type="primary"
                onClick={
                () => openModal('AddAssessorAssessmentModal', {
                  addAssessorAssessment: createResource,
                  campaignId: parsedCampaignId,
                  campaignTenantId,
                })
              }
              >
                <PlusOutlined />
                <span>
                  {I18n.t('shared.add')}
                </span>
              </Button>
            )}
        </Row>

        {campaignPermissions.viewAssessors && <AssessorAssessmentList />}

        {campaignPermissions.viewAssessors && otherAsessorAssessments.length > 0 && (
          <>
            <div className={styles.tableDivider} />
            <h3>{I18n.t('admin.other_assessor_assessments')}</h3>
            <OtherAssessorAssessmentList />
          </>
        )}

        <div className={styles.tableDivider} />
        {otherReports.total > 0 && (
          <>
            <h3>{I18n.t('admin.other_reports')}</h3>
            <OtherReportList />
          </>
        )}

        <div className={styles.tableDivider} />
        {otherAssessments.total > 0 && (
          <>
            <h3>{I18n.t('admin.other_assessments')}</h3>
            <OtherAssessmentList />
          </>
        )}
      </div>
      <Modals modals={MODALS} />
    </div>
  )
}

export default Manage
