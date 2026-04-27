import { FC } from 'react'
import { AIArtifacts as CampaignAIArtifacts }
  from '~/modules/admin/modules/campaigns/routes/Campaign/routes/AIArtifacts'
import { PageHeader } from '../../PageHeader'

export const AIArtifacts: FC = () => (
  <>
    <PageHeader />
    <CampaignAIArtifacts />
  </>
)
