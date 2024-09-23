import _ from 'lodash'
import { Select } from 'antd'

import styles from '../../styles.less'

const DropdownPreview = (props) => {
  const changeAnswer = (value) => {
    const { model } = props
    model.result.answer(value)
  }

  const {
    model: { result }, readOnly, factors,
  } = props
  const value = _.get(result, ['answers'])

  return (
    <div>
      <Select
        className={styles.dropdown}
        mode="multiple"
        listItemHeight={0}
        showSearch
        disabled={readOnly}
        optionFilterProp="label"
        onChange={changeAnswer}
        value={value}
        options={_.map(factors, factor => (
          { label: factor.name, value: factor.id }
        ))}
      />
    </div>
  )
}

export default DropdownPreview
