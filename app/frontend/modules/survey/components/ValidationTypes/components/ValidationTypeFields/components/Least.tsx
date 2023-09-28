import { FC } from 'react'
import { Input, Typography } from 'antd'

import { ValidationFieldsProps } from '../interfaces'

const Least: FC<ValidationFieldsProps> = ({
  model,
  changeValidationArg,
}) => (
  <div className="mt-2">
    <div className="pb-2">
      <Typography.Text className="pb-2">At least</Typography.Text>
    </div>
    <Input
      name="minValue"
      className="w-100"
      type="text"
      onChange={changeValidationArg}
      value={model?.validation?.args?.minValue ?? ''}
    />
  </div>
)

export default Least
