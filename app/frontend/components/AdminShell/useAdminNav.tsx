import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { AppShellNav } from '@thetalententerprise/glint'
import {
  AccountTree,
  Analytics,
  ArrowBack,
  ArrowForward,
  Assignment,
  AssignmentTurnedIn,
  CalendarMonth,
  Campaign,
  CheckCircle,
  Dashboard,
  Event,
  Explore,
  FolderOpen,
  Group,
  Help,
  History,
  InsertChart,
  Mail,
  MenuBook,
  PermMedia,
  Public,
  Rule,
  Schema,
  Settings,
  SettingsApplications,
  SmartToy,
  SpaceDashboard,
} from '@thetalententerprise/glint/icons'
import { camelizeKeys } from '~/utils/object'
import { getFeatures } from '~/core/config'
import type { RootState } from '~/modules/admin/core/rootReducers'
import { closeSubmenu, openSubmenu } from '~/modules/admin/core/ui/menu'
import { usePagePrefetch } from '~/utils/usePagePrefetch'
import { useSubnav } from './SubnavContext'
import { isOwnedPath } from './ownedPaths'

const { I18n } = window

// No onClick: antd stretches the label anchor over the whole row (.ant-menu-item a::before), collapsed rail
// included — verified on antd 6.5.1 + glint 0.46.1. Selection derives from the route.

type Permissions = Record<string, string | undefined>

type NavItem = NonNullable<AppShellNav['items']>[number]

type Entry = {
  key: string
  path?: string
  label: string
  icon: JSX.Element
}

/** Which submenu, if any, owns a given key — drives `openKeys`. */
const PARENT_OF: Record<string, string> = {
  assessments: 'content',
  norms: 'content',
  dimensions: 'content',
  reports: 'content',
  questionCenter: 'content',
  libraries: 'content',
  skillsTaxonomy: 'configuration',
  developmentActions: 'configuration',
  aiAssistants: 'configuration',
  campaignTemplates: 'configuration',
  reportApprovals: 'approvals',
  aiScoringApprovals: 'approvals',
}

// Longest match first so a nested path is not captured by a shorter sibling.
const ROUTE_KEYS: [RegExp, string][] = [
  // The assessor app mounts this same shell under its own /assessors prefix.
  [/\/assessors\/assessment_centers/, 'assessorWorkshops'],
  [/\/assessors\/availabilit/, 'userAvailability'],
  [/\/assessors(\/|$)/, 'assessorDashboard'],
  [/\/administration\/templates\/(questions|blocks)/, 'questionCenter'],
  [/\/administration\/communications/, 'communicationCenter'],
  [/\/administration\/dimensions/, 'dimensions'],
  [/\/administration\/libraries/, 'libraries'],
  [/\/administration\/norms/, 'norms'],
  [/\/administration\/assessments/, 'assessments'],
  [/\/admin\/user_availabilities/, 'userAvailability'],
  [/\/admin\/audit_logs/, 'auditLogs'],
  [/\/admin\/data_reports/, 'dataReports'],
  [/\/admin\/report_approvals/, 'reportApprovals'],
  [/\/admin\/ai_scoring_approvals/, 'aiScoringApprovals'],
  [/\/admin\/skills_taxonomy/, 'skillsTaxonomy'],
  [/\/admin\/development_actions/, 'developmentActions'],
  [/\/admin\/ai_assistants/, 'aiAssistants'],
  [/\/admin\/campaign_templates/, 'campaignTemplates'],
  [/\/admin\/assessments/, 'assessments'],
  [/\/admin\/dimensions/, 'dimensions'],
  [/\/admin\/norms/, 'norms'],
  [/\/admin\/reports/, 'reports'],
  [/\/admin\/settings/, 'settings'],
  [/\/admin\/users/, 'users'],
  [/\/admin\/(clients|projects)/, 'clients'],
]

const activeKeyFor = (pathname: string): string | undefined => (
  ROUTE_KEYS.find(([pattern]) => pattern.test(pathname))?.[1]
)

