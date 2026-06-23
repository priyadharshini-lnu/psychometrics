import { useEffect, useState } from 'react'
import {
  Flex, Form, Select, Spin,
} from 'antd'
import { useParams } from 'react-router-dom'
import { uniqBy } from 'lodash'
import { useResources } from '~/hooks/useResources'
import {
  CAMPAIGN_FACTORS_AND_VALUE_PAGE_SIZE,
} from '~/modules/admin/constants/campaignFactors'
import { AiArtifact } from '~/modules/admin/modules/campaigns/core/aiArtifacts'


const { I18n } = window

type CampaignFactor = {
  id: string
  name: string
  code: string
}

type Props = {
  aiArtifact?: AiArtifact
}
export const CampaignFactorsForm: React.FC<Props> = ({ aiArtifact }) => {
  const { campaignId } = useParams<{ campaignId: string }>()
  const [isLoading, setIsLoading] = useState(false)

  const {
    data: campaignFactorData,
    fetch: fetchCampaignFactors,
  } = useResources<CampaignFactor>('campaign_factors', {
    basePath: `campaigns/${campaignId}`,
    apiConfig: {
      fields: {
        campaign_factors: ['name', 'code'],
      },
      page: { size: CAMPAIGN_FACTORS_AND_VALUE_PAGE_SIZE },
    },
  })

  const campaignFactorOptions = aiArtifact?.dependenciesAttributes.campaignFactors
    ? uniqBy(campaignFactorData.concat(
      aiArtifact?.dependenciesAttributes.campaignFactors,
    ).map(cf => ({ ...cf, id: Number(cf.id) })), 'id') : campaignFactorData

  useEffect(() => {
    setIsLoading(true)
    fetchCampaignFactors().finally(() => setIsLoading(false))
  }, [])
  return (
    isLoading ? (
      <Flex justify="center"><Spin /></Flex>
    ) : (
      <Form.Item name="campaignFactors">
        <Select
          mode="multiple"
          placeholder={I18n.t('admin.form_select_campaign_factors')}
          allowClear
          showSearch
          filterOption={false}
          options={campaignFactorOptions.map(cf => ({ value: cf.id, label: cf.name }))}
        />
      </Form.Item>
    ))
}
