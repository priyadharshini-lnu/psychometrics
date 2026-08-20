import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  SummaryCard,
  StatRow,
  PageContainer,
  Tag,
  Button,
  Row,
  Col,
  Spin,
  Flex,
  Typography,
} from '@thetalententerprise/glint'
import {
  type DashboardCampaign,
  mapStatus,
  mapStatusTag,
  mapDaysLeft,
  mapTitle,
  mapPrimaryLabel,
  greeting,
  isCampaignDisabled,
  detailPath,
  insightsPath,
} from './mapCampaign'
import { DocumentTitle } from '~/components/DocumentTitle'

const { I18n } = window

export type DashboardContentProps = {
  campaigns: DashboardCampaign[]
  isLoading: boolean
  hasError: boolean
  firstName?: string
}

const introText = (hasError: boolean, hasCampaigns: boolean): string => {
  if (hasError) return I18n.t('errors.error_500')
  return hasCampaigns
    ? I18n.t('enduser.dashboard_instructions')
    : I18n.t('campaign.inactive_campaign_message')
}

// Folio dashboard content: eyebrow + serif greeting hero over a hairline, an editorial
// stat row, then the program-card grid. Data comes from the legacy campaigns store
// via mapCampaign; the page shell (rail/top bar/footer) is composed by DashboardPage.
export const DashboardContent: FC<DashboardContentProps> = ({
  campaigns,
  isLoading,
  hasError,
  firstName,
}) => {
  const navigate = useNavigate()

  const activeCount = campaigns.filter(c => mapStatus(c) !== 'completed' && mapStatus(c) !== 'report-ready').length
  const reportsReadyCount = campaigns.filter(c => Boolean(c.userReportsAvailable)).length

  return (
    <>
      <DocumentTitle text={I18n.t('enduser.dashboard')} />

      <PageContainer
        header={(
          <Flex vertical gap="small">
            <Typography.Text strong>
              {I18n.t('enduser.dashboard_greeting_eyebrow')}
            </Typography.Text>
            <Typography.Title level={1} style={{ margin: 0 }}>
              {greeting(firstName)}
            </Typography.Title>
          </Flex>
        )}
      >
        <Flex vertical gap="large">
          {!hasError && !isLoading ? (
            <StatRow
              stats={[
                { value: activeCount, label: I18n.t('enduser.dashboard_active_programs') },
                { value: reportsReadyCount, label: I18n.t('enduser.dashboard_reports_ready') },
              ]}
            />
          ) : null}

          <Flex vertical gap="small">
            <Typography.Title level={2} style={{ margin: 0 }}>
              {I18n.t('enduser.dashboard_your_programs')}
            </Typography.Title>
            {/* No intro while fetching — the empty-state copy would be a false claim. */}
            {!isLoading || hasError ? (
              <Typography.Text>
                {introText(hasError, campaigns.length > 0)}
              </Typography.Text>
            ) : null}
          </Flex>

          {isLoading && !hasError ? (
            <Flex justify="center" style={{ paddingBlock: '4rem' }}>
              <Spin size="large" />
            </Flex>
          ) : (
            <Row gutter={[20, 20]}>
              {campaigns.map((campaign) => {
                const reportsAvailable = Boolean(campaign.userReportsAvailable)
                const disabled = isCampaignDisabled(campaign)
                const statusTag = mapStatusTag(campaign)
                const daysLeft = mapDaysLeft(campaign)
                return (
                  <Col key={campaign.id} xs={24} lg={12}>
                    <SummaryCard
                      title={mapTitle(campaign)}
                      tag={(
                        <Flex align="center" justify="space-between" gap="small">
                          <Tag color={statusTag.color}>{statusTag.label}</Tag>
                          {daysLeft != null ? (
                            <Typography.Text type="secondary">
                              {I18n.t('enduser.dashboard_days_left', { count: daysLeft })}
                            </Typography.Text>
                          ) : null}
                        </Flex>
                    )}
                      progress={campaign.completionPercentage ?? 0}
                      actions={(
                        <>
                          <Button
                            color="primary"
                            variant="solid"
                            disabled={disabled}
                            onClick={() => navigate(detailPath(campaign))}
                          >
                            {mapPrimaryLabel(campaign)}
                          </Button>
                          {reportsAvailable ? (
                            <Button
                              color="primary"
                              variant="outlined"
                              onClick={() => navigate(insightsPath(campaign))}
                            >
                              {I18n.t('campaign.insights_reports')}
                            </Button>
                          ) : null}
                        </>
                    )}
                    />
                  </Col>
                )
              })}
            </Row>
          )}
        </Flex>
      </PageContainer>
    </>
  )
}

export default DashboardContent
