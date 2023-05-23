import { FC } from 'react'
import { Typography, Input } from 'antd'

import { ValidationFieldsProps } from '../interfaces'

const MinLength: FC<ValidationFieldsProps> = ({
  model,
  changeValidationArg,
}) => (
  <div className="mt-2">
    <div className="pb-2">
      <Typography.Text className="pb-2">Enter minimum length</Typography.Text>
    </div>
    <Input
      name="minLength"
      className="w-100"
      type="number"
      min={0}
      step={1}
      onChange={changeValidationArg}
      value={model?.validation?.args?.minLength ?? ''}
    />
  </div>
)

export default MinLength
