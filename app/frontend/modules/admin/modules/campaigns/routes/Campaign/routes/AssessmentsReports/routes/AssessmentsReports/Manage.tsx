import React, { useEffect } from 'react'
import {
  Row, Col, Button, Space, App, theme, Flex,
} from 'antd'
import { useParams } from 'react-router-dom'
import _ from 'lodash'
import dayjs from 'dayjs'
import { PlusOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import UpdateReportLanguagesModal from './UpdateReportLanguagesModal'
import Modals from '~/modules/admin/components/Modals'
import { SectionTitle } from '~/modules/admin/components/TableTitle'
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
  otherAsessorAssessments,
}) => {
  useEffect(() => {
    fetchAssessmentAndReports(campaignId)
  }, [])

  const { campaignId } = useParams() as { campaignId: string }
  const parsedCampaignId = parseInt(campaignId, 10)

  const { message } = App.useApp()
  const { token } = theme.useToken()

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

  return (
    <div>
      <Row
        justify="space-between"
        align="middle"
        style={{
          paddingInlineEnd: token.padding,
          paddingBlock: token.padding,
        }}
      >
        <Col>
          <SectionTitle>{I18n.t('admin.reports')}</SectionTitle>
        </Col>
        <Col>
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
        </Col>
      </Row>
      <Flex vertical gap="large">
        <ReportList />
        <AssessmentList />

        {campaignPermissions.viewAssessors && <AssessorAssessmentList />}

        {campaignPermissions.viewAssessors && otherAsessorAssessments.length > 0 && (
          <OtherAssessorAssessmentList />
        )}

        <OtherReportList />

        <OtherAssessmentList />
      </Flex>
      <Modals modals={MODALS} />
    </div>
  )
}

export default Manage
