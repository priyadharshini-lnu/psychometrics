import React from 'react'
import ProjectSearchField from './ProjectSearchField'
import { ReportTypeConfigProps, ReportTypeDefinition } from './types'

const CampaignFactorScoresConfig: React.FC<ReportTypeConfigProps> = ({
  parsedConfiguration,
  scope,
  ownerId,
}) => (
  <>
    <ProjectSearchField
      scope={scope}
      ownerId={ownerId}
      parsedConfiguration={parsedConfiguration}
      required={scope === 'client'}
    />
  </>
)

export const campaignFactorScoresDefinition: ReportTypeDefinition = {
  key: 'campaign_factor_scores',

  component: CampaignFactorScoresConfig,

  processConfiguration: (data) => {
    const projectIds = (data.projectIds as string[]) || []

    return {
      ...data,
      configuration: JSON.stringify({
        project_ids: projectIds.map(id => parseInt(id, 10)),
      }),

      projectIds: undefined,
    }
  },
}

export default CampaignFactorScoresConfig
