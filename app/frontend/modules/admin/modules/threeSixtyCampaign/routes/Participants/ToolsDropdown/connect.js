import { connect } from 'react-redux'
import {
  reset as resetCampaign, resetAllNominations, exportCompletionStatuses, rescoreAssessment, regenerateReports,
  exportRawResults, exportThreeSixtyScores, bulkDownloads, markAsDone,
} from '~/modules/admin/modules/threeSixtyCampaign/core'
import { openModal } from '~/modules/admin/core/ui/modals'

export default connect(
  ({
    threeSixtyCampaign: {
      campaignDetails: {
        campaignId,
        dimensionId, reportAvailableLanguages, reportDefaultLanguage, reportName, reportIcon,
      },
    },
  }) => ({
    campaignId,
    dimensionId,
    reportAvailableLanguages,
    reportDefaultLanguage,
    reportName,
    reportIcon,
  }),
  {
    resetCampaign,
    resetAllNominations,
    openModal,
    exportCompletionStatuses,
    rescoreAssessment,
    regenerateReports,
    exportRawResults,
    exportThreeSixtyScores,
    bulkDownloads,
    markAsDone,
  },
)
