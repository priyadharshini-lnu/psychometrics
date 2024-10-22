import {
  useEffect, FC, useContext, useState,
} from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Col, Row, Typography, Layout, Card, Skeleton, Space,
} from 'antd'
import dayjs from '~/utils/dayjs'
import { isRequestInProgress } from '~/core/request'
import { Flash } from '~/components/Flash'

import { ProfileCompletion } from '~/modules/endUser/modules/campaigns/components/ProfileCompletion'
import { ProfileCardTitle } from '~/modules/endUser/modules/campaigns/components/ProfileCardTitle'
import { RootState } from '~/modules/endUser/core/rootReducers'
import {
  fetchCampaigns,
  FETCH,
} from '~/modules/endUser/modules/campaigns/core/campaigns'
import { LangDropdownWithChangeLocale } from '~/components/LangDropdown'
import { PageHeader, MediaQueryContext, FontsizeModifier } from '~/glint'

import Campaigns from './Campaigns'

import styles from './styles.less'

const { Title, Text } = Typography
const { I18n } = window
const { Content } = Layout

const mapStateToProps = (state: RootState) => ({
  campaigns: state.campaigns.campaigns,
  profileCompletionPercentage: state.currentUser.profileCompletionPercentage,
  profileLastUpdatedAt: state.currentUser.updatedAt,
  isLoading: isRequestInProgress(state, FETCH),
})

const mapDispatchToProps = {
  fetchCampaigns,
}

const connector = connect(mapStateToProps, mapDispatchToProps)
type PropsFromRedux = ConnectedProps<typeof connector>

const CampaignListComponent: FC<PropsFromRedux> = ({
  campaigns,
  fetchCampaigns,
  profileCompletionPercentage,
  profileLastUpdatedAt,
  isLoading,
}) => {
  const [error, setError] = useState(false)
  const navigate = useNavigate()
  const { isMobile } = useContext(MediaQueryContext) || { isMobile: null }

  useEffect(() => {
    fetchCampaigns().catch(() => {
      setError(true)
    })
  }, [])


  const handleProfileCompletion = () => {
    navigate('/profile_details')
  }

  const isProfileComplete = profileCompletionPercentage === 100
  const profileCardSubHeading = isProfileComplete
    ? (profileLastUpdatedAt
      && `${I18n.t('campaign.profile.last_updated_text')} ${dayjs(profileLastUpdatedAt).format('ll')}`)
    : I18n.t('campaign.profile.sub_heading')

  return (
    <>
      <PageHeader>
        <Col flex="auto" span={24} className="ta-e">
          <Space>
            <FontsizeModifier />
            <LangDropdownWithChangeLocale />
          </Space>
        </Col>
      </PageHeader>
      <Content className={styles.pageContent}>
        <div className={styles['container-campaign']}>
          <Row gutter={[32, 32]}>
            <Col span={24}>
              <Flash className="mb-5" />
              <Card
                title={(<ProfileCardTitle />)}
                className={styles.profileCard}
                bordered={false}
                headStyle={{ paddingBlock: '1rem' }}
              >
                <ProfileCompletion
                  title={isProfileComplete
                    ? I18n.t('campaign.profile.complete_heading') : I18n.t('campaign.profile.incomplete_heading')}
                  subTitle={profileCardSubHeading}
                  completionPercent={profileCompletionPercentage}
                  handleComplete={handleProfileCompletion}
                  isMobile={isMobile}
                />
              </Card>
            </Col>
            <Col span={24}>
              <Title level={4} className={styles['campaign-title']}>
                {error ? I18n.t('errors.error') : I18n.t('campaign.campaigns')}
              </Title>
              {error
                ? (
                  <Text className={styles['campaign-instruction']}>
                    {I18n.t('errors.error_500')}
                  </Text>
                )
                : (
                  <>
                    {isLoading
                      ? <Skeleton active />
                      : (
                        <Text className={styles['campaign-instruction']}>
                          {campaigns.length
                            ? I18n.t('campaign.dashboard_instructions')
                            : I18n.t('campaign.inactive_campaign_message')}
                        </Text>
                      )}
                  </>
                )
              }
            </Col>

            {campaigns.map((campaign) => {
              const scheduledForFuture = campaign.scheduledIn && campaign.scheduledIn > 0
              const campaignDisabled = campaign.status === 'inactive' || scheduledForFuture

              const Component = Campaigns[campaign.type]
              return (
                <Component
                  key={campaign.id}
                  campaign={campaign}
                  history={history}
                  fetchCampaigns={fetchCampaigns}
                  scheduledForFuture={scheduledForFuture}
                  campaignDisabled={campaignDisabled}
                />
              )
            })}
          </Row>
        </div>
      </Content>
    </>
  )
}

export const CampaignList = connector(CampaignListComponent)
