import { FC } from 'react'
import { Input, Typography } from 'antd'

import { ValidationFieldsProps } from '../interfaces'

const Range: FC<ValidationFieldsProps> = ({
  model,
  changeValidationArg,
}) => (
  <>
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
    <div className="mt-2">
      <Typography.Text className="pb-2">No more than</Typography.Text>
      <Input
        name="maxValue"
        className="w-100"
        type="text"
        onChange={changeValidationArg}
        value={model?.validation?.args?.maxValue ?? ''}
      />
    </div>
  </>
)

export default Range
