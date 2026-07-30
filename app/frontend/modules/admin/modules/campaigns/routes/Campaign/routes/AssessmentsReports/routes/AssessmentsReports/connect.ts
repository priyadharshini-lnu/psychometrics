import { connect, ConnectedProps } from 'react-redux'
import { fetchAssessmentAndReports, get as getCurrentCampaign } from '~/modules/admin/modules/campaigns/core/current'
import { openModal } from '~/modules/admin/core/ui/modals'
import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getAssessorAssessment } from '~/modules/admin/modules/campaigns/core/campaignAssessorAssessments'
import {
  getSelectedIds,
  regenerateReports,
  REGENERATE_REPORTS,
  bulkDownload,
  BULK_DOWNLOAD,
  get as getReports,
  fetchOtherReports,
  getOther as getOtherReports,
} from '~/modules/admin/modules/campaigns/core/reports'
import {
  fetchOtherAssessments, getOther as getOtherAssessments,
} from '~/modules/admin/modules/campaigns/core/assessments'
import { isRequestInProgress } from '~/core/request'

const connecter = connect(
  (state: RootState) => ({
    selectedIds: getSelectedIds(state),
    regenerateInProgress: isRequestInProgress(state, REGENERATE_REPORTS),
    bulkDownloadInProgress: isRequestInProgress(state, BULK_DOWNLOAD),
    reports: getReports(state),
    campaignPermissions: getCurrentCampaign(state).permissions,
    campaignTenantId: getCurrentCampaign(state).tenantId,
    otherAsessorAssessments: getAssessorAssessment(state),
    otherReports: getOtherReports(state),
    otherAssessments: getOtherAssessments(state),
  }),
  {
    fetchAssessmentAndReports,
    fetchOtherReports,
    fetchOtherAssessments,
    openModal,
    regenerateReports,
    bulkDownload,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
