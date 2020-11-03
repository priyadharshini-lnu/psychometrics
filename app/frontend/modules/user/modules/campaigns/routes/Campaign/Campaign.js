import React, { useEffect } from 'react'
import Common from './Common'
import Threesixty from './Threesixty'

const TYPES = {
  common: Common,
  threesixty: Threesixty,
}

export default function Campaign ({
  history, match, fetchCampaign, campaign,
  loaded, resetCampaign,
}) {
  useEffect(() => {
    fetchCampaign(match.url)

    return () => { resetCampaign() }
  }, [])

  if (!loaded) { return null }

  const Campaign = TYPES[campaign.type]
  return (
    <Campaign history={history} match={match} />
  )
}
