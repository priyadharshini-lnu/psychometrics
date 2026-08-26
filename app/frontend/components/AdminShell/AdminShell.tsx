import { FC, ReactNode } from 'react'
import { connect, ConnectedProps, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { AppShell, useSiderAppearance } from '@thetalententerprise/glint'
import { RootState } from '~/modules/admin/core/rootReducers'
import { triggerCollapse } from '~/modules/admin/core/ui/menu'
import { useAdminNav } from './useAdminNav'
import { useSiderWidth } from './useSiderWidth'
import { useSiderCollapsed } from './useSiderCollapsed'
import { SubnavProvider } from './SubnavContext'
import { OwnedPathsProvider, useIsOwnedPath } from './ownedPaths'
import { AdminTopBarStart, AdminTopBarEnd } from './AdminTopBar'
import { SignInNotice } from './SignInNotice'
import {
  displayName, monogramCurrentColor, monogramHeightPx, wordmarkCurrentColor, wordmarkHeightPx,
} from '~/utils/branding'

const { I18n } = window

const SIDER_WIDTH = '280px'

const ADMIN_HOME = '/admin'

// Every user gets the profile links, so only a permission-gated entry says this shell belongs to an admin.
// Key names track Administration::NavigationLinksSerializer; its spec pins them literally.
const ADMIN_MENU_KEYS = ['dashboards', 'clients', 'users']

/** Where the logo goes: an assessor-only user has no admin menu entries, so they land on their own dashboard. */
export const brandHomePath = (links: Record<string, string>): string => (
  ADMIN_MENU_KEYS.some(key => links[key]) ? ADMIN_HOME : (links.assessorDashboard || ADMIN_HOME)
)

// A component so useSiderAppearance runs inside the theme provider (AppShell calls brand from within Sider).
const AdminBrand: FC<{ collapsed: boolean }> = ({ collapsed }) => {
  const appearance = useSiderAppearance()
  const links = useSelector((state: RootState) => state.ui.menu.links)
  const isOwned = useIsOwnedPath()

  const home = brandHomePath(links)
  const label = I18n.t('frontend.aria.back_to_dashboard')
  const style = {
    display: 'flex',
    justifyContent: 'center',
    color: appearance === 'dark' ? 'var(--white-bg)' : 'var(--brand-navy)',
  }
  const Wordmark = wordmarkCurrentColor()
  const Mark = monogramCurrentColor()
  const brandName = displayName()
  const artwork = collapsed ? (
    <Mark role="img" aria-label={brandName} style={{ blockSize: `${monogramHeightPx()}px`, inlineSize: 'auto' }} />
  ) : (
    <Wordmark
      role="img"
      aria-label={brandName}
      style={{ blockSize: `${wordmarkHeightPx()}px`, inlineSize: 'auto', maxInlineSize: '100%' }}
    />
  )

  if (isOwned(home)) {
    return <Link to={home} aria-label={label} style={style}>{artwork}</Link>
  }

  return <a href={home} aria-label={label} style={style}>{artwork}</a>
}

// The product wordmark, pinned under the nav; the theme's sans at its thinnest.
const AdminSiderFooter: FC<{ collapsed: boolean }> = ({ collapsed }) => {
  const appearance = useSiderAppearance()

  if (collapsed) return null

  return (
    <div style={{ containerType: 'inline-size' }}>
      <div
        style={{
          fontWeight: 200,
          fontSize: 'clamp(0.5rem, 11cqi, 1.375rem)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          textAlign: 'center',
          color: appearance === 'dark' ? 'var(--white-bg)' : 'var(--brand-navy)',
          whiteSpace: 'nowrap',
        }}
      >
        Lighthouse
      </div>
    </div>
  )
}

const connecter = connect(
  (state: RootState) => ({ collapsed: state.ui.menu.collapsed }),
  { triggerCollapse },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

type Props = PropsFromRedux & {
  children?: ReactNode
  /** Rendered in the top bar's inline-end slot (notifications, profile). */
  topBarEnd?: ReactNode
  topBarStart?: ReactNode
  /** Paths under these prefixes are pushed to the mounting app's router; everything else is a full page load. */
  ownedPathPrefixes?: string[]
}

// The admin shell on glint's AppShell; the rail's theme is why it cannot be themed from outside.
const AdminShellComponent: FC<Props> = ({
  collapsed,
  triggerCollapse,
  children,
  topBarEnd,
  topBarStart,
  ownedPathPrefixes,
}) => (
  // AdminTheme is mounted by the router's root layout route, so routes outside this shell are themed too.
  <>
    <SignInNotice />
    <ShellBody
      collapsed={collapsed}
      triggerCollapse={triggerCollapse}
      topBarEnd={topBarEnd}
      topBarStart={topBarStart}
      ownedPathPrefixes={ownedPathPrefixes}
    >
      {children}
    </ShellBody>
  </>
)

const ShellBody: FC<Props> = ({
  collapsed,
  triggerCollapse,
  children,
  topBarEnd,
  topBarStart,
  ownedPathPrefixes,
}) => {
  const nav = useAdminNav(ownedPathPrefixes)
  const { width, save } = useSiderWidth(SIDER_WIDTH)
  const { collapsed: initialCollapsed, save: saveCollapsed } = useSiderCollapsed(collapsed)
  const showSubmenu = useSelector((state: RootState) => state.ui.menu.showSubmenu)

  return (
    <AppShell
      brand={isCollapsed => <AdminBrand collapsed={isCollapsed} />}
      siderFooter={isCollapsed => <AdminSiderFooter collapsed={isCollapsed} />}
      resizableSider
      maxSiderWidth={SIDER_WIDTH}
      onSiderWidthChange={save}
      nav={nav}
      navKey={showSubmenu ? 'subnav' : 'main'}
      topBarSize="small"
      topBarStart={topBarStart ?? <AdminTopBarStart />}
      topBarEnd={topBarEnd ?? <AdminTopBarEnd />}
      defaultCollapsed={initialCollapsed}
      // Only the user's own toggle reaches here, so this is the one collapse worth storing.
      onCollapsedChange={(next) => { saveCollapsed(next); triggerCollapse() }}
      collapseLabel={I18n.t('frontend.aria.collapse_menu')}
      expandLabel={I18n.t('frontend.aria.expand_menu')}
      skipToContentLabel={I18n.t('frontend.aria.skip_to_content', { defaultValue: 'Skip to content' })}
      siderWidth={width}
      contentId="admin-content"
    >
      {children}
    </AppShell>
  )
}

const ConnectedAdminShell = connecter(AdminShellComponent)

// Providers sit above the shell so routed pages can publish their own nav and read which paths the router owns.
export const AdminShell: FC<Omit<Props, keyof PropsFromRedux>> = ({ ownedPathPrefixes, ...props }) => (
  <OwnedPathsProvider prefixes={ownedPathPrefixes}>
    <SubnavProvider><ConnectedAdminShell ownedPathPrefixes={ownedPathPrefixes} {...props} /></SubnavProvider>
  </OwnedPathsProvider>
)

export default AdminShell
