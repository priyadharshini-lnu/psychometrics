import React, { useState, FC, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link as RouterLink } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import {
  Layout, Menu, Avatar, Drawer,
} from 'antd'
import {
  MonitorOutlined, ArrowRightOutlined, MenuUnfoldOutlined,
  MenuFoldOutlined, UserOutlined, CalendarOutlined,
} from '@ant-design/icons'
import { useMedia } from 'react-use-media'
import cs from 'classnames'
import logo from '~/modules/endUser/assets/images/lighthouseLogoTall.png'
import logoSmall from '~/modules/auth/media/TTE_Logo_Color_Monogram.png'
import styles from './MainMenu.less'
import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getCurrentUser } from '~/core/currentUser'
import { camelizeKeys } from '~/utils/object'
import { openSubmenu, triggerCollapse } from '~/modules/admin/core/ui/menu'
import { shortify } from '~/utils/string'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    currentUser: camelizeKeys(getCurrentUser(state)),
    links: state.ui.menu.links,
    hasSubmenu: state.ui.menu.hasSubmenu,
    showSubmenu: state.ui.menu.showSubmenu,
    collapsed: state.ui.menu.collapsed,
  }),
  {
    openSubmenu, triggerCollapse,
  },
)
export type PropsFromRedux = ConnectedProps<typeof connecter>


interface Permissions {
  dashboards?: string
  assessorDashboard?: string
  assessorWorkshops?: string
  clients?: string
  users?: string
  norms?: string
  dimensions?: string
  assessments?: string
  questionCenter?: string
  libraries?: string
  communicationCenter?: string
  reports?: string
  reportApprovals?: string
  campaignTemplates?: string
  auditLogs?: string
}

// TODO: When all pages are implemented in single react, use this component instead of anchor tag
const Link = ({ href, children }) => {
  const selected = getSelected()
  return (selected !== 'profileDetails' && selected !== 'changePassword')
    ? <a href={href}>{children}</a> : <RouterLink to={href}>{children}</RouterLink>
}

const menuItems = (permissions: Permissions, hasSubmenu: boolean) => [
  hasSubmenu ? {
    key: 'showSubmenu',
    label: I18n.t('administration.navigation.show_submenu'),
    icon: <ArrowRightOutlined />,
  } : null,
  permissions.dashboards ? {
    key: 'dashboards',
    label: <a href={permissions.dashboards}>{I18n.t('administration.navigation.dashboard')}</a>,
    icon: <i className="fa fa-dashboard" />,
  } : null,
  permissions.assessorDashboard ? {
    key: 'assessorDashboard',
    label:
    <a href={permissions.assessorDashboard}>
      {I18n.t('administration.navigation.assessor_dashboard')}
    </a>,
    icon: <i className="fa fa-dashboard" />,
  } : null,
  permissions.assessorWorkshops ? {
    key: 'assessorWorkshops',
    label:
    <a href={permissions.assessorWorkshops}>
      {I18n.t('administration.navigation.assessor_workshops')}
    </a>,
    icon: <CalendarOutlined />,
  } : null,
  permissions.clients ? {
    key: 'clients',
    label:
    <a href={permissions.clients}>
      {I18n.t('administration.navigation.clients')}
    </a>,
    icon: <i className="fa fa-briefcase" />,
  } : null,
  permissions.users ? {
    key: 'users',
    label:
    <a href={permissions.users}>
      {I18n.t('administration.navigation.users')}
    </a>,
    icon: <i className="fa fa-users" />,
  } : null,
  permissions.norms ? {
    key: 'norms',
    label:
    <a href={permissions.norms}>
      {I18n.t('administration.navigation.norms')}
    </a>,
    icon: <MonitorOutlined />,
  } : null,
  permissions.dimensions ? {
    key: 'dimensions',
    label:
    <a href={permissions.dimensions}>
      {I18n.t('administration.navigation.dimensions')}
    </a>,
    icon: <i className="fa fa-file-text-o" />,
  } : null,
  permissions.assessments ? {
    key: 'assessments',
    label:
    <a href={permissions.assessments}>
      {I18n.t('administration.navigation.assessments')}
    </a>,
    icon: <i className="fa fa-universal-access" />,
  } : null,
  permissions.questionCenter ? {
    key: 'questionCenter',
    label:
    <a href={permissions.questionCenter}>
      {I18n.t('administration.navigation.question_center')}
    </a>,
    icon: <i className="fa fa-question-circle-o" />,
  } : null,
  permissions.libraries ? {
    key: 'libraries',
    label:
    <a href={permissions.libraries}>
      {I18n.t('administration.navigation.libraries')}
    </a>,
    icon: <i className="fa fa-file-image-o" />,
  } : null,
  permissions.communicationCenter ? {
    key: 'communicationCenter',
    label:
    <a href={permissions.communicationCenter}>
      {I18n.t('administration.navigation.communication_center')}
    </a>,
    icon: <i className="fa fa-envelope-o" />,
  } : null,
  permissions.reports ? {
    key: 'reports',
    label: <a href={permissions.reports}>{I18n.t('administration.navigation.reports')}</a>,
    icon: <i className="fa fa-pie-chart" />,
  } : null,
  permissions.reportApprovals ? {
    key: 'reportApprovals',
    label: <a href={permissions.reportApprovals}>{I18n.t('administration.navigation.report_approvals')}</a>,
    icon: <i className="fa fa-check" />,
  } : null,
  permissions.campaignTemplates ? {
    key: 'campaignTemplates',
    label: <a href={permissions.campaignTemplates}>{I18n.t('administration.navigation.campaign_templates')}</a>,
    icon: <i className="fa fa-gear" />,
  } : null,
  {
    key: 'userAvailability',
    label: <a href="/administration/user_availabilities">{I18n.t('administration.navigation.availability')}</a>,
    icon: <i className="fa fa-calendar" />,
  },
  permissions.auditLogs ? {
    key: 'auditLogs',
    label: <a href={permissions.auditLogs}>{I18n.t('administration.navigation.audit_logs')}</a>,
    icon: <i className="fa fa-clipboard" />,
  } : null,
  {
    key: 'profile',
    label: I18n.t('administration.navigation.profile'),
    icon: <UserOutlined className={styles.siderIcon} />,
    children: [
      {
        label: (
          <Link href="/admin/profile/details">
            {I18n.t('administration.navigation.profile_details')}
          </Link>),
        key: 'profileDetails',
      },
      {
        label: (
          <Link href="/admin/profile/change_password">
            {I18n.t('administration.navigation.change_password')}
          </Link>),
        key: 'changePassword',
      },
    ],
  },
].filter(Boolean)

