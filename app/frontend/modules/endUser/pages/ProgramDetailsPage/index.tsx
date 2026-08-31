import { FC, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import {
  Button, Flex, Spin, Tag, useDirection,
} from '@thetalententerprise/glint'
import { ArrowLeftOutlined, ArrowRightOutlined } from '@thetalententerprise/glint/icons'
import { RootState } from '~/modules/endUser/core/rootReducers'
import { fetchCampaign } from '~/modules/endUser/modules/campaigns/core/campaign'
import { useTopBarStart } from '~/modules/endUser/pages/UserPage'
import { ProgramDetailsContent } from './ProgramDetailsContent'
import { mapDueDate, type ProgramCampaign } from './mapProgramDetails'

const { I18n } = window

const MS_PER_DAY = 86_400_000

// The campaign slice is legacy untyped JS; declaring the mapped shape keeps the props honest.
type StateProps = { campaign: ProgramCampaign; loaded: boolean }

const connector = connect(
  (state: RootState): StateProps => ({
    campaign: state.campaigns.campaign,
    loaded: Boolean(state.campaigns.campaign.loaded),
  }),
  { fetchCampaign },
)

type PropsFromRedux = ConnectedProps<typeof connector>

// The due-date countdown pill for the top bar: localized date + days left, urgent in red.
const DuePill: FC<{ endDate?: string | null }> = ({ endDate }) => {
  const due = mapDueDate(endDate)
  if (!due) return null
  const daysLeft = Math.max(0, Math.ceil((due.deadlineMs - Date.now()) / MS_PER_DAY))
  const dateLabel = new Date(due.deadlineMs).toLocaleDateString(I18n.currentLocale(), {
    month: 'short',
    day: 'numeric',
  })
  return (
    <Tag color={due.urgent ? 'red' : 'default'}>
      {`${I18n.t('enduser.details_due')} ${dateLabel} · ${I18n.t('enduser.dashboard_days_left', { count: daysLeft })}`}
    </Tag>
  )
}

// Whole-page glint swap for `/campaigns/:campaignId`. Reuses the legacy data layer inside
// the shared UserPage chrome; the top bar gains Back + the due countdown. Threesixty
// campaigns redirect to their legacy route (which falls through to the legacy tree).
export const ProgramDetailsPageComponent: FC<PropsFromRedux> = ({
  campaign,
  loaded,
  fetchCampaign,
}) => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  // Standalone arrow glyphs don't mirror in RTL — pick the direction-appropriate icon.
  const backIcon = useDirection() === 'rtl' ? <ArrowRightOutlined /> : <ArrowLeftOutlined />

  // Same fetch lifecycle as the legacy Campaign route: the raw pathname is the fetch URL.
  useEffect(() => {
    fetchCampaign(pathname)
  }, [pathname])

  useTopBarStart(
    <Flex align="center" gap="middle">
      <Button
        variant="text"
        color="default"
        icon={backIcon}
        onClick={() => navigate('/dashboard')}
      >
        {I18n.t('enduser.details_back')}
      </Button>
      {loaded ? <DuePill endDate={campaign.endDate} /> : null}
    </Flex>,
  )

  if (loaded && campaign.type === 'threesixty') {
    return <Navigate to={`/threesixty_campaigns/${campaign.id}`} replace />
  }

  return (
    <>
      {loaded ? (
        <ProgramDetailsContent campaign={campaign} />
      ) : (
        <Flex justify="center" style={{ paddingBlock: '4rem' }}>
          <Spin size="large" />
        </Flex>
      )}
    </>
  )
}

export const ProgramDetailsPage = connector(ProgramDetailsPageComponent)

export default ProgramDetailsPage
