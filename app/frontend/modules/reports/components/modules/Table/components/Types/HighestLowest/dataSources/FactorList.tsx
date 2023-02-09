import { FC } from 'react'
import {
  Typography, Select,
} from 'antd'

import { PropertiesModel } from '~/modules/reports/interfaces/tables/Gap'

import AppStore from '~/modules/reports/store/AppStore'

interface Props {
  assessmentId: PropertiesModel['assessment_id']
  value: PropertiesModel['props']['factorIds']
  onChange(key: string, value: unknown): void
}

export const FactorsList: FC<Props> = ({ assessmentId, value, onChange }) => {
  const dimensionId = AppStore.getAssessmentById(assessmentId)?.dimensionId ?? ''
  const allFactors = AppStore.factors?.[dimensionId] ?? []
  const factorOptions = allFactors.map(factor => ({
    value: factor.id,
    label: factor.name,
  }))

  return (
    <div>
      <Typography.Text>Factor list</Typography.Text>
      <Select
        size="small"
        mode="multiple"
        placeholder="All factors"
        maxTagCount={2}
        className="w-100"
        style={{ maxWidth: 'calc(220px - 30px)' }}
        options={factorOptions}
        value={value}
        onChange={value => onChange('factorIds', value)}
      />
    </div>
  )
}
