import _ from 'lodash'
import React, { useEffect, FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useHistory } from 'react-router-dom'
import {
  ClockCircleOutlined, PlayCircleOutlined, CheckCircleOutlined, ArrowLeftOutlined, DownOutlined,
} from '@ant-design/icons'
import {
  Row, Col, PageHeader, Dropdown, Menu, Tag,
} from 'antd'

import {
  fetchCampaigns,
} from 'modules/user/modules/campaigns/core/campaigns'
import { RootState } from 'modules/user/core/rootReducers'
import { ProgressStatus } from 'glint'
import styles from './styles.less'

const { I18n } = window
const { Item } = Menu

const connector = connect((state: RootState) => ({
  campaigns: state.campaigns.campaigns,
}), {
  fetchCampaigns,
})

type PropsFromRedux = ConnectedProps<typeof connector>
type NewHeaderComponentProps = PropsFromRedux & {
  counters: _.Dictionary<number>
  activeCampaignId: string
}

export const CampaignPageHeaderComponent: FC<NewHeaderComponentProps> = ({
  counters, campaigns, fetchCampaigns, activeCampaignId,
}) => {
  const history = useHistory()
  const activeCampaign = campaigns.find(campaign => campaign.id === activeCampaignId)
  const completedCampaignsCount = campaigns.filter(campaign => campaign.status === 'completed').length
  const totalCampaigns = campaigns.length

  const handleNavigation = () => {
    history.push('/dashboard')
  }

  useEffect(() => {
    !campaigns.length && fetchCampaigns()
  }, [])

  const handleCampaignSelect = (menu) => {
    history.push(`/campaigns/${menu.key}`)
  }

  const menu = (
    <Menu
      theme="light"
      selectedKeys={activeCampaign && [`${activeCampaign.id}`]}
      onClick={handleCampaignSelect}
      className={styles.dropdownMenu}
    >
      {campaigns.map(campaign => (
        <Item key={campaign.id} className={styles.campaignItem}>
          <Row wrap={false}>
            <Col>{campaign.name}</Col>
            {/* {Needs change once campaign progress status is available from backend} */}
            <Col flex="auto" className="ta-e"><Tag color="green">Completed</Tag></Col>
          </Row>
        </Item>
      ))}
    </Menu>
  )

  const status = (
    <Row gutter={[64, 0]}>
      <Col span={8}>
        <ProgressStatus
          theme="light"
          statusText={I18n.t('campaign_assessment.statuses.not_started')}
          StatusIcon={PlayCircleOutlined}
          count={counters.not_started || 0}
        />
      </Col>
      <Col span={8}>
        <ProgressStatus
          theme="light"
          statusText={I18n.t('campaign_assessment.statuses.in_progress')}
          StatusIcon={ClockCircleOutlined}
          count={counters.in_progress || 0}
        />
      </Col>
      <Col span={8}>
        <ProgressStatus
          theme="light"
          statusText={I18n.t('campaign_assessment.statuses.completed')}
          StatusIcon={CheckCircleOutlined}
          count={counters.completed || 0}
        />
      </Col>
    </Row>
  )
  const titleElement = campaigns.length > 1 ? (
    <Dropdown overlay={menu} trigger={['click']} className={styles.campaignDropdown}>
      <a onClick={e => e.preventDefault()}>
        <Row>
          <Col>{activeCampaign && activeCampaign.name}</Col>
          <Col
            className={styles.campaignsCount}
            offset={1}
            span={2}
          >
            {`${completedCampaignsCount}/${totalCampaigns}`}

          </Col>
          <Col span={2}><DownOutlined /></Col>
        </Row>
      </a>
    </Dropdown>
  ) : <Col className={styles.campaignDropdown}>{activeCampaign && activeCampaign.name}</Col>
  return (
    <PageHeader
      className={styles.campaignHeader}
      onBack={handleNavigation}
      backIcon={<ArrowLeftOutlined className={styles.backIcon} />}
      ghost={false}
      title={titleElement}
      extra={status}
    />
  )
}

export const CampaignPageHeader = connector(CampaignPageHeaderComponent)
