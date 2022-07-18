import React, { useEffect, FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { Col, Row, Typography } from 'antd'

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

const mapStateToProps = (state: RootState) => ({
  campaigns: state.campaigns.campaigns,
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
}) => {
  const history = useHistory()

  useEffect(() => {
    fetchCampaigns()
  }, [])

  return (
    <div className={styles['container-campaign']}>
      <Row gutter={[32, 32]}>
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
  )
}

export const CampaignList = connector(CampaignListComponent)
