import React, { useEffect, FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useHistory } from 'react-router-dom'
import {
  Col, Row, Typography, Layout, Card,
} from 'antd'

import { PageHeader } from 'glint'
import { ProfileCompletion } from 'modules/endUser/modules/campaigns/components/ProfileCompletion'
import { ProfileCardTitle } from 'modules/endUser/modules/campaigns/components/ProfileCardTitle'
import LangDropdown from 'components/LangDropdown'
import { RootState } from 'modules/user/core/rootReducers'
import {
  fetchCampaigns,
  loginHogan,
  acceptPolicy,
} from 'modules/user/modules/campaigns/core/campaigns'

import Campaigns from './Campaigns'

import styles from './styles.less'

const { Title, Text } = Typography
const { I18n } = window
const locales = I18n.availableLocales
const current = I18n.locale
const { Content } = Layout

const mapStateToProps = (state: RootState) => ({
  campaigns: state.campaigns.campaigns,
  profileCompletionPercentage: state.currentUser.profileCompletionPercentage,
})

const mapDispatchToProps = {
  fetchCampaigns,
  loginHogan,
  acceptPolicy,
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type PropsFromRedux = ConnectedProps<typeof connector>

const CampaignListComponent: FC<PropsFromRedux> = ({
  campaigns,
  fetchCampaigns,
  loginHogan,
  acceptPolicy,
  profileCompletionPercentage,
}) => {
  const history = useHistory()

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const handleProfileCompletion = () => {
    history.push('/profile')
  }

  const isProfileComplete = profileCompletionPercentage === 100

  return (
    <>
      <PageHeader>
        <Col flex="auto" span={24} className="ta-e">
          <LangDropdown locales={locales} current={current} />
        </Col>
      </PageHeader>
      <Content className={styles.pageContent}>
        <div className={styles['container-campaign']}>
          <Row gutter={[32, 32]}>
            <Col span={24}>
              <Card
                bodyStyle={{ display: isProfileComplete ? 'none' : 'block' }}
                title={(<ProfileCardTitle />)}
                className={styles.profileCard}
                bordered={false}
              >
                {!isProfileComplete
                  && (
                  <ProfileCompletion
                    title={I18n.t('campaign.profile.heading')}
                    subTitle={I18n.t('campaign.profile.sub_heading')}
                    completionPercent={profileCompletionPercentage}
                    handleComplete={handleProfileCompletion}
                  />
                  )}
              </Card>
            </Col>
            <Col span={24}>
              <Title level={4} className={styles['campaign-title']}>Campaigns</Title>
              <Text className={styles['campaign-instruction']}>
                {campaigns.length
                  ? I18n.t('campaign.dashboard_instructions') : I18n.t('campaign.inactive_campaign_message')}
              </Text>
            </Col>
            {campaigns.map((campaign) => {
              const Component = Campaigns[campaign.type]
              return (
                <Component
                  key={campaign.id}
                  campaign={campaign}
                  loginHogan={loginHogan}
                  acceptPolicy={acceptPolicy}
                  history={history}
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
