import { FC, ReactNode } from 'react'
import { connect, ConnectedProps, useSelector } from 'react-redux'
import { AppShell, useSiderAppearance } from '@thetalententerprise/glint'
import { RootState } from '~/modules/admin/core/rootReducers'
import { triggerCollapse } from '~/modules/admin/core/ui/menu'
import { AdminTheme } from './AdminTheme'
import { useAdminNav } from './useAdminNav'
import { useSiderWidth } from './useSiderWidth'
import { SubnavProvider } from './SubnavContext'
import { AdminTopBarStart, AdminTopBarEnd } from './AdminTopBar'
import MarshLogo from '~/assets/marsh-logo.svg?react'
import MarshMark from '~/assets/marsh-mark.svg?react'

const { I18n } = window

// 280px, not rem: the legacy stylesheet sets root font-size to 12px, so glint's rems render at 75%.
const SIDER_WIDTH = '280px'

// The shell top bar's rendered height (paddingSM x2 + controlHeightLG + border) — sticky table headers offset by this.
export const TOP_BAR_STICKY_OFFSET = 65

// A component so useSiderAppearance runs inside the theme provider (AppShell calls brand from within Sider).
const AdminBrand: FC<{ collapsed: boolean }> = ({ collapsed }) => {
  const appearance = useSiderAppearance()

  return (
    <a
      href="/admin"
      aria-label={I18n.t('frontend.aria.back_to_dashboard')}
      style={{
        display: 'flex',
        justifyContent: 'center',
        color: appearance === 'dark' ? 'var(--white-bg)' : 'var(--brand-navy)',
      }}
    >
      {collapsed ? (
        <MarshMark role="img" aria-label="Marsh" style={{ blockSize: '1.875rem', inlineSize: 'auto' }} />
      ) : (
        <MarshLogo
          role="img"
          aria-label="Marsh"
          style={{ blockSize: '1.875rem', inlineSize: 'auto', maxInlineSize: '100%' }}
        />
      )}
    </a>
  )
}

// The product wordmark, pinned under the nav; the theme's sans at its thinnest.
const AdminSiderFooter: FC<{ collapsed: boolean }> = ({ collapsed }) => {
  const appearance = useSiderAppearance()

  return (
    // A container query so the wordmark shrinks with a dragged-narrow rail instead of clipping.
    <div style={{ containerType: 'inline-size' }}>
      <div
        style={{
          fontWeight: 200,
          fontSize: collapsed ? '1rem' : 'clamp(0.5rem, 11cqi, 1.375rem)',
          letterSpacing: collapsed ? 0 : '0.18em',
          textTransform: 'uppercase',
          textAlign: 'center',
          color: appearance === 'dark' ? 'var(--white-bg)' : 'var(--brand-navy)',
          whiteSpace: 'nowrap',
        }}
      >
        {collapsed ? 'L' : 'Lighthouse'}
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
}

// The admin shell on glint's AppShell; the rail's theme is why it cannot be themed from outside.
const AdminShellComponent: FC<Props> = ({
  collapsed,
  triggerCollapse,
  children,
  topBarEnd,
  topBarStart,
}) => (
  // ShellBody sits inside AdminTheme so preference-reading hooks mount behind its gate.
  <AdminTheme>
    <ShellBody
      collapsed={collapsed}
      triggerCollapse={triggerCollapse}
      topBarEnd={topBarEnd}
      topBarStart={topBarStart}
    >
      {children}
    </ShellBody>
  </AdminTheme>
)

const ShellBody: FC<Props> = ({
  collapsed,
  triggerCollapse,
  children,
  topBarEnd,
  topBarStart,
}) => {
  const nav = useAdminNav()
  const { width, save } = useSiderWidth(SIDER_WIDTH)
  const showSubmenu = useSelector((state: RootState) => state.ui.menu.showSubmenu)

  return (
    <AppShell
      brand={isCollapsed => <AdminBrand collapsed={isCollapsed} />}
      siderFooter={isCollapsed => <AdminSiderFooter collapsed={isCollapsed} />}
      resizableSider
      onSiderWidthChange={save}
      nav={nav}
      navKey={showSubmenu ? 'subnav' : 'main'}
      topBarStart={topBarStart ?? <AdminTopBarStart />}
      topBarEnd={topBarEnd ?? <AdminTopBarEnd />}
      defaultCollapsed={collapsed}
      onCollapsedChange={() => triggerCollapse()}
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

// Provider sits above the shell so routed pages can publish their own nav into the rail.
export const AdminShell: FC<Omit<Props, keyof PropsFromRedux>> = props => (
  <SubnavProvider><ConnectedAdminShell {...props} /></SubnavProvider>
)

export default AdminShell
