import { FC } from 'react'
import { Select, Typography } from 'antd'

const { Option } = Select

export interface Props {
  value: string
  changeHandler: (value: string) => void
  options: string[]
  label?: string
}

export const GraphPropertyDropdown: FC<Props> = ({
  value,
  changeHandler,
  options,
  label,
}) => (
  <>
    <Typography.Text>{label}</Typography.Text>
    <Select
      value={value}
      onChange={changeHandler}
      getPopupContainer={(triggerNode: HTMLElement) => triggerNode.parentNode as HTMLElement}
      className="w-100"
    >
      {options.map(option => (
        <Option key={option} value={option}>
          {option}
        </Option>
      ))}
    </Select>
  </>
)
