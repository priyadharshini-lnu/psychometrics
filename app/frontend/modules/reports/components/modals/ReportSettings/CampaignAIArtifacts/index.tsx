import { Typography } from 'antd'
import { connect } from 'react-redux'
import { CampaignAIArtifactsForm, type CampaignAIArtifact } from '~/components/CampaignAIArtifactsForm'
import { camelizeKeys } from '~/utils/object'
import { saveCampaignAIArtifacts } from '~/modules/reports/core/builder/actions'
import { RootState } from '~/modules/reports/core/rootReducers'
import AppStore from '~/modules/reports/store/AppStore'

import styles from './styles.less'

const { I18n } = window

const connecter = connect(
  ({ report: { builder } }: RootState) => ({
    columns: camelizeKeys(builder.campaign_ai_artifacts), id: builder.id,
  }),
  {
    saveCampaignAIArtifacts,
  },
)

type Props = {
  saveCampaignAIArtifacts: (columns: CampaignAIArtifact[]) => void
  columns: CampaignAIArtifact[]
}

export const CampaignAIArtifactsComponent = ({ columns, saveCampaignAIArtifacts }: Props) => {
  const handleSaveCampaignAIArtifacts = (formItems: CampaignAIArtifact[]) => {
    AppStore.report.campaignAIArtifacts = formItems
  }

  return (
    <div className={styles.main}>
      <Typography.Title level={4}>{I18n.t('administration.ai_assistants.campaign_ai_artifacts')}</Typography.Title>
      <CampaignAIArtifactsForm
        artifacts={columns}
        saveCampaignAIArtifacts={saveCampaignAIArtifacts}
        onSaveCampaignAIArtifacts={handleSaveCampaignAIArtifacts}
      />
    </div>
  )
}


export const CampaignAIArtifacts = connecter(CampaignAIArtifactsComponent)
