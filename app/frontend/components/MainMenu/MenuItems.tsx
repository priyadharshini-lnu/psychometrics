import {
  ArrowRightOutlined, CalendarOutlined, MonitorOutlined, UserOutlined,
} from '@ant-design/icons'
import { Link as RouterLink } from 'react-router-dom'

const { I18n } = window

type Permissions = {
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
    userAvailability?: string
}

export const getSelected = (): string => {
  if (location.href.match(/\/admin(\/)(profile)(\/)(details)/)) {
    return 'profileDetails'
  }
  if (location.href.match(/\/admin(\/)(profile)(\/)(change_password)/)) {
    return 'changePassword'
  }
  if (location.href.match(/\/administration(\/)(norms)/)) {
    return 'norms'
  }

  if (location.href.match(/\/admin(\/)(dashboards)/)) {
    return 'dashboards'
  }

  if (location.href.match(/\/administration(\/)(dimensions)/)) {
    return 'dimensions'
  }

  if (location.href.match(/\/admin(\/)(users)/)) {
    return 'users'
  }

  if (location.href.match(/\/administration(\/)(assessments)/)) {
    return 'assessments'
  }

  if (location.href.match(/\/admin(\/)(assessments)/)) {
    return 'assessments'
  }

  if (location.href.match(/\/administration(\/)(libraries)/)) {
    return 'libraries'
  }
  if (location.href.match(/\/administration(\/)(communications)/)) {
    return 'communicationCenter'
  }
  if (location.href.match(/\/admin\/(reports|report_families)/)) {
    return 'reports'
  }

  if (location.href.match(/\/admin(\/)(report_approvals)/)) {
    return 'reportApprovals'
  }

  if (location.href.match(/\/admin(\/)(campaign_templates)/)) {
    return 'campaignTemplates'
  }

  if (location.href.match(/\/admin(\/)(audit_logs)/)) {
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

  if (location.href.match(/\/admin(\/)(user_availabilities)/)) {
    return 'userAvailability'
  }

  return 'clients'
}

// TODO: When all pages are implemented in single react, use this component instead of anchor tag
const Link = ({ href, children }) => {
  const isThreesixty = location.href.match(/\/(threesixty_campaigns)/)
  const isAssessmentBuilder = (location.href.match(/\/administration(\/)(assessments)/))
  const isDashboard = (location.href.match(/\/administration(\/)(new_campaigns)/))
  const selected = getSelected()
  const isAllowed = () => {
    const allowedPages = [
      'profileDetails', 'auditLogs',
      'changePassword', 'clients',
      'users', 'userAvailability',
      'reports', 'assessments', 'reportApprovals', 'campaignTemplates']
    return !allowedPages.includes(selected)
  }
  if (isThreesixty || isAssessmentBuilder || isDashboard || isAllowed()) {
    return <a href={href}>{children}</a>
  }
  return <RouterLink to={href}>{children}</RouterLink>
}

export const menuItems = (permissions: Permissions, hasSubmenu: boolean) => [
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
    <Link href={permissions.clients}>
      {I18n.t('administration.navigation.clients')}
    </Link>,
    icon: <i className="fa fa-briefcase" />,
  } : null,
  permissions.users ? {
    key: 'users',
    label:
    <Link href={permissions.users}>
      {I18n.t('administration.navigation.users')}
    </Link>,
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
    <Link href={permissions.assessments}>
      {I18n.t('administration.navigation.assessments')}
    </Link>,
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
    label: <Link href={permissions.reports}>{I18n.t('administration.navigation.reports')}</Link>,
    icon: <i className="fa fa-pie-chart" />,
  } : null,
  permissions.reportApprovals ? {
    key: 'reportApprovals',
    label: <Link href={permissions.reportApprovals}>{I18n.t('administration.navigation.report_approvals')}</Link>,
    icon: <i className="fa fa-check" />,
  } : null,
  permissions.campaignTemplates ? {
    key: 'campaignTemplates',
    label: <Link href={permissions.campaignTemplates}>{I18n.t('administration.navigation.campaign_templates')}</Link>,
    icon: <i className="fa fa-gear" />,
  } : null,
  {
    key: 'userAvailability',
    label: <Link href={permissions.userAvailability}>{I18n.t('administration.navigation.availability')}</Link>,
    icon: <i className="fa fa-calendar" />,
  },
  permissions.auditLogs ? {
    key: 'auditLogs',
    label: <Link href={permissions.auditLogs}>{I18n.t('administration.navigation.audit_logs')}</Link>,
    icon: <i className="fa fa-clipboard" />,
  } : null,
  {
    key: 'profile',
    label: I18n.t('administration.navigation.profile'),
    icon: <UserOutlined />,
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
