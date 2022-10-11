import React, { useEffect, FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { DownOutlined } from '@ant-design/icons'
import {
  Row, Col, PageHeader, Dropdown, Menu, Tag,
} from 'antd'

import { DirectionalNavigateBackIcon } from 'glint'
import { fetchCampaigns } from 'modules/user/modules/campaigns/core/campaigns'
import { RootState } from 'modules/user/core/rootReducers'
import styles from './styles.less'

const { Item } = Menu
const { I18n } = window

const connector = connect((state: RootState) => ({
  campaigns: state.campaigns.campaigns,
}), {
  fetchCampaigns,
})

type PropsFromRedux = ConnectedProps<typeof connector>
type NewHeaderComponentProps = PropsFromRedux & {
  activeCampaignId: string,
  extra: React.ReactNode,
}
const STATUSES = {
  not_started: { text: I18n.t('campaign_assessment.statuses.not_started'), color: 'default' },
  in_progress: { text: I18n.t('campaign_assessment.statuses.in_progress'), color: 'warning' },
  completed: { text: I18n.t('campaign_assessment.statuses.completed'), color: 'success' },
}

export const CampaignPageHeaderComponent: FC<NewHeaderComponentProps> = ({
  campaigns, fetchCampaigns, activeCampaignId, extra,
}) => {
  const history = useHistory()
  const activeCampaign = campaigns.find(campaign => campaign.id === activeCampaignId)
  const completedCampaignsCount = campaigns.filter(campaign => campaign.progressStatus === 'completed').length
  const totalCampaigns = campaigns.length
  let activeCampaignName = ''
  if (activeCampaign) {
    activeCampaignName = activeCampaign.type === 'threesixty' ? activeCampaign.assessmentName : activeCampaign.name
  }

  const handleNavigation = () => {
    history.push('/dashboard')
  }

  useEffect(() => {
    !campaigns.length && fetchCampaigns()
  }, [])

  const handleCampaignSelect = (menu) => {
    history.push(menu.key)
  }

  const menu = (
    <Menu
      theme="light"
      selectedKeys={activeCampaign && [`${activeCampaign.id}`]}
      onClick={handleCampaignSelect}
      className={styles.dropdownMenu}
    >
      {campaigns.map((campaign) => {
        const campaignName = campaign.type === 'threesixty' ? campaign.assessmentName : campaign.name
        const routePath = campaign.type === 'threesixty'
          ? `/threesixty_campaigns/${campaign.id}` : `/campaigns/${campaign.id}`
        return (
          <Item key={routePath} className={styles.campaignItem}>
            <Row gutter={[8, 0]} wrap={false}>
              <Col>{campaignName}</Col>
              <Col flex="auto" className="ta-e">
                {campaign.progressStatus && (
                <Tag color={STATUSES[campaign.progressStatus].color}>
                  {STATUSES[campaign.progressStatus].text}
                </Tag>
                )}
              </Col>
            </Row>
          </Item>
        )
      })}
    </Menu>
  )

  const titleElement = campaigns.length > 1 ? (
    <Dropdown overlay={menu} trigger={['click']} className={styles.campaignDropdown}>
      <a onClick={e => e.preventDefault()}>
        <Row wrap={false}>
          <Col>{activeCampaign && activeCampaignName}</Col>
          <Col
            className={styles.campaignsCount}
            offset={1}
          >
            {`${completedCampaignsCount}/${totalCampaigns}`}
          </Col>
          <Col className={styles.dropdownIcon}><DownOutlined /></Col>
        </Row>
      </a>
    </Dropdown>
  ) : <Col className={styles.campaignDropdown}>{activeCampaign && activeCampaignName}</Col>
  return (
    <PageHeader
      className={styles.campaignHeader}
      onBack={handleNavigation}
      backIcon={<DirectionalNavigateBackIcon className={styles.backIcon} />}
      ghost={false}
      title={titleElement}
      extra={extra}
    />
  )
}

export const CampaignPageHeader = connector(CampaignPageHeaderComponent)