const getSelected = (): string => {
  if (location.href.match(/\/admin(\/)(profile)(\/)(details)/)) {
    return 'profileDetails'
  }
  if (location.href.match(/\/admin(\/)(profile)(\/)(change_password)/)) {
    return 'changePassword'
  }
  if (location.href.match(/\/administration(\/)(norms)/)) {
    return 'norms'
  }

  if (location.href.match(/\/administration(\/)(dshboards)/)) {
    return 'dashboards'
  }

  if (location.href.match(/\/administration(\/)(dimensions)/)) {
    return 'dimensions'
  }

  if (location.href.match(/\/administration(\/)(users)/)) {
    return 'users'
  }

  if (location.href.match(/\/administration(\/)(assessments)/)) {
    return 'assessments'
  }

  if (location.href.match(/\/administration(\/)(libraries)/)) {
    return 'libraries'
  }
  if (location.href.match(/\/administration(\/)(communications)/)) {
    return 'communicationCenter'
  }
  if (location.href.match(/\/administration(\/)(reports)/)) {
    return 'reports'
  }
  if (location.href.match(/\/administration(\/)(report_approvals)/)) {
    return 'reportApprovals'
  }

  if (location.href.match(/\/administration(\/)(campaign_templates)/)) {
    return 'campaignTemplates'
  }

  if (location.href.match(/\/administration(\/)(audit_logs)/)) {
    return 'auditLogs'
  }

  if (location.href.match(/\/administration(\/)templates\/(questions|blocks)/)) {
    return 'questionCenter'
  }

  if (location.href.match(/\/(assessors)(\/)(assessment_centers)/)) {
    return 'assessorWorkshops'
  }

  if (location.href.match(/\/(assessors)/)) {
    return 'assessorDashboard'
  }

  if (location.href.match(/\/administration(\/)(user_availabilities)/)) {
    return 'userAvailability'
  }

  return 'clients'
}


export const MainMenuComponent:FC<PropsFromRedux> = ({
  currentUser, hasSubmenu, openSubmenu, collapsed, triggerCollapse, links,
  showSubmenu,
}) => {
  const isMobile = useMedia({
    maxWidth: 1024,
  })

  const onSelect = ({ key }): ReturnType<typeof openSubmenu> | void => {
    if (key === 'showSubmenu') {
      return openSubmenu()
    }
  }

  const menu = (
    <>
      <UserMenu currentUser={currentUser} collapsed={collapsed} />
      <Menu
        theme="light"
        selectedKeys={[getSelected()]}
        mode="inline"
        items={menuItems(links, hasSubmenu)}
        onClick={onSelect}
      />
    </>
  )

  const closeMenu = () => {
    triggerCollapse()
    if (hasSubmenu) openSubmenu()
  }

  return isMobile
    ? (
      <>
        <div
          onClick={() => triggerCollapse()}
          className={cs(styles.trigger, styles.mobile, { [styles.open]: !collapsed })}
        >
          {collapsed ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
        </div>
        <Drawer
          closable={false}
          bodyStyle={{ padding: 0 }}
          placement="left"
          width="220"
          open={!showSubmenu && !collapsed}
          onClose={() => closeMenu()}
        >
          {menu}
        </Drawer>
      </>
    )
    : (
      <Layout.Sider
        id="top_sidebar"
        className={styles.menu}
        width={220}
        theme="light"
        collapsed={collapsed}
        collapsedWidth={55}
        onCollapse={() => triggerCollapse()}
      >
        <div onClick={() => triggerCollapse()} className={styles.trigger}>
          {collapsed ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
        </div>
        {menu}
      </Layout.Sider>
    )
}

export const UserMenu = ({ currentUser, collapsed }) => (
  <>
    <div className={cs(styles.logo, { [styles.small]: collapsed })}>
      <img src={collapsed ? logoSmall : logo} />
    </div>
    <a href="/admin/profile/details">
      <div className={styles.userName}>
        {collapsed ? (
          <Avatar alt={currentUser.name}>
            {shortify(currentUser.name)}
          </Avatar>
        ) : currentUser.name}
      </div>
    </a>
    <div className={styles.role}>{currentUser.roleTitle}</div>
  </>
)

// TODO: remove portals after implementing all pages in react
export const Portal = ({ Component, container, ...props }) => {
  const [innerHtmlEmptied, setInnerHtmlEmptied] = useState(false)
  useEffect(() => {
    if (!innerHtmlEmptied) {
      container.innerHTML = ''
      setInnerHtmlEmptied(true)
    }
  }, [innerHtmlEmptied])
  if (!innerHtmlEmptied) return null
  return createPortal(<Component {...props} />, container)
}

export const MainMenu = connecter(MainMenuComponent)

export const PortalMenu = () => {
  const node = document.getElementById('main_menu')
  return <Portal Component={MainMenu} container={node} />
}
