import { FC } from 'react'
import { connect, ConnectedProps, useSelector } from 'react-redux'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import {
  Avatar, Button, Flex, Typography, useSiderAppearance,
} from '@thetalententerprise/glint'
import type { AppShellNav } from '@thetalententerprise/glint'
import {
  HomeOutlined,
  UserOutlined,
  CalendarOutlined,
  ReadOutlined,
  LineChartOutlined,
  LockOutlined,
  LogoutOutlined,
} from '@thetalententerprise/glint/icons'
import { camelizeKeys } from '~/utils/object'
import { RootState } from '~/modules/endUser/core/rootReducers'
import {
  getProjectLogo,
  getName as getProjectName,
  getLogoAltText,
} from '~/modules/endUser/modules/campaigns/core/project'
import { getShowBookings } from '~/modules/endUser/core/config'
import { get as getCurrentUser } from '~/core/currentUser'
import { getFeatures } from '~/core/config'

import lighthouseWhiteLogo from '~/assets/lh-horizontal-white.svg'
import { fallbackAvatar } from './avatar'

const { I18n } = window

// Icon-only mark for the collapsed rail (the wordmark can't fit the narrow column);
// a tenant brand mark wins when uploaded.
const LighthouseMark: FC = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 21h6M10 21l1-9M14 21l-1-9" />
    <path d="M9.5 12h5l-.7-4.5h-3.6L9.5 12z" />
    <circle cx="12" cy="4.5" r="1.6" />
    <path d="M13.6 4.5l3 1M10.4 4.5l-3 1" />
  </svg>
)

const brandConnector = connect((state: RootState) => ({
  logo: getProjectLogo(state),
  projectName: getProjectName(state),
  logoAltText: getLogoAltText(state),
}))

type RailBrandProps = ConnectedProps<typeof brandConnector> & {
  collapsed: boolean
  updateProfileRequired: boolean
}

// The rail-top brand block: tenant logo (fallback: Lighthouse wordmark/mark) linking home.
// The white wordmark asset is dark-rail-only; light rails fall back to the
// currentColor mark, which inherits the rail's text color.
const RailBrandComponent: FC<RailBrandProps> = ({
  logo, projectName, logoAltText, collapsed, updateProfileRequired,
}) => {
  const railAppearance = useSiderAppearance()
  const logoLinkUrl = updateProfileRequired ? '/profile_details' : '/'
  const alt = logoAltText || projectName

  if (collapsed) {
    return (
      <Flex justify="center">
        <Link to={logoLinkUrl} aria-label={alt}>
          {logo
            ? <img src={logo} alt={alt} style={{ inlineSize: '2.25rem', blockSize: '2.25rem', objectFit: 'contain' }} />
            : <LighthouseMark />}
        </Link>
      </Flex>
    )
  }

  if (!logo && railAppearance === 'light') {
    return (
      <Link to={logoLinkUrl} aria-label={alt}>
        <Flex align="center" gap="small">
          <LighthouseMark />
          <Typography.Text strong>{I18n.t('frontend.lighthouse_app')}</Typography.Text>
        </Flex>
      </Link>
    )
  }

  return (
    <Link to={logoLinkUrl}>
      <img
        src={logo || lighthouseWhiteLogo}
        alt={alt}
        style={{ maxInlineSize: '100%', blockSize: 'auto' }}
      />
    </Link>
  )
}

export const RailBrand = brandConnector(RailBrandComponent)

const profileConnector = connect((state: RootState) => ({
  currentUser: getCurrentUser(state),
}))

type RailProfileProps = ConnectedProps<typeof profileConnector> & { collapsed: boolean }

// Squared avatar: uploaded photo, else a DiceBear face seeded by the account.
const ProfileAvatar: FC<{ photo?: string, fullName?: string, email?: string }> = ({
  photo, fullName, email,
}) => (
  <Avatar
    src={photo || fallbackAvatar(email || fullName || 'user')}
    size="large"
    shape="square"
    icon={<UserOutlined />}
    style={{ background: 'var(--ant-color-fill-secondary)', flexShrink: 0 }}
  />
)

