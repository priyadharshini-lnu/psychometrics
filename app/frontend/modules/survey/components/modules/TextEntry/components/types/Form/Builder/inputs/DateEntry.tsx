import React from 'react'
import {
  Button, DatePicker, Dropdown, Menu, Space,
} from 'antd'
import { MenuProps } from 'antd/lib/menu'
import { DownOutlined } from '@ant-design/icons'

import { DateFormat } from 'modules/survey/interfaces/questions/TextEntry'

import { DATE_FORMAT_OPTIONS } from 'modules/survey/components/modules/TextEntry/constant'

const { I18n } = window

interface Props {
  dateFormat: DateFormat
  onDateFormatChange(value: string): void
}

export const DateEntry: React.FC<Props> = ({
  dateFormat,
  onDateFormatChange,
}) => {
  const handleMenuItemClick: MenuProps['onClick'] = ({ key, keyPath }) => {
    if (keyPath.includes('date-format')) {
      onDateFormatChange(`${key}`)
    }
  }

  // Can contain list of all active options in future too
  const allSelectedOptions: string[] = [dateFormat]

  const DateEntryMenu = (
    <Menu
      onClick={handleMenuItemClick}
      triggerSubMenuAction="click"
      selectedKeys={allSelectedOptions}
    >
      <Menu.SubMenu
        key="date-format"
        title={I18n.t(
          'administration.survey_builder.property_panel.date_format',
        )}
      >
        {DATE_FORMAT_OPTIONS.map(dateFormatOption => (
          <Menu.Item
            key={dateFormatOption.value}
            title={dateFormatOption.label}
          >
            {dateFormatOption.label}
          </Menu.Item>
        ))}
      </Menu.SubMenu>
    </Menu>
  )

  const pickerMode = DATE_FORMAT_OPTIONS.find(
    dateFormatOption => dateFormatOption.value === dateFormat,
  )?.picker ?? 'date'

  return (
    <Space direction="horizontal">
      <DatePicker
        size="middle"
        format={dateFormat}
        picker={pickerMode}
      />
      <Dropdown overlay={DateEntryMenu} trigger={['click']}>
        <Button type="link">
          {I18n.t('administration.survey_builder.builder_area.options')}
          <DownOutlined />
        </Button>
      </Dropdown>
    </Space>
  )
}
