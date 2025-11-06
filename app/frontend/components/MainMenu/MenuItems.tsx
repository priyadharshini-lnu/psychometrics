import { Link as RouterLink } from 'react-router-dom'
import {
  ArrowRightOutlined,
  MonitorOutlined,
  ContainerOutlined,
  BuildOutlined,
  DatabaseOutlined,
  FileImageOutlined,
  QuestionCircleOutlined,
  AuditOutlined,
  ProfileOutlined,
  FileProtectOutlined,
  MailOutlined,
  FundProjectionScreenOutlined,
  SolutionOutlined,
  TeamOutlined,
  ClusterOutlined,
  ScheduleOutlined,
  DashboardOutlined,
  LayoutOutlined,
  BookOutlined,
  RobotOutlined,
  CompassOutlined,
  GlobalOutlined,
} from '@ant-design/icons'
import { camelizeKeys } from '~/utils/object'

const { I18n } = window

type Permissions = {
  dashboards?: string;
  assessorDashboard?: string;
  assessorWorkshops?: string;
  clients?: string;
  skillsTaxonomy?: string;
  developmentActions?: string;
  users?: string;
  norms?: string;
  dimensions?: string;
  assessments?: string;
  questionCenter?: string;
  libraries?: string;
  communicationCenter?: string;
  reports?: string;
  reportApprovals?: string;
  campaignTemplates?: string;
  auditLogs?: string;
  userAvailability?: string;
  dataReports?: string;
  aiAssistants?: string;
};

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

  if (location.href.match(/\/admin(\/)(norms)/)) {
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

  if (
    location.href.match(/\/administration(\/)templates\/(questions|blocks)/)
  ) {
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

  if (location.href.match(/\/admin(\/)(data_reports)/)) {
    return 'dataReports'
  }

  if (location.href.match(/\/admin(\/)(skills_taxonomy)/)) {
    return 'skillsTaxonomy'
  }

  if (location.href.match(/\/admin(\/)(development_actions)/)) {
    return 'developmentActions'
  }

  if (location.href.match(/\/admin(\/)(ai_assistants)/)) {
    return 'aiAssistants'
  }

  return 'clients'
}

// TODO: When all pages are implemented in single react, use this component instead of anchor tag
const Link = ({
  href,
  children,
}) => {
  const isThreesixty = location.href.match(/\/(threesixty_campaigns)/)
  const isAssessmentBuilder = location.href.match(
    /\/administration(\/)(assessments)/,
  )
  const isDashboard = location.href.match(
    /\/administration(\/)(new_campaigns)/,
  )
  const selected = getSelected()
  const isAllowed = () => {
    const allowedPages = [
      'profileDetails',
      'auditLogs',
      'changePassword',
      'clients',
      'users',
      'userAvailability',
      'reports',
      'assessments',
      'reportApprovals',
      'campaignTemplates',
      'skillsTaxonomy',
      'developmentActions',
      'aiAssistants',
    ]
    return !allowedPages.includes(selected)
  }
  if (isThreesixty || isAssessmentBuilder || isDashboard || isAllowed()) {
    return (
      <a tabIndex={-1} href={href}>
        {children}
      </a>
    )
  }
  return (
    <RouterLink tabIndex={-1} to={href}>
      {children}
    </RouterLink>
  )
}

export const menuItems = (
  permissions: Permissions,
  hasSubmenu: boolean,
  featureFlags?: Record<string, boolean>,
) => {
  const idpEnabled = camelizeKeys(featureFlags ?? {})?.idpEnabled
  const skillRaterEnabled = camelizeKeys(featureFlags ?? {})?.skillRaterEnabled

  const isConfigurationEnabled = permissions.skillsTaxonomy
    || permissions.developmentActions || permissions.aiAssistants || permissions.campaignTemplates
  const isContentEnabled = permissions.assessments
    || permissions.norms || permissions.dimensions || permissions.reports
    || permissions.questionCenter || permissions.libraries

  return [
    hasSubmenu
      ? {
        key: 'showSubmenu',
        label: I18n.t('administration.navigation.show_submenu'),
        icon: <ArrowRightOutlined />,
      }
      : null,
    permissions.dashboards
      ? {
        key: 'dashboards',
        label: (
          <a tabIndex={-1} href={permissions.dashboards}>
            {I18n.t('administration.navigation.dashboard')}
          </a>
        ),
        icon: <DashboardOutlined aria-hidden="true" />,
      }
      : null,
    permissions.assessorDashboard
      ? {
        key: 'assessorDashboard',
        label: (
          <a tabIndex={-1} href={permissions.assessorDashboard}>
            {I18n.t('administration.navigation.assessor_dashboard')}
          </a>
        ),
        icon: <LayoutOutlined aria-hidden="true" />,
      }
      : null,
    permissions.assessorWorkshops
      ? {
        key: 'assessorWorkshops',
        label: (
          <a tabIndex={-1} href={permissions.assessorWorkshops}>
            {I18n.t('administration.navigation.assessor_workshops')}
          </a>
        ),
        icon: <ScheduleOutlined aria-hidden="true" />,
      }
      : null,
    permissions.clients
      ? {
        key: 'clients',
        label: (
          <Link href={permissions.clients}>
            {I18n.t('administration.navigation.clients')}
          </Link>
        ),
        icon: <GlobalOutlined aria-hidden="true" />,
      }
      : null,
    permissions.users
      ? {
        key: 'users',
        label: (
          <Link href={permissions.users}>
            {I18n.t('administration.navigation.users')}
          </Link>
        ),
        icon: <TeamOutlined aria-hidden="true" />,
      }
      : null,
    isContentEnabled ? ({
      key: 'content',
      label: I18n.t('administration.navigation.content'),
      icon: <ContainerOutlined aria-hidden="true" />,
      children: [
        permissions.assessments
          ? {
            key: 'assessments',
            label: (
              <Link href={permissions.assessments}>
                {I18n.t('administration.navigation.assessments')}
              </Link>
            ),
            icon: <SolutionOutlined aria-hidden="true" />,
          }
          : null,
        permissions.norms
          ? {
            key: 'norms',
            label: (
              <a tabIndex={-1} href={permissions.norms}>
                {I18n.t('administration.navigation.norms')}
              </a>
            ),
            icon: <MonitorOutlined aria-hidden="true" />,
          }
          : null,
        permissions.dimensions
          ? {
            key: 'dimensions',
            label: (
              <a tabIndex={-1} href={permissions.dimensions}>
                {I18n.t('administration.navigation.dimensions')}
              </a>
            ),
            icon: <ClusterOutlined aria-hidden="true" />,
          }
          : null,
        permissions.reports
          ? {
            key: 'reports',
            label: (
              <Link href={permissions.reports}>
                {I18n.t('administration.navigation.reports')}
              </Link>
            ),
            icon: <FundProjectionScreenOutlined aria-hidden="true" />,
          }
          : null,
        permissions.questionCenter
          ? {
            key: 'questionCenter',
            label: (
              <a tabIndex={-1} href={permissions.questionCenter}>
                {I18n.t('administration.navigation.question_center')}
              </a>
            ),
            icon: (
              <QuestionCircleOutlined aria-hidden="true" />
            ),
          }
          : null,
        permissions.libraries
          ? {
            key: 'libraries',
            label: (
              <a tabIndex={-1} href={permissions.libraries}>
                {I18n.t('administration.navigation.libraries')}
              </a>
            ),
            icon: <FileImageOutlined aria-hidden="true" />,
          }
          : null,
      ].filter(Boolean),
    }) : null,
    isConfigurationEnabled ? ({
      key: 'configuration',
      label: I18n.t('administration.navigation.configuration'),
      icon: <BuildOutlined aria-hidden="true" />,
      children: [
        permissions.skillsTaxonomy && (idpEnabled || skillRaterEnabled)
          ? {
            key: 'skillsTaxonomy',
            label: (
              <Link href={permissions.skillsTaxonomy}>
                {I18n.t('administration.navigation.skills_taxonomy')}
              </Link>
            ),
            icon: <BookOutlined aria-hidden="true" />,
          }
          : null,
        permissions.developmentActions && idpEnabled
          ? {
            key: 'developmentActions',
            label: (
              <Link href={permissions.developmentActions}>
                {I18n.t('administration.navigation.development_actions')}
              </Link>
            ),
            icon: <CompassOutlined aria-hidden="true" />,
          }
          : null,
        permissions.aiAssistants
          ? {
            key: 'aiAssistants',
            label: (
              <Link href={permissions.aiAssistants}>
                {I18n.t('administration.navigation.ai_assistants')}
              </Link>
            ),
            icon: <RobotOutlined aria-hidden="true" />,
          }
          : null,
        permissions.campaignTemplates
          ? {
            key: 'campaignTemplates',
            label: (
              <Link href={permissions.campaignTemplates}>
                {I18n.t('administration.navigation.campaign_templates')}
              </Link>
            ),
            icon: <ProfileOutlined aria-hidden="true" />,
          }
          : null,
      ].filter(Boolean),
    }) : null,
    permissions.communicationCenter
      ? {
        key: 'communicationCenter',
        label: (
          <a tabIndex={-1} href={permissions.communicationCenter}>
            {I18n.t('administration.navigation.communication_center')}
          </a>
        ),
        icon: <MailOutlined aria-hidden="true" />,
      }
      : null,
    permissions.reportApprovals
      ? {
        key: 'reportApprovals',
        label: (
          <Link href={permissions.reportApprovals}>
            {I18n.t('administration.navigation.report_approvals')}
          </Link>
        ),
        icon: <FileProtectOutlined aria-hidden="true" />,
      }
      : null,
    permissions.auditLogs
      ? {
        key: 'auditLogs',
        label: (
          <Link href={permissions.auditLogs}>
            {I18n.t('administration.navigation.audit_logs')}
          </Link>
        ),
        icon: <AuditOutlined aria-hidden="true" />,
      }
      : null,
    permissions.dataReports
      ? {
        key: 'dataReports',
        label: (
          <a href={permissions.dataReports}>
            {I18n.t('administration.navigation.data_reports')}
          </a>
        ),
        icon: <DatabaseOutlined aria-hidden="true" />,
      }
      : null,
  ].filter(Boolean)
}