// The rail-bottom profile block: squared initials avatar, name over email, quiet logout.
const RailProfileComponent: FC<RailProfileProps> = ({ currentUser, collapsed }) => {
  const logoutLabel = I18n.t('enduser.sign_out')
  const handleLogout = () => {
    window.location.href = '/users/sign_out'
  }

  if (collapsed) {
    return (
      <Flex vertical align="center" gap="small">
        <ProfileAvatar photo={currentUser.photo} fullName={currentUser.fullName} email={currentUser.email} />
        <Button
          size="small"
          icon={<LogoutOutlined />}
          aria-label={logoutLabel}
          onClick={handleLogout}
        />
      </Flex>
    )
  }

  return (
    <Flex vertical gap="middle">
      <Flex align="center" gap="small" style={{ minInlineSize: 0 }}>
        <ProfileAvatar photo={currentUser.photo} fullName={currentUser.fullName} email={currentUser.email} />
        <Flex vertical style={{ minInlineSize: 0 }}>
          <Typography.Text strong ellipsis>{currentUser.fullName}</Typography.Text>
          <Typography.Text type="secondary" ellipsis>{currentUser.email}</Typography.Text>
        </Flex>
      </Flex>
      <Button
        block
        icon={<LogoutOutlined />}
        onClick={handleLogout}
      >
        {logoutLabel}
      </Button>
    </Flex>
  )
}

export const RailProfile = profileConnector(RailProfileComponent)

// Nav data for the rail Menu — same redux-driven destinations and gating as the legacy sider.
export const useDashboardNav = (updateProfileRequired: boolean): AppShellNav => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const showBookings = useSelector(getShowBookings)
  const features = useSelector(getFeatures)
  const idp = useSelector((state: RootState) => state.config.idp)

  const { idpEnabled } = camelizeKeys(features)
  const idpVisible = Boolean(
    idpEnabled
      && idp.idpEnabled
      && (idp.userHasActiveIdp || idp.userHasDirectReporteesWithActiveIdp),
  )
  const idpPath = idp.userHasActiveIdp ? '/idp/my_plan' : '/idp/direct_reportees'

  const campaignId = pathname.match(/\/campaigns\/(\d+)/)?.[1]

  const activeKey = (() => {
    if (pathname.includes('/idp/')) return 'development'
    if (pathname.includes('/invites')) return 'scheduling'
    if (pathname.includes('/insights')) return 'insights'
    if (pathname.includes('/change_password')) return 'change_password'
    if (pathname.includes('/profile')) return 'profile'
    return 'dashboard'
  })()

  const allItems = [
    {
      key: 'dashboard',
      label: I18n.t('enduser.dashboard'),
      icon: <HomeOutlined />,
      onClick: () => navigate('/dashboard'),
    },
    ...(idpVisible
      ? [{
        key: 'development',
        label: I18n.t('enduser.development'),
        icon: <ReadOutlined />,
        onClick: () => navigate(idpPath),
      }]
      : []),
    ...(showBookings
      ? [{
        key: 'scheduling',
        label: I18n.t('enduser.scheduling'),
        icon: <CalendarOutlined />,
        onClick: () => navigate('/invites'),
      }]
      : []),
    ...(campaignId
      ? [{
        key: 'insights',
        label: I18n.t('enduser.insights'),
        icon: <LineChartOutlined />,
        onClick: () => navigate(`/campaigns/${campaignId}/insights`),
      }]
      : []),
    {
      key: 'profile',
      label: I18n.t('enduser.my_profile'),
      icon: <UserOutlined />,
      onClick: () => navigate('/profile_details'),
    },
    {
      key: 'change_password',
      label: I18n.t('shared.change_password', { defaultValue: 'Change password' }),
      icon: <LockOutlined />,
      onClick: () => navigate('/change_password'),
    },
  ]

  // Legacy parity: when the profile must be completed first, only the profile-area items show.
  const items = updateProfileRequired
    ? allItems.filter(item => item.key === 'profile' || item.key === 'change_password')
    : allItems

  return { items, selectedKeys: [activeKey] }
}
