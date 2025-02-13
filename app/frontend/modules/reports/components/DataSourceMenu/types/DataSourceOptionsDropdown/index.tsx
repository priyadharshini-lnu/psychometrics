import Select, {
  components, Props, OptionProps,
} from 'react-select'
import { Tooltip } from 'antd'
import styles from './styles.less'

const DataSourceOptionsDropdown = (props:Props) => {
  const {
    isMulti,
  } = props

  const CustomOption = (props:OptionProps) => {
    const { children, ...rest } = props
    return (
      <components.Option {...rest}>
        <div>
          {children}
        </div>
      </components.Option>
    )
  }

  const formatOptionLabel = ({ label }) => (
    <Tooltip title={label}>
      <div className={styles['option-label']}>
        {label}
      </div>
    </Tooltip>
  )

  return (
    <Select
      {...props}
      isClearable={false}
      autoFocus={false}
      isMulti={isMulti}
      formatOptionLabel={formatOptionLabel}
      components={{ Option: CustomOption }}
      placeholder={isMulti ? 'Choose Factor' : 'Choose Factors'}
    />
  )
}

export default DataSourceOptionsDropdown
