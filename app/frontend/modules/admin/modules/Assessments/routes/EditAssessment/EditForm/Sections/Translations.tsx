import React from 'react'
import { Typography } from 'antd'
import { Assessment } from '~/modules/admin/modules/client/core/assessments'

interface Props {
  assessment: Assessment
}

export const Translations: React.FC<Props> = () => (
  <Typography.Text type="secondary">Under development</Typography.Text>
)
