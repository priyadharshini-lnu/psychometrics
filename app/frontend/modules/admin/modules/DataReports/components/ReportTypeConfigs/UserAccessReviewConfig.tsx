import React from 'react'
import { ReportTypeConfigProps, ReportTypeDefinition } from './types'

const UserAccessReviewConfig: React.FC<ReportTypeConfigProps> = () => null

export const userAccessReviewDefinition: ReportTypeDefinition = {
  key: 'user_access_review',
  component: UserAccessReviewConfig,
  processConfiguration: data => ({
    ...data,
    configuration: JSON.stringify({}),
  }),
  uiRules: {
    defaultScope: 'global',
    scopeOptions: ['global'],
  },
}

export default UserAccessReviewConfig
