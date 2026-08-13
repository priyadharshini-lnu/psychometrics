import React, { lazy, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useResources } from '~/hooks/useResources'
import { CampaignTR, Campaign as CampaignType } from '~/modules/admin/modules/client/core/campaigns'
import { updatePermissions } from '~/modules/admin/modules/campaigns/core/current'
import Campaign, {
  CommonCampaignPermissions,
} from '~/modules/admin/modules/campaigns/interfaces/Campaign'
import { updateCampaignDetails } from '~/modules/admin/modules/threeSixtyCampaign/core/campaignDetails'
import { fetchRelationships } from '~/modules/admin/modules/threeSixtyCampaign/core/relationships'
import { updateCampaignAssessmentDetails } from '~/modules/admin/modules/threeSixtyCampaign/core/campaignAssessments'

// Which module renders depends on fetched data, so the split stays here rather than on the route.
const CommonCampaign = lazy(
  () => import('~/modules/admin/modules/campaigns/pages').then(({ Campaign }) => ({ default: Campaign })),
)
const ThreeSixtyCampaign = lazy(
  () => import('~/modules/admin/modules/threeSixtyCampaign/pages')
    .then(({ ThreeSixtyCampaign: component }) => ({ default: component })),
)


const CampaignPage: React.FC = () => {
  const { campaignId, projectId } = useParams() as { campaignId: string, projectId: string}
  const [isLoading, setIsLoading] = React.useState(true)
  const dispatch = useDispatch()

  const {
    fetchSingle: fetchCampaign, getResource,
  } = useResources<CampaignType>(
    'campaigns',
    {
      responseType: CampaignTR,
      apiConfig: {
        include: ['threesixty_campaign',
          'campaign_reports.report', 'campaign_assessments.assessment',
          'campaign_assessments.assessment.dimension', 'campaign_reports', 'campaign_assessments'],
        include_resource_meta: ['permissions'],
        fields: {
          threesixty_campaigns: ['name'],
          reports: ['name'],
          assessments: ['name', 'dimension'],
          dimensions: ['name'],
          campaign_reports: ['default_language', 'available_languages', 'report'],
        },
      },
    },
  )

  useEffect(() => {
    fetchCampaign({ id: campaignId }).then((campaign: CampaignType) => {
      if (campaign.type === 'threesixty' && campaign.threesixtyCampaign) {
        const permissions = campaign.threesixtyCampaign.meta?.permissions || {}
        const campaignReport = campaign.campaignReports[0]
        const campaignAssessment = campaign.campaignAssessments[0]
        const campaignDetails = {
          id: parseInt(campaign.threesixtyCampaign.id, 10),
          name: campaign.name,
          campaignId: campaign.id,
          category: campaign.threesixtyCampaign.category,
          template: campaign.threesixtyCampaign.template,
          reportAvailableLanguages: campaignReport.availableLanguages || [],
          reportId: campaignReport.report?.id,
          campaignReportPermissions: {
            editReportOptions: permissions.editReportOptions,
            manageReportsOptions: permissions.manageReportsOptions,
          },
          campaignAssessmentPermissions: { editAssessment: permissions.editAssessment },
          reportDefaultLanguage: campaignReport.defaultLanguage,
          assessmentId: campaignAssessment.assessment?.id,
          dimensionId: campaignAssessment.assessment?.dimension?.id,
          permissions,
        }
        dispatch(updateCampaignDetails(campaignDetails))
        dispatch(updateCampaignAssessmentDetails(campaignAssessment))
        dispatch(fetchRelationships(parseInt(campaignId, 10)))
      } else {
        const campaignDetails: Campaign = {
          id: parseInt(campaign.id, 10),
          name: campaign.name,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          type: campaign.type,
          status: campaign.status,
          isThreesixty: campaign.isThreesixty,
          isFixedTime: campaign.isFixedTime,
          projectId: parseInt(projectId, 10),
          practiceCampaign: campaign.practiceCampaign,
          ...(campaign.tenantId && { tenantId: campaign.tenantId }),
          permissions: campaign.meta.permissions as CommonCampaignPermissions,
          assessments: [],
          reports: [],
        }
        dispatch(updatePermissions(campaignDetails))
      }
      setIsLoading(false)
    })
  }, [campaignId])

  if (isLoading) {
    return null
  }

  const currentCampaign = getResource(campaignId)
  return currentCampaign?.threesixtyCampaign?.id ? <ThreeSixtyCampaign /> : <CommonCampaign />
}

export default CampaignPage
