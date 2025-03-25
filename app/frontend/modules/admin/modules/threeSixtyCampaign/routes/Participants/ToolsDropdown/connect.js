import { connect } from 'react-redux'
import {
  reset as resetCampaign, resetAllNominations, exportCompletionStatuses, rescoreAssessment, regenerateReports,
  exportRawResults, exportThreeSixtyScores, bulkDownloads,
} from '~/modules/admin/modules/threeSixtyCampaign/core'
import { openModal } from '~/modules/admin/core/ui/modals'

export default connect(
  ({
    threeSixtyCampaign: {
      campaignDetails: {
        dimensionId, reportAvailableLanguages, reportDefaultLanguage, reportName, reportIcon,
      },
    },
  }) => ({
    dimensionId, reportAvailableLanguages, reportDefaultLanguage, reportName, reportIcon,
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
  },
)
