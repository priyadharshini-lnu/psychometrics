import React from 'react'
import { Select as BaseSelect, Dropdown, Button } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import { BuilderModel } from 'modules/survey/interfaces/questions/TextEntry'
import styles from '../../../FormStyle.scss'
import OptionList from './OptionList'

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

  return (
    <div className={styles.selectContainer}>
      <BaseSelect showArrow className={styles.formSelect} mode={multi ? MULTIPLE : undefined}>
        {optionList?.map((option: string, i: number) => (<Option key={i} value={option}>{option}</Option>))}
      </BaseSelect>
      <Dropdown
        className={styles.dropdown}
        overlay={(<OptionList type={type} model={model} index={index} />)}
        trigger={['click']}
      >
        <Button type="link">
          <span>Options</span>
          <DownOutlined />
        </Button>
      </Dropdown>
    </div>
  )
}
export default Select
