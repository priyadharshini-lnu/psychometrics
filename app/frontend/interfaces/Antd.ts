import { MenuProps, GetProps } from 'antd'
import type { DatePicker } from 'antd'

export type MenuItem = Required<MenuProps>['items'][number]

export type RangePickerProps = GetProps<typeof DatePicker.RangePicker>
export type RangeValueType = RangePickerProps['value']

export type { ButtonColorType } from 'antd/es/button/buttonHelpers'
