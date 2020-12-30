import React, { useEffect, FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { Row, PageHeader } from 'antd'

import { RootState } from 'modules/admin/core/rootReducers'
import { get as getCurrentUser } from 'core/currentUser'
import { downloadReport } from 'modules/user/modules/campaigns/core/report'
import {
  fetchCampaigns,
  loginHogan,
  acceptPolicy,
} from 'modules/user/modules/campaigns/core/campaigns'

import Campaigns from './Campaigns'

import './styles.scss'

const { I18n } = window

const mapStateToProps = (state: RootState) => ({
  campaigns: state.campaigns.campaigns,
  currentUser: getCurrentUser(state),
})

const mapDispatchToProps = {
  downloadReport,
  fetchCampaigns,
  loginHogan,
  acceptPolicy,
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type PropsFromRedux = ConnectedProps<typeof connector>

const CampaignList: FC<PropsFromRedux> = ({
  campaigns,
  currentUser,
  downloadReport,
  fetchCampaigns,
  loginHogan,
  acceptPolicy,
}) => {
  const history = useHistory()

  useEffect(() => {
    fetchCampaigns()
  }, [])

  useEffect(() => {
    // Redirect directly to assessment screen if only one assessment is present
    if (campaigns.length === 1) {
      const { type, id } = campaigns[0]

      if (type === 'threesixty') {
        history.push(`/threesixty_campaigns/${id}`)
      } else if (type === 'common') {
        history.push(`/campaigns/${id}`)
      }
    }
  }, [campaigns])

  return (
    <div className="fluid-container">
      <PageHeader
        className="ps-0 pe-0"
        ghost
        backIcon={false}
        title={(
          <div className="title-with-dash">
            {I18n.t('threesixty.dashboard_title', {
              name: currentUser.firstName,
            })}
          </div>
        )}
      />
      <Row gutter={[32, 32]}>
        {campaigns.map((campaign) => {
          const Component = Campaigns[campaign.type]

          return (
            <Component
              key={campaign.id}
              campaign={campaign}
              downloadReport={downloadReport}
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

const CampaignListConnected = connector(CampaignList)

export { CampaignListConnected as default, CampaignList }
