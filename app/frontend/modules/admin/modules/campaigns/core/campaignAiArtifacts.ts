import ApiAction from 'interfaces/ApiAction'
import { CampaignAIArtifact } from '~/components/CampaignAIArtifactsForm/types'

export const IMPORT = 'reports/upload_campaign_ai_artifacts/IMPORT'

export const importCampaignAiArtifacts = (reportId: number, body: FormData): ApiAction<CampaignAIArtifact[]> => ({
  type: IMPORT,
  request: {
    method: 'post',
    url: `/administration/reports/${reportId}/builders/upload_campaign_ai_artifacts`,
    body,
    loader: true,
    contentType: 'multipart/form-data;' as const,
  },
})
