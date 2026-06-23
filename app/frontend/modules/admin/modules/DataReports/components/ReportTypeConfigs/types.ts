import React from 'react'
import { FormInstance } from 'antd'

export type ScopeType = 'client' | 'global'

export interface ReportTypeConfigProps {
  form: FormInstance
  ownerId: string | null
  scope: ScopeType
  parsedConfiguration: Record<string, unknown> | null
}

export interface ReportTypeDefinition {
  key: string
  component: React.FC<ReportTypeConfigProps>
  processConfiguration: (data: Record<string, unknown>) => Record<string, unknown>
  parseConfiguration?: (config: Record<string, unknown>) => Record<string, unknown>
  uiRules?: {
    defaultScope?: ScopeType
    scopeOptions?: ScopeType[]
    hideOwnerWhenGlobal?: boolean
  }
}