export const useAdminNav = (ownedPathPrefixes?: string[], routes?: RouteObject[]): AppShellNav => {
  const { pathname } = useLocation()
  const links: Permissions = useSelector((state: RootState) => state.ui.menu.links)
  const features = useSelector(getFeatures)
  const showSubmenu = useSelector((state: RootState) => state.ui.menu.showSubmenu)
  // A section having published a nav IS the condition — no redux flag to keep in sync.
  const subnav = useSubnav()
  const hasSubmenu = subnav != null
  const dispatch = useDispatch()
  const { prefetch, cancel } = usePagePrefetch(routes)

  // openKeys is controlled and user-driven; the route only seeds and augments it.
  const routeParent = PARENT_OF[activeKeyFor(pathname) ?? ''] ?? undefined
  const [openKeys, setOpenKeys] = useState<string[]>(routeParent ? [routeParent] : [])

  useEffect(() => {
    if (routeParent) setOpenKeys(current => (current.includes(routeParent) ? current : [...current, routeParent]))
  }, [routeParent])

  return useMemo(() => {
    const { idpEnabled, skillRaterEnabled } = camelizeKeys(features ?? {})
    const clientContext = window.PsyGlobalState?.clientContextData

    // Inside a client context the clients entry becomes that client's projects.
    const clientsPath = clientContext && links.clients
      ? `${links.clients}/${clientContext.id}/projects`
      : links.clients
    const clientsLabel = clientContext ? I18n.t('admin.projects') : I18n.t('admin.clients')

    // rc-menu forwards these to the item's element; antd's item type only declares the pointer pair.
    const intent = (path: string) => ({
      onMouseEnter: () => prefetch(path),
      onMouseLeave: cancel,
      onFocus: () => prefetch(path),
      onBlur: cancel,
    })

    // Several apps mount this shell, each with its own router — only a path that router owns can be a SPA link.
    const link = (path: string, label: string): JSX.Element => (
      isOwnedPath(path, ownedPathPrefixes) ? <Link to={path}>{label}</Link> : <a href={path}>{label}</a>
    )

    // A plain-string title keeps the collapsed rail's tooltip from rendering the anchor a second time.
    const entry = (e: Entry): NavItem | null => (e.path ? {
      key: e.key,
      label: link(e.path, e.label),
      title: e.label,
      icon: e.icon,
      ...intent(e.path),
    } : null)

    const group = (key: string, label: string, icon: JSX.Element, children: (NavItem | null)[]): NavItem | null => {
      const visible = children.filter((child): child is NavItem => child != null)
      return visible.length ? {
        key, label, icon, children: visible,
      } : null
    }

    const items = [
      hasSubmenu ? {
        key: 'showSubmenu',
        label: I18n.t('admin.show_submenu'),
        icon: <ArrowForward />,
        onClick: () => dispatch(openSubmenu()),
      } : null,
      entry({
        key: 'dashboards', path: links.dashboards, label: I18n.t('admin.dashboard'), icon: <Dashboard />,
      }),
      entry({
        key: 'assessorDashboard',
        path: links.assessorDashboard,
        label: I18n.t('admin.assessor_dashboard'),
        icon: <SpaceDashboard />,
      }),
      entry({
        key: 'assessorWorkshops',
        path: links.assessorWorkshops,
        label: I18n.t('admin.assessor_workshops'),
        icon: <Event />,
      }),
      entry({
        key: 'clients', path: clientsPath, label: clientsLabel, icon: <Public />,
      }),
      entry({
        key: 'users', path: links.users, label: I18n.t('admin.users'), icon: <Group />,
      }),
      group('content', I18n.t('administration.navigation.content'), <FolderOpen />, [
        entry({
          key: 'assessments',
          path: links.assessments,
          label: I18n.t('admin.assessments'),
          icon: <Assignment />,
        }),
        entry({
          key: 'norms', path: links.norms, label: I18n.t('admin.norms'), icon: <Explore />,
        }),
        entry({
          key: 'dimensions',
          path: links.dimensions,
          label: I18n.t('admin.dimensions'),
          icon: <AccountTree />,
        }),
        entry({
          key: 'reports', path: links.reports, label: I18n.t('admin.reports'), icon: <InsertChart />,
        }),
        entry({
          key: 'questionCenter',
          path: links.questionCenter,
          label: I18n.t('admin.question_center'),
          icon: <Help />,
        }),
        entry({
          key: 'libraries', path: links.libraries, label: I18n.t('admin.libraries'), icon: <PermMedia />,
        }),
      ]),
      group('configuration', I18n.t('administration.navigation.configuration'), <SettingsApplications />, [
        skillRaterEnabled
          ? entry({
            key: 'skillsTaxonomy',
            path: links.skillsTaxonomy,
            label: I18n.t('admin.skills_taxonomy'),
            icon: <Schema />,
          })
          : null,
        idpEnabled
          ? entry({
            key: 'developmentActions',
            path: links.developmentActions,
            label: I18n.t('admin.development_actions'),
            icon: <MenuBook />,
          })
          : null,
        entry({
          key: 'aiAssistants',
          path: links.aiAssistants,
          label: I18n.t('admin.ai_assistants'),
          icon: <SmartToy />,
        }),
        entry({
          key: 'campaignTemplates',
          path: links.campaignTemplates,
          label: I18n.t('admin.campaign_templates'),
          icon: <Campaign />,
        }),
      ]),
      entry({
        key: 'communicationCenter',
        path: links.communicationCenter,
        label: I18n.t('admin.communication_center'),
        icon: <Mail />,
      }),
      group('approvals', I18n.t('administration.navigation.approvals'), <CheckCircle />, [
        entry({
          key: 'reportApprovals',
          path: links.reportApprovals,
          label: I18n.t('admin.report_approvals'),
          icon: <AssignmentTurnedIn />,
        }),
        entry({
          key: 'aiScoringApprovals',
          path: links.aiScoringApprovals,
          label: I18n.t('admin.ai_scoring_approvals'),
          icon: <Rule />,
        }),
      ]),
      entry({
        key: 'userAvailability',
        path: links.userAvailability,
        label: I18n.t('admin.availability'),
        icon: <CalendarMonth />,
      }),
      entry({
        key: 'auditLogs', path: links.auditLogs, label: I18n.t('admin.audit_logs'), icon: <History />,
      }),
      entry({
        key: 'dataReports',
        path: links.dataReports,
        label: I18n.t('admin.data_reports'),
        icon: <Analytics />,
      }),
      entry({
        key: 'settings', path: links.settings, label: I18n.t('admin.settings'), icon: <Settings />,
      }),
    ].filter((item): item is NavItem => item != null)

    const active = activeKeyFor(pathname)

    // A section's nav replaces the main menu; AppShell animates the swap off navKey.
    if (showSubmenu && subnav) {
      return {
        items: [{
          key: 'back_to_main_menu',
          label: I18n.t('admin.back_to_main'),
          icon: <ArrowBack />,
          onClick: () => dispatch(closeSubmenu()),
        }, ...(subnav.items ?? [])],
        selectedKeys: subnav.selectedKeys ?? [],
        openKeys: [],
        onOpenChange: () => {},
      }
    }

    return {
      items,
      selectedKeys: active ? [active] : [],
      openKeys,
      onOpenChange: (keys: string[]) => setOpenKeys(keys),
    }
  }, [pathname, links, features, ownedPathPrefixes, openKeys, hasSubmenu, showSubmenu, subnav, dispatch,
    prefetch, cancel])
}
