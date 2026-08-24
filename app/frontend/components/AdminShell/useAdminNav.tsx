import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
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
import compact from 'lodash/compact'
import maxBy from 'lodash/maxBy'
import takeWhile from 'lodash/takeWhile'
import { camelizeKeys } from '~/utils/object'
import { getFeatures } from '~/core/config'
import type { RootState } from '~/modules/admin/core/rootReducers'
import { closeSubmenu, openSubmenu } from '~/modules/admin/core/ui/menu'
import { useSubnav } from './SubnavContext'
import { isOwnedPath } from './ownedPaths'

const { I18n } = window

// No onClick: antd stretches the label anchor over the whole row, collapsed rail included.

type Permissions = Record<string, string | undefined>

type NavItem = NonNullable<AppShellNav['items']>[number]

type Entry = {
  key: string
  path?: string
  label: string
  icon: JSX.Element
}

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

const ROUTE_ALIASES: [RegExp, string][] = [
  [/^\/admin\/(clients|projects)(\/|$)/, 'clients'],
  [/^\/admin\/report_families(\/|$)/, 'reports'],
]

const segmentsOf = (path: string): string[] => (
  path.replace(/[?#].*$/, '').split('/').filter(Boolean)
)

const sharedDepth = (link: string[], route: string[]): number => (
  takeWhile(link, (segment, index) => segment === route[index]).length
)

// A link claims every url below it; one that points at a tab (report_approvals/my_tasks) claims that tab's peers too.
const matchDepth = (link: string[], route: string[]): number => {
  const depth = sharedDepth(link, route)

  if (depth === link.length) return depth

  return depth === link.length - 1 && depth > 1 ? depth : 0
}

const activeKeyFor = (pathname: string, links: Permissions): string | undefined => {
  const route = segmentsOf(pathname)

  const scored = Object.entries(links).map(([key, path]) => ({
    key,
    depth: path ? matchDepth(segmentsOf(path), route) : 0,
  }))
  const best = maxBy(scored, 'depth')

  return (best?.depth ? best.key : undefined) ?? ROUTE_ALIASES.find(([pattern]) => pattern.test(pathname))?.[1]
}

export const useAdminNav = (ownedPathPrefixes?: string[]): AppShellNav => {
  const { pathname } = useLocation()
  const links: Permissions = useSelector((state: RootState) => state.ui.menu.links)
  const features = useSelector(getFeatures)
  const showSubmenu = useSelector((state: RootState) => state.ui.menu.showSubmenu)
  const subnav = useSubnav()
  const hasSubmenu = subnav != null
  const dispatch = useDispatch()

  const routeParent = PARENT_OF[activeKeyFor(pathname, links) ?? ''] ?? undefined
  const [openKeys, setOpenKeys] = useState<string[]>(routeParent ? [routeParent] : [])

  useEffect(() => {
    if (routeParent) setOpenKeys(current => (current.includes(routeParent) ? current : [...current, routeParent]))
  }, [routeParent])

  return useMemo(() => {
    const { idpEnabled, skillRaterEnabled } = camelizeKeys(features ?? {})
    const clientContext = window.PsyGlobalState?.clientContextData

    const clientsPath = clientContext && links.clients
      ? `${links.clients}/${clientContext.id}/projects`
      : links.clients
    const clientsLabel = clientContext ? I18n.t('admin.projects') : I18n.t('admin.clients')

    const link = (path: string, label: string): JSX.Element => (
      isOwnedPath(path, ownedPathPrefixes) ? <Link to={path}>{label}</Link> : <a href={path}>{label}</a>
    )

    // A plain-string title keeps the collapsed rail's tooltip from rendering the anchor a second time.
    const entry = (e: Entry): NavItem | null => (e.path ? {
      key: e.key,
      label: link(e.path, e.label),
      title: e.label,
      icon: e.icon,
    } : null)

    const group = (key: string, label: string, icon: JSX.Element, children: (NavItem | null)[]): NavItem | null => {
      const visible = compact(children)
      return visible.length ? {
        key, label, icon, children: visible,
      } : null
    }

    const items = compact([
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
        label: I18n.t('admin.communications'),
        icon: <Mail />,
      }),
      entry({
        key: 'newCommunicationCenter',
        path: links.newCommunicationCenter,
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
    ])

    const active = activeKeyFor(pathname, links)

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
  }, [pathname, links, features, ownedPathPrefixes, openKeys, hasSubmenu, showSubmenu, subnav, dispatch])
}
