import { Typography } from 'antd'
import { connect } from 'react-redux'

import { CampaignFactorsForm } from '~/components/CampaignFactorsForm'
import { saveCampaignFactors } from '~/modules/reports/core/builder/actions'
import { RootState } from '~/modules/reports/core/rootReducers'
import AppStore from '~/modules/reports/store/AppStore'

import styles from './styles.less'

const connecter = connect(
  ({ report: { builder } }: RootState) => ({
    columns: builder.campaign_factors, id: builder.id,
  }),
  {
    saveCampaignFactors,
  },
)

type Column = {
  outputType: string
  name: string
  code: string
}

type Props = {
  saveCampaignFactors: (columns: Column[]) => void
  columns: Column[]
}

export const CampaignFactorsComponent = ({ columns, saveCampaignFactors }: Props) => {
  const handleSaveCampaignFactors = (formItems: Column[]) => {
    AppStore.report.campaignFactors = formItems
  }

  return (
    <div className={styles.main}>
      <Typography.Title level={4}>Campaign Factors</Typography.Title>
      <CampaignFactorsForm
        factors={columns}
        saveCampaignFactors={saveCampaignFactors}
        onSaveCampaignFactors={handleSaveCampaignFactors}
      />
    </div>
  )
}


export const CampaignFactors = connecter(CampaignFactorsComponent)
