import { Input, Typography } from 'antd'
import { FC } from 'react'

import { ValidationFieldsProps } from '../interfaces'

const MaxLength: FC<ValidationFieldsProps> = ({
  model,
  changeValidationArg,
}) => (
  <div className="mt-2">
    <div className="pb-2">
      <Typography.Text className="pb-2">Enter maximum length</Typography.Text>
    </div>
    <Input
      name="maxLength"
      className="w-100"
      type="number"
      min={0}
      step={1}
      onChange={changeValidationArg}
      value={model?.validation?.args?.maxLength ?? ''}
    />
  </div>
)

export default MaxLength
