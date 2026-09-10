import React, {
  useMemo, useState, useEffect, useCallback,
} from 'react'
import {
  useGlintToken,
  Flex, Typography, Button,
} from '@thetalententerprise/glint'
import { useParams } from 'react-router-dom'
import { StopOutlined, LeftOutlined, RightOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources'
import { CampaignFactorGroup } from '~/modules/admin/modules/AssessorApp/core/scoreModerate'
import {
  CampaignFactorOutputType as OutputType,
  CampaignFactorValue,
  CampaignFactorValueTR,
} from '~/modules/admin/modules/campaigns/core/combinedScoring'
import { CAMPAIGN_FACTORS_AND_VALUE_PAGE_SIZE } from '~/modules/admin/constants/campaignFactors'
import AssessmentEvaluation from '~/modules/admin/modules/AssessorApp/routes/ModerateScoring/Evaluation'
import styles from './Evaluation.less'

const { I18n } = window

interface Props {
  readOnly: boolean
}

const getScoreToneClass = (value: string | number | null | undefined): string => {
  const numericScore = typeof value === 'number' ? value : Number.parseFloat(value ?? '')

  if (Number.isNaN(numericScore)) {
    return 'default'
  }

  if (numericScore >= 3.5) {
    return 'success'
  }

  if (numericScore >= 2.5) {
    return 'warning'
  }
  return 'default'
}

const LeadAssessorAssessment: React.FC<Props> = ({
  readOnly,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { campaignId, userId } = useParams<{ campaignId?: string, userId?: string }>()
  const parsedCampaignId = campaignId ? parseInt(campaignId, 10) : undefined
  const token = useGlintToken()

  const {
    fetch: fetchFactorGroups,
    data: factorGroups,
  } = useResources<CampaignFactorGroup>('campaign_factor_groups', {
    basePath: `campaigns/${parsedCampaignId}`,
    apiConfig: {
      include: ['campaign_factors'],
      fields: {
        campaign_factor_groups: ['name', 'position', 'campaign_factors'],
        campaign_factors: ['name', 'output_type', 'position', 'factor_id'],
      },
      page: {
        size: CAMPAIGN_FACTORS_AND_VALUE_PAGE_SIZE,
      },
    },
  })

  const {
    fetch: fetchFactorScoreValues,
    data: factorValues,
  } = useResources<CampaignFactorValue>('campaign_factor_values', {
    responseType: CampaignFactorValueTR,
    basePath: `campaigns/${campaignId}`,
    apiConfig: {
      filter: {
        user_id_eq: userId ?? '',
      },
      page: {
        size: CAMPAIGN_FACTORS_AND_VALUE_PAGE_SIZE,
      },
    },
  })

  const fetchSidebarData = useCallback(async () => {
    await fetchFactorGroups()
    await fetchFactorScoreValues()
  }, [fetchFactorGroups, fetchFactorScoreValues])

  useEffect(() => {
    fetchSidebarData()
  }, [])


  const campaignFactorValues = useMemo(() => (
    factorValues.reduce<Record<string, CampaignFactorValue>>((acc, value) => {
      acc[value.campaignFactorId] = value
      return acc
    }, {})
  ), [factorValues])

  return (
    <Flex className={styles.container}>
      <div className={isSidebarOpen ? styles.sidebar : `${styles.sidebar} ${styles.sidebarCollapsed}`}>
        <Flex className="p-4" align="center" justify="space-between">
          <Typography.Text strong>
            {I18n.t('admin.overall_scoring')}
          </Typography.Text>
          <Button
            variant="outlined"
            className="me-2"
            icon={<LeftOutlined />}
            onClick={() => setIsSidebarOpen(false)}
            aria-label={I18n.t('shared.close')}
          />
        </Flex>
        <div className={styles.sidebarContent}>
          {factorGroups
            .map(group => (
              <div className={styles.groupSection} key={group.id}>
                <div style={{ background: token.colorBgLayout }} className="p-4">
                  <Typography.Text strong>
                    {group.name}
                  </Typography.Text>
                </div>
                {[...group.campaignFactors]
                  .sort((a, b) => a.position - b.position)
                  .map((factor) => {
                    const score = campaignFactorValues[factor.id]
                    const value = factor.outputType === OutputType.string
                      ? score?.stringValue
                      : score?.numericValue
                    const scoreToneClass = getScoreToneClass(value)

                    return (
                      <Flex
                        key={factor.id}
                        align="center"
                        className="p-4 ms-2"
                        justify="space-between"
                        gap={8}
                      >
                        <Flex className={styles.factorLabel} align="center" gap={8}>
                          <Typography.Text>
                            {factor.name}
                          </Typography.Text>
                        </Flex>
                        <Typography.Text strong type={scoreToneClass as 'success' | 'warning'}>
                          {value ?? <StopOutlined />}
                        </Typography.Text>
                      </Flex>
                    )
                  })}
              </div>
            ))}
        </div>
      </div>

      {!isSidebarOpen && (
        <Flex className="ps-2">
          <Button
            variant="outlined"
            icon={<RightOutlined />}
            onClick={() => setIsSidebarOpen(true)}
            aria-label={I18n.t('admin.overall_scoring')}
          />
        </Flex>
      )}

      <div className={styles.formPanel}>
        <AssessmentEvaluation readOnly={readOnly} />
      </div>
    </Flex>
  )
}

export default LeadAssessorAssessment
