import { connect } from 'react-redux'
import { openModal } from '~/modules/admin/core/ui/modals'

import {
  fetchSubjects, update, remove, downloadReport, regenerateReport,
} from '~/modules/admin/modules/threeSixtyCampaign/core/subjects'
import {
  edit as editUser,
} from '~/modules/admin/modules/threeSixtyCampaign/core/users'

import { removeUser } from '~/modules/admin/modules/threeSixtyCampaign/core'
import routeUtils from '~/utils/route'

export default connect(
  ({
    threeSixtyCampaign: {
      subjects: { list, total, permissions },
      campaignDetails: { campaignId: currentCampaignId },
    },
  }) => ({
    subjects: list,
    total,
    permissions,
    page: routeUtils.getPage(),
    searchTerm: routeUtils.getSearchTerm(),
    currentCampaignId,
  }),
  dispatch => ({
    fetchSubjects: (campaignId, page, query) => dispatch(fetchSubjects(campaignId, page, query)),
    openModal: (name, data) => dispatch(openModal(name, data)),
    update: (campaignId, subjectId, data) => dispatch(update(campaignId, subjectId, data)),
    remove: (campaignId, subjectId, removeLicenceUsage) => dispatch(remove(campaignId, subjectId, removeLicenceUsage)),
    removeUser: (campaignId, userId) => dispatch(removeUser(campaignId, userId)),
    downloadReport: (campaignId, subjectId) => dispatch(downloadReport(campaignId, subjectId)),
    regenerateReport: (campaignId, subjectId) => dispatch(regenerateReport(campaignId, subjectId)),
    editUser: user => dispatch(editUser(user)),
  }),
)
