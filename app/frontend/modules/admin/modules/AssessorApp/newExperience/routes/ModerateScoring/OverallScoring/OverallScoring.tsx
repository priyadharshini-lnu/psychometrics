import {
  useCallback, useEffect, useMemo,
} from 'react'
import cs from 'classnames'
import {
  useGlintToken,
  Flex, Empty, Typography, Collapse,
} from '@thetalententerprise/glint'
import { useParams } from 'react-router-dom'
import { StopOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { CAMPAIGN_FACTORS_AND_VALUE_PAGE_SIZE } from '~/modules/admin/constants/campaignFactors'
import { useResources } from '~/hooks/useResources'
import { CampaignFactorGroup } from '~/modules/admin/modules/AssessorApp/core/scoreModerate'
import {
  CampaignFactorOutputType as OutputType,
  CampaignFactorValue,
  CampaignFactorValueTR,
} from '~/modules/admin/modules/campaigns/core/combinedScoring'
import styles from './OverallScoring.less'

const { I18n } = window

type OverallScoringProps = {
  header: (title: string, withoutBorder?: boolean) => React.ReactNode
  refresh?: boolean
}

export const OverallScoring = ({ header, refresh }: OverallScoringProps) => {
  const { campaignId, userId } = useParams() as { campaignId?: string, userId: string }
  const parsedCampaignId = campaignId ? parseInt(campaignId, 10) : undefined

  const token = useGlintToken()

  const {
    fetch: fetchFactorGroups,
    data: _factorGroups,
  } = useResources<CampaignFactorGroup>('campaign_factor_groups', {
    basePath: `campaigns/${parsedCampaignId}`,
    apiConfig: {
      include: ['campaign_factors'],
      fields: {
        campaign_factor_groups: ['name', 'position', 'campaign_factors'],
        campaign_factors: ['name', 'output_type', 'position'],
      },
      page: {
        size: CAMPAIGN_FACTORS_AND_VALUE_PAGE_SIZE,
      },
    },
  })

  const {
    fetch: fetchFactorScoreValues,
    data: _factorValues,
  } = useResources<CampaignFactorValue>('campaign_factor_values', {
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
  })

  const fetchData = useCallback(async () => {
    await fetchFactorGroups()
    await fetchFactorScoreValues()
  }, [fetchFactorGroups, fetchFactorScoreValues])

  useEffect(() => {
    fetchData()
  }, [refresh])

  const factorGroups = _factorGroups
  const factorValues = _factorValues

  const campaignFactorValues = useMemo(() => (
    factorValues.reduce<Record<string, CampaignFactorValue>>((acc, value) => {
      acc[value.campaignFactorId] = value
      return acc
    }, {})
  ), [factorValues])

  return (
    <Flex className="h-100" vertical>
      {header(I18n.t('admin.overall_scoring'))}
      {factorGroups.length === 0 ? (
        <Flex align="center" justify="center" className="p-4">
          <Empty description={I18n.t('shared.no_data_found')} />
        </Flex>
      ) : (
        <Flex className={cs(styles.content, 'p-6')}>
          <Flex flex={1} wrap="wrap" gap={16} style={{ width: '100%' }}>
            {factorGroups.map(group => (
              <Collapse
                key={group.id}
                bordered
                className={styles.groupItem}
                styles={{
                  header: { background: token.colorBgLayout, alignItems: 'center' },
                  body: { background: token.colorWhite },
                }}
                defaultActiveKey={[group.id]}
                items={[{
                  key: group.id,
                  label: <Typography.Title level={5} className="mb-0">{group.name}</Typography.Title>,
                  children: (
                    <Flex vertical>
                      {[...group.campaignFactors]
                        .sort((a, b) => a.position - b.position)
                        .map((factor) => {
                          const score = campaignFactorValues[factor.id]
                          const value = factor.outputType === OutputType.string
                            ? score?.stringValue
                            : score?.numericValue

                          return (
                            <Flex
                              align="center"
                              justify="space-between"
                              className={cs(styles.factorRow, 'p-4')}
                              key={factor.id}
                            >
                              <Typography.Text>{factor.name}</Typography.Text>
                              <Typography.Text strong>
                                {value ?? <StopOutlined />}
                              </Typography.Text>
                            </Flex>
                          )
                        })}
                    </Flex>
                  ),
                }]}
              />
            ))}
          </Flex>
        </Flex>
      )}
    </Flex>
  )
}
