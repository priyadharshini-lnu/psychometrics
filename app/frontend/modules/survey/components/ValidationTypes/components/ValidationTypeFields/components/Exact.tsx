import { FC } from 'react'
import { Input, Typography } from 'antd'

import { ValidationFieldsProps } from '../interfaces'

const Exact: FC<ValidationFieldsProps> = ({
  model,
  changeValidationArg,
}) => (
  <div className="mt-2">
    <div className="pb-2">
      <Typography.Text className="pb-2">Exactly</Typography.Text>
    </div>
    <Input
      name="exactValue"
      className="w-100"
      type="text"
      onChange={changeValidationArg}
      value={model?.validation?.args?.exactValue ?? ''}
    />
  </div>
)

export default Exact
