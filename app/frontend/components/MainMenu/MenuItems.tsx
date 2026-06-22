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
  FormOutlined,
  TeamOutlined,
  ClusterOutlined,
  ScheduleOutlined,
  DashboardOutlined,
  LayoutOutlined,
  BookOutlined,
  RobotOutlined,
  CompassOutlined,
  GlobalOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ToolOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
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
  availability?: string;
  auditLogs?: string;
  userAvailability?: string;
  dataReports?: string;
  aiAssistants?: string;
  aiScoringApprovals?: string;
  settings?: string;
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

  if (location.href.match(/\/admin(\/)(dimensions)/)) {
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

  if (location.href.match(/\/admin(\/)(libraries)/)) {
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

  if (location.href.match(/\/admin(\/)(ai_scoring_approvals)/)) {
    return 'aiScoringApprovals'
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

  if (location.href.match(/\/admin(\/)templates\/(questions|blocks)/)) {
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

  if (location.href.match(/\/admin(\/)(settings)/)) {
    return 'settings'
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
      'settings',
      'questionCenter',
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

  const clientContext = window.PsyGlobalState?.clientContextData
  const clientsMenuLink = clientContext
    ? `${permissions.clients}/${clientContext.id}/projects`
    : permissions.clients
  const clientsMenuLabel = clientContext
    ? I18n.t('admin.projects')
    : I18n.t('admin.clients')

  const isConfigurationEnabled = permissions.skillsTaxonomy
    || permissions.developmentActions || permissions.aiAssistants || permissions.campaignTemplates
  const isContentEnabled = permissions.assessments
    || permissions.norms || permissions.dimensions || permissions.reports
    || permissions.questionCenter || permissions.libraries
  const isApprovalEnabled = permissions.reportApprovals || permissions.aiScoringApprovals

  return [
    hasSubmenu
      ? {
        key: 'showSubmenu',
        label: I18n.t('admin.show_submenu'),
        icon: <ArrowRightOutlined />,
      }
      : null,
    permissions.dashboards
      ? {
        key: 'dashboards',
        label: (
          <a tabIndex={-1} href={permissions.dashboards}>
            {I18n.t('admin.dashboard')}
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
            {I18n.t('admin.assessor_dashboard')}
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
            {I18n.t('admin.assessor_workshops')}
          </a>
        ),
        icon: <ScheduleOutlined aria-hidden="true" />,
      }
      : null,
    permissions.clients
      ? {
        key: 'clients',
        label: (
          <Link href={clientsMenuLink}>
            {clientsMenuLabel}
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
            {I18n.t('admin.users')}
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
                {I18n.t('admin.assessments')}
              </Link>
            ),
            icon: <FormOutlined aria-hidden="true" />,
          }
          : null,
        permissions.norms
          ? {
            key: 'norms',
            label: (
              <a tabIndex={-1} href={permissions.norms}>
                {I18n.t('admin.norms')}
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
                {I18n.t('admin.dimensions')}
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
                {I18n.t('admin.reports')}
              </Link>
            ),
            icon: <FundProjectionScreenOutlined aria-hidden="true" />,
          }
          : null,
        permissions.questionCenter
          ? {
            key: 'questionCenter',
            label: (
              <Link href={permissions.questionCenter}>
                {I18n.t('admin.question_center')}
              </Link>
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
                {I18n.t('admin.libraries')}
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
                {I18n.t('admin.skills_taxonomy')}
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
                {I18n.t('admin.development_actions')}
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
                {I18n.t('admin.ai_assistants')}
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
                {I18n.t('admin.campaign_templates')}
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
            {I18n.t('admin.communication_center')}
          </a>
        ),
        icon: <MailOutlined aria-hidden="true" />,
      }
      : null,
    isApprovalEnabled ? ({
      key: 'approvals',
      label: I18n.t('administration.navigation.approvals'),
      icon: <CheckCircleOutlined />,
      children: [
        permissions.reportApprovals
          ? {
            key: 'reportApprovals',
            label: (
              <Link href={permissions.reportApprovals}>
                {I18n.t('admin.report_approvals')}
              </Link>
            ),
            icon: <FileProtectOutlined aria-hidden="true" />,
          }
          : null,
        permissions.aiScoringApprovals
          ? {
            key: 'aiScoringApprovals',
            label: (
              <Link href={permissions.aiScoringApprovals}>
                {I18n.t('admin.ai_scoring_approvals')}
              </Link>
            ),
            icon: <RobotOutlined />,
          }
          : null,
      ],
    }) : null,
    permissions.userAvailability
      ? {
        key: 'userAvailability',
        label: (
          <Link href={permissions.userAvailability}>
            {I18n.t('admin.availability')}
          </Link>
        ),
        icon: <CalendarOutlined aria-hidden="true" />,
      }
      : null,
    permissions.auditLogs
      ? {
        key: 'auditLogs',
        label: (
          <Link href={permissions.auditLogs}>
            {I18n.t('admin.audit_logs')}
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
            {I18n.t('admin.data_reports')}
          </a>
        ),
        icon: <DatabaseOutlined aria-hidden="true" />,
      }
      : null,
    permissions.settings
      ? {
        key: 'settings',
        label: (
          <Link href={permissions.settings}>
            {I18n.t('admin.settings')}
          </Link>
        ),
        icon: <ToolOutlined />,
      }
      : null,
  ].filter(Boolean)
}
