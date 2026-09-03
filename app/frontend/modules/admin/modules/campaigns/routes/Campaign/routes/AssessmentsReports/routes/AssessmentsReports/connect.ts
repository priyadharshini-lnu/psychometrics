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
} from '~/modules/admin/modules/campaigns/core/reports'
import { isRequestInProgress } from '~/core/request'

const connecter = connect(
  (state: RootState) => ({
    selectedIds: getSelectedIds(state),
    regenerateInProgress: isRequestInProgress(state, REGENERATE_REPORTS),
    bulkDownloadInProgress: isRequestInProgress(state, BULK_DOWNLOAD),
    reports: getReports(state),
    campaignPermissions: getCurrentCampaign(state).permissions,
    otherAsessorAssessments: getAssessorAssessment(state),
  }),
  {
    fetchAssessmentAndReports,
    openModal,
    regenerateReports,
    bulkDownload,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
