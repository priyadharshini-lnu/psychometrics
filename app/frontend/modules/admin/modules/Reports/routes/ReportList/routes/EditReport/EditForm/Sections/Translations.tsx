import React from 'react'
import { Typography } from 'antd'
import { Report } from '~/modules/admin/modules/client/core/reports'

interface Props {
  report: Report
}

export const Translations: React.FC<Props> = () => (
  <Typography.Text type="secondary">Under development</Typography.Text>
)
