import React, { useState, FC, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { MenuProps } from 'antd'
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
import { useHistory } from 'react-router-dom'
import logo from '~/modules/endUser/assets/images/lighthouseLogoTall.png'
import logoSmall from '~/modules/auth/media/TTE_Logo_Color_Monogram.png'
import styles from './MainMenu.less'
import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getCurrentUser } from '~/core/currentUser'
import { camelizeKeys } from '~/utils/object'
import { openSubmenu, triggerCollapse } from '~/modules/admin/core/ui/menu'
import { shortify } from '~/utils/string'

type MenuItem = Required<MenuProps>['items'][number];

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

const menuItems = (permissions: Permissions, hasSubmenu: boolean): MenuItem[] => [
  hasSubmenu ? {
    key: 'showSubmenu',
    label: I18n.t('administration.navigation.show_submenu'),
    icon: <ArrowRightOutlined />,
  } : null,
  permissions.dashboards ? {
    key: 'dashboards',
    label: I18n.t('administration.navigation.dashboard'),
    icon: <i className="fa fa-dashboard" />,
  } : null,
  permissions.assessorDashboard ? {
    key: 'assessorDashboard',
    label: I18n.t('administration.navigation.assessor_dashboard'),
    icon: <i className="fa fa-dashboard" />,
  } : null,
  permissions.assessorWorkshops ? {
    key: 'assessorWorkshops',
    label: I18n.t('administration.navigation.assessor_workshops'),
    icon: <CalendarOutlined />,
  } : null,
  permissions.clients ? {
    key: 'clients',
    label: I18n.t('administration.navigation.clients'),
    icon: <i className="fa fa-briefcase" />,
  } : null,
  permissions.users ? {
    key: 'users',
    label: I18n.t('administration.navigation.users'),
    icon: <i className="fa fa-users" />,
  } : null,
  permissions.norms ? {
    key: 'norms',
    label: I18n.t('administration.navigation.norms'),
    icon: <MonitorOutlined />,
  } : null,
  permissions.dimensions ? {
    key: 'dimensions',
    label: I18n.t('administration.navigation.dimensions'),
    icon: <i className="fa fa-file-text-o" />,
  } : null,
  permissions.assessments ? {
    key: 'assessments',
    label: I18n.t('administration.navigation.assessments'),
    icon: <i className="fa fa-universal-access" />,
  } : null,
  permissions.questionCenter ? {
    key: 'questionCenter',
    label: I18n.t('administration.navigation.question_center'),
    icon: <i className="fa fa-question-circle-o" />,
  } : null,
  permissions.libraries ? {
    key: 'libraries',
    label: I18n.t('administration.navigation.libraries'),
    icon: <i className="fa fa-file-image-o" />,
  } : null,
  permissions.communicationCenter ? {
    key: 'communicationCenter',
    label: I18n.t('administration.navigation.communication_center'),
    icon: <i className="fa fa-envelope-o" />,
  } : null,
  permissions.reports ? {
    key: 'reports',
    label: I18n.t('administration.navigation.reports'),
    icon: <i className="fa fa-pie-chart" />,
  } : null,
  permissions.reportApprovals ? {
    key: 'reportApprovals',
    label: I18n.t('administration.navigation.report_approvals'),
    icon: <i className="fa fa-check" />,
  } : null,
  permissions.campaignTemplates ? {
    key: 'campaignTemplates',
    label: I18n.t('administration.navigation.campaign_templates'),
    icon: <i className="fa fa-gear" />,
  } : null,
  {
    key: 'userAvailability',
    label: I18n.t('administration.navigation.availability'),
    icon: <i className="fa fa-calendar" />,
  },
  permissions.auditLogs ? {
    key: 'auditLogs',
    label: I18n.t('administration.navigation.audit_logs'),
    icon: <i className="fa fa-clipboard" />,
  } : null,
  {
    key: 'profile',
    label: I18n.t('campaign.dashboard_menu.profile'),
    icon: <UserOutlined className={styles.siderIcon} />,
    children: [
      { label: I18n.t('campaign.dashboard_menu.profile_details'), key: 'profileDetails' },
      { label: I18n.t('campaign.dashboard_menu.change_password'), key: 'changePassword' },
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
  const history = useHistory()
  const isMobile = useMedia({
    maxWidth: 1024,
  })

  const onSelect = ({ key }): ReturnType<typeof openSubmenu> | void => {
    if (key === 'showSubmenu') {
      return openSubmenu()
    }
    const link = links[key]
    if (location.href.match(/\/admin(\/)/) && link.match(/\/admin(\/)/)) {
      history.push(link)
    } else {
      location.href = link
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
          onClose={() => triggerCollapse()}
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
