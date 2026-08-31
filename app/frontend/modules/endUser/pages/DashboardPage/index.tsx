import { FC, useEffect, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { createSelector } from 'reselect'
import { isRequestInProgress } from '~/core/request'
import { RootState } from '~/modules/endUser/core/rootReducers'
import {
  fetchCampaigns,
  FETCH,
} from '~/modules/endUser/modules/campaigns/core/campaigns'
import { hasErrorsToHandle } from '~/components/ErrorModal/ErrorModal'
import { DashboardContent } from './DashboardContent'
import { toDashboardCampaigns } from './mapCampaign'

// Memoised so the derived list keeps a stable identity between store updates.
const selectCampaigns = createSelector(
  (state: RootState) => state.campaigns.campaigns,
  toDashboardCampaigns,
)

const connector = connect(
  (state: RootState) => ({
    campaigns: selectCampaigns(state),
    firstName: state.currentUser.fullName?.split(/\s+/)[0],
    isLoading: isRequestInProgress(state, FETCH),
    errors: state.errors,
  }),
  { fetchCampaigns },
)

type PropsFromRedux = ConnectedProps<typeof connector>

// The glint dashboard (whole-page swap at the route level): UserPage chrome around the
// Folio campaign list. Reuses the legacy data layer (fetchCampaigns on mount).
export const DashboardPageComponent: FC<PropsFromRedux> = ({
  campaigns,
  firstName,
  isLoading,
  errors,
  fetchCampaigns,
}) => {
  const [error, setError] = useState(false)

  // Handled error status codes are left to the global ErrorModal; anything else
  // becomes the content's soft error state.
  const handledErrorStatusCode = hasErrorsToHandle(errors.errors)?.statusCode
  const hasError = error && !handledErrorStatusCode

  useEffect(() => {
    fetchCampaigns().catch(() => {
      setError(true)
    })
  }, [])

  return (
    <DashboardContent
      campaigns={campaigns}
      isLoading={isLoading}
      hasError={hasError}
      firstName={firstName}
    />
  )
}

export const DashboardPage = connector(DashboardPageComponent)

export default DashboardPage
