import { connect, ConnectedProps } from 'react-redux'
import { getStatusesCount } from '~/modules/admin/modules/campaigns/core/userAssessments'
import {
  fetchSingle as fetchSingleUser,
  getCurrent as getCurrentUser,
  remove,
  toggleActive,
  extendTime,
} from '~/modules/admin/modules/campaigns/core/users'
import { get as getProctoringSessions } from '~/modules/admin/modules/campaigns/core/proctoringSessions'
import {
  regenerateReports, getSelectedIds, REGENERATE_REPORTS, bulkDownload, BULK_DOWNLOAD,
} from '~/modules/admin/modules/campaigns/core/userReports'
import { openModal } from '~/modules/admin/core/ui/modals'
import { RootState } from '~/modules/admin/core/rootReducers'
import { isRequestInProgress } from '~/core/request'

export const connecter = connect(
  (state: RootState) => ({
    user: getCurrentUser(state),
    proctoringSessions: getProctoringSessions(state).list,
    assessmentStatuses: getStatusesCount(state),
    selectedIds: getSelectedIds(state),
    regenerateInProgress: isRequestInProgress(state, REGENERATE_REPORTS),
    bulkDownloadInProgress: isRequestInProgress(state, BULK_DOWNLOAD),
  }),
  {
    fetchSingleUser,
    openModal,
    toggleActive,
    remove,
    regenerateReports,
    extendTime,
    bulkDownload,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>
