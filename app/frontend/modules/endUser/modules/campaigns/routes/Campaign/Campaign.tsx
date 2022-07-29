import React, { useEffect, FC } from 'react'
import { Layout, Col } from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { RouteComponentProps } from 'react-router-dom'

import { fetchCampaign, reset as resetCampaign } from 'modules/user/modules/campaigns/core/campaign'
import { RootState } from 'modules/user/core/rootReducers'

import { PageHeader } from 'glint'
import LangDropdown from 'components/LangDropdown'
import { PageContentSkeleton } from 'modules/endUser/modules/campaigns/components/PageContentSkeleton'
import { Common } from './Common'
import { Threesixty } from './Threesixty'

import styles from './styles.less'

const TYPES = {
  common: Common,
  threesixty: Threesixty,
}
const { Content } = Layout
const { I18n } = window
const locales = I18n.availableLocales
const current = I18n.locale

const connector = connect(
  (state: RootState) => ({
    loaded: state.campaigns.campaign.loaded,
    campaign: state.campaigns.campaign,
  }),
  {
    fetchCampaign,
    resetCampaign,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>
type Params = {
  url: string
}

type CampaignComponentProps = RouteComponentProps<Params> & PropsFromRedux

const CampaignComponent: FC<CampaignComponentProps> = ({
  history,
  match,
  fetchCampaign,
  campaign,
  loaded,
  resetCampaign,
}) => {
  useEffect(() => {
    fetchCampaign(match.url)

    return () => {
      resetCampaign()
    }
  }, [match.url])

  const headerElement = (
    <Col flex="auto" span={24} className="ta-e">
      <LangDropdown locales={locales} current={current} />
    </Col>
  )

  const Campaign = TYPES[campaign.type]
  return (
    <>
      <PageHeader>{headerElement}</PageHeader>
      <Content className={styles.pageContent}>
        { loaded ? <Campaign history={history} match={match} />
          : (
            <PageContentSkeleton />
          )}
      </Content>
    </>
  )
}

export const Campaign = connector(CampaignComponent)
