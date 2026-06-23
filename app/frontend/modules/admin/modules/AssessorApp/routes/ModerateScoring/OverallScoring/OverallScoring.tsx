import cs from 'classnames'
import { useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import _ from 'lodash'
import {
  CAMPAIGN_FACTORS_AND_VALUE_PAGE_SIZE,
} from '~/modules/admin/constants/campaignFactors'
import styles from './styles.less'
import { useResources } from '~/hooks/useResources'
import { CampaignFactorGroup } from '../../../core/scoreModerate'
import {
  CampaignFactorValue, CampaignFactorValueTR, CampaignFactorOutputType as OutputType,
} from '~/modules/admin/modules/campaigns/core/combinedScoring'

const { I18n } = window

export const OverallScoring = ({ header, refresh }) => {
  let parsedCampaignId
  const { campaignId, userId } = useParams() as { campaignId?: string, userId: string }
  if (campaignId) { parsedCampaignId = parseInt(campaignId, 10) }

  const {
    fetch: fetchFactorGroups, data: factorGroups,
  } = useResources<CampaignFactorGroup>('campaign_factor_groups', {
    basePath: `campaigns/${parsedCampaignId}`,
    apiConfig: {
      include: ['campaign_factors'],
      fields: {
        campaign_factor_groups: ['name', 'campaign_factors'],
        campaign_factors: ['name', 'output_type', 'position'],
      },
      page: {
        size: CAMPAIGN_FACTORS_AND_VALUE_PAGE_SIZE,
      },
    },
  })
  const {
    fetch: fetchFactorScoreValues, data: factorValues,
  } = useResources<CampaignFactorValue>(
    'campaign_factor_values',
    {
      responseType: CampaignFactorValueTR,
      basePath: `campaigns/${campaignId}`,
      apiConfig: {
        filter: {
          user_id_eq: userId,
        },
        page: {
          size: CAMPAIGN_FACTORS_AND_VALUE_PAGE_SIZE,
        },
      },
    },
  )

  const fetchData = useCallback(async () => {
    await fetchFactorGroups()
    await fetchFactorScoreValues()
  }, [fetchFactorGroups, fetchFactorScoreValues])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    fetchData()
  }, [refresh])

  const campaignFactorValues = factorValues.reduce((acc, value) => ({ ...acc, [value.campaignFactorId]: value }), {})

  return (
    <div className={styles.sidebar}>
      {header(I18n.t('admin.overall_scoring'))}
      <div className={styles.content}>
        <div className={styles.factors}>
          {factorGroups.map(group => (
            <div className={styles.group} key={group.id}>
              <div className={styles.groupTitle}>{group.name}</div>
              {_.sortBy(group.campaignFactors, 'position').map(factor => (
                <div
                  className={cs(styles.factor, { [styles.string]: factor.outputType === OutputType.string })}
                  key={factor.id}
                >
                  <div className={styles.factorName}>{factor.name}</div>
                  <div className={styles.value}>
                    {factor.outputType === OutputType.string
                      ? campaignFactorValues[factor.id]?.stringValue
                      : campaignFactorValues[factor.id]?.numericValue}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
