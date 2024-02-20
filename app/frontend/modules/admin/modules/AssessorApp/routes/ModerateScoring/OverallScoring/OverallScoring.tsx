import cs from 'classnames'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import styles from './styles.less'
import { useResources } from '~/hooks/useResources'
import { CampaignFactorGroup } from '../../../core/scoreModerate'
import {
  CampaignFactorValue, CampaignFactorValueTR, CampaignFactorOutputType as OutputType,
} from '~/modules/admin/modules/campaigns/core/combinedScoring'

const { I18n } = window

export const OverallScoring = ({ header }) => {
  let parsedCampaignId
  const { campaignId, userId } = useParams<{ campaignId?: string, userId: string }>()
  if (campaignId) { parsedCampaignId = parseInt(campaignId, 10) }

  const {
    fetch: fetchFactorGroups, data: factorGroups,
  } = useResources<CampaignFactorGroup>('campaign_factor_groups', {
    basePath: `campaigns/${parsedCampaignId}`,
    apiConfig: {
      include: ['campaign_factors'],
      fields: {
        campaign_factor_groups: ['name', 'campaign_factors'],
        campaign_factors: ['name', 'output_type'],
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
      },
    },
  )

  useEffect(() => {
    fetchFactorGroups()
    fetchFactorScoreValues()
  }, [])

  const campaignFactorValues = factorValues.reduce((acc, value) => ({ ...acc, [value.campaignFactorId]: value }), {})

  return (
    <div className={styles.sidebar}>
      {header(I18n.t('administration.assessor.moderate_score.overall_scoring'))}
      <div className={styles.content}>
        <div className={styles.factors}>
          {factorGroups.map(group => (
            <div className={styles.group}>
              <div className={styles.groupTitle}>{group.name}</div>
              {group.campaignFactors.map(factor => (
                <div className={cs(styles.factor, { [styles.string]: factor.outputType === OutputType.string })}>
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
