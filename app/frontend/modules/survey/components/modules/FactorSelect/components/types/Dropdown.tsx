import _ from 'lodash'
import { Select } from 'antd'
import { FC } from 'react'
import { FactorModel } from '~/modules/survey/interfaces/questions/FactorSelect'

interface Props {
  factors: FactorModel[]
}

const Dropdown: FC<Props> = ({ factors }) => (
  <div>
    <Select
      className="w-100"
      mode="multiple"
      showSearch
      optionFilterProp="label"
      options={_.map(factors, (factor, id) => (
        { label: factor.name, value: id }
      ))}
    />
  </div>
)

export default Dropdown
