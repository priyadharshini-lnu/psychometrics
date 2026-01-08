import React, { useState } from 'react'
import { Select as BaseSelect, Dropdown, Button } from 'antd'
import { DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { BuilderModel } from '~/modules/survey/interfaces/questions/TextEntry'
import styles from '../../../FormStyle.less'
import { getOptionListMenuProps } from './getOptionListMenuProps'

const { Option } = BaseSelect

const MULTIPLE = 'multiple'

interface Props {
  model: BuilderModel
  index: number
  multi?: boolean
}

const Select: React.FC<Props> = ({
  model, model: { props: { formTypes } }, index, multi = false,
}) => {
  const type = formTypes[index]
  const { optionList } = type
  const [open, setOpen] = useState(false)

  return (
    <div className={styles.selectContainer}>
      <BaseSelect showArrow className={styles.formSelect} mode={multi ? MULTIPLE : undefined}>
        {Array.isArray(optionList)
          ? optionList?.map((option, i: number) => (
            <Option key={i} value={option}>
              {option}
            </Option>
          ))
          : Object.entries(optionList || {}).map(([key, value]) => (
            <Option key={key} value={key}>
              {value}
            </Option>
          ))
        }
      </BaseSelect>
      <Dropdown
        className={styles.dropdown}
        menu={
          getOptionListMenuProps({ type, model, index })}
        open={open}
      >
        <Button type="link" onClick={() => setOpen(!open)}>
          <span>{open ? 'Click To Close' : 'Options'}</span>
          <DownOutlined />
        </Button>
      </Dropdown>
    </div>
  )
}
export default Select
