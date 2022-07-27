import React, { useEffect, FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { RouteComponentProps } from 'react-router-dom'

import { fetchCampaign, reset as resetCampaign } from 'modules/user/modules/campaigns/core/campaign'
import { RootState } from 'modules/user/core/rootReducers'

import { Common } from './Common'
import { Threesixty } from './Threesixty'

const TYPES = {
  common: Common,
  threesixty: Threesixty,
}

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

  if (!loaded) {
    return null
  }

  const Campaign = TYPES[campaign.type]
  return <Campaign history={history} match={match} />
}

export const Campaign = connector(CampaignComponent)
