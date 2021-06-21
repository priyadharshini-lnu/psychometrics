import React, { FC } from 'react'
import { DatePicker } from 'antd'

import { BuilderModel } from 'modules/survey/interfaces/questions/TextEntry'

import { DATE_FORMAT_OPTIONS } from 'modules/survey/components/modules/TextEntry/constant'

interface Props {
  format: BuilderModel['props']['dateFormat']
}

const DateEntry: FC<Props> = ({ format }) => (
  <DatePicker size="middle" format={format || DATE_FORMAT_OPTIONS[0].value} />
)

export default DateEntry
