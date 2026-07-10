import React from 'react'
import { ReportTypeConfigProps, ReportTypeDefinition } from './types'
import ProjectSearchField from './ProjectSearchField'

const UserReportsConfig: React.FC<ReportTypeConfigProps> = ({
  parsedConfiguration,
  scope,
  ownerId,
}) => (
  <ProjectSearchField
    scope={scope}
    ownerId={ownerId}
    parsedConfiguration={parsedConfiguration}
  />
)

export const userReportsDefinition: ReportTypeDefinition = {
  key: 'user_reports_export',
  component: UserReportsConfig,
  processConfiguration: (data) => {
    const projectIds = data.projectIds as string[] || []
    return {
      ...data,
      configuration: JSON.stringify({ project_ids: projectIds.map(id => parseInt(id, 10)) }),
      projectIds: undefined,
    }
  },
  uiRules: {
    defaultScope: 'client',
    scopeOptions: ['client'],
  },
}

export default UserReportsConfig
