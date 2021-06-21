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

  const DateEntryMenu = (
    <Menu onClick={handleMenuItemClick} triggerSubMenuAction="click">
      <Menu.SubMenu
        key="date-format"
        title={I18n.t('administration.survey_builder.property_panel.date_format')}
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

  return (
    <Space direction="horizontal">
      <DatePicker format={dateFormat} />
      <Dropdown overlay={DateEntryMenu} trigger={['click']}>
        <Button type="link">
          {I18n.t('administration.survey_builder.builder_area.options')}
          <DownOutlined />
        </Button>
      </Dropdown>
    </Space>
  )
}
