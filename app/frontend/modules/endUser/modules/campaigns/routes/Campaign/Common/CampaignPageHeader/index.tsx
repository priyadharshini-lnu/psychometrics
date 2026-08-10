import React, {
  useEffect, FC, useState, useContext,
} from 'react'
import cs from 'classnames'
import { connect, ConnectedProps } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@ant-design/pro-components'
import {
  Row, Col, Dropdown, Tag, theme, Space,
  Button,
} from 'antd'
import { DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

import { fetchCampaigns } from '~/modules/endUser/modules/campaigns/core/campaigns'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { DirectionalNavigateBackIcon, MediaQueryContext } from '~/glint'
import styles from './styles.less'

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
const { useToken } = theme

export const CampaignPageHeaderComponent: FC<NewHeaderComponentProps> = ({
  campaigns, fetchCampaigns, activeCampaignId, extra,
}) => {
  const [openMenu, setOpenMenu] = useState(false)
  const { token } = useToken()
  const navigate = useNavigate()
  const { isMobile } = useContext(MediaQueryContext)
  const activeCampaign = campaigns.find(campaign => campaign.id === activeCampaignId)
  const completedCampaignsCount = campaigns.filter(campaign => campaign.progressStatus === 'completed').length
  const totalCampaigns = campaigns.length
  let activeCampaignName = ''
  if (activeCampaign) {
    activeCampaignName = activeCampaign.type === 'threesixty' ? activeCampaign.assessmentName : activeCampaign.name
  }

  const handleNavigation = () => {
    navigate('/dashboard')
  }

  useEffect(() => {
    !campaigns.length && fetchCampaigns()
  }, [])

  const handleCampaignSelect = (menu) => {
    navigate(menu.key)
  }
  const menuItems = campaigns.map((campaign) => {
    const campaignName = campaign.type === 'threesixty' ? campaign.assessmentName : campaign.name
    const routePath = campaign.type === 'threesixty'
      ? `/threesixty_campaigns/${campaign.id}` : `/campaigns/${campaign.id}`
    return (
      {
        key: routePath,
        label: (
          <Row gutter={[8, 0]} className={styles.campaignItem}>
            <Col>{campaignName}</Col>
            <Col flex="auto" className="ta-e">
              {campaign.progressStatus && (
                <Tag color={STATUSES[campaign.progressStatus].color}>
                  {STATUSES[campaign.progressStatus].text}
                </Tag>
              )}
            </Col>
          </Row>
        ),
      }
    )
  })

  const titleElement = campaigns.length > 1 ? (
    <Dropdown
      menu={{
        items: menuItems,
        selectedKeys: activeCampaign && [`${activeCampaign.id}`],
        onClick: handleCampaignSelect,
        className: styles.dropdownMenu,
        theme: 'light',
      }}
      trigger={['click']}
      onOpenChange={setOpenMenu}
      placement={isMobile ? 'bottom' : 'bottomLeft'}
    >
      <Button className={cs(styles.campaignDropdown, 'ps-0 pe-0')} type="link" aria-expanded={openMenu}>
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
      </Button>
    </Dropdown>
  ) : <Col style={{ fontSize: '20px' }} className={styles.campaignDropdown}>{activeCampaign && activeCampaignName}</Col>
  return (
    <PageHeader
      style={{ backgroundColor: token.colorPrimary }}
      className={styles.campaignHeader}
      backIcon={false}
      ghost={false}
      title={(
        <Space>
          <Button
            size="small"
            type="text"
            aria-label={I18n.t('frontend.aria.back_to_dashboard')}
            onClick={handleNavigation}
          >
            <DirectionalNavigateBackIcon className={styles.backIcon} />
          </Button>
          {
          titleElement
          }
        </Space>
      )}
      extra={extra}
    />

  )
}

export const CampaignPageHeader = connector(CampaignPageHeaderComponent)
