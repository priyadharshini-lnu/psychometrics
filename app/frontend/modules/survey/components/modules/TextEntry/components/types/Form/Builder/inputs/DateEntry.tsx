import React from 'react'
import {
  Button, DatePicker, Dropdown, Space,
} from 'antd'
import { MenuProps } from 'antd/lib/menu'
import { DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

import { DateFormat } from '~/modules/survey/interfaces/questions/TextEntry'
import { getMenuItems } from '~/utils/array'

import { DATE_FORMAT_OPTIONS } from '~/modules/survey/components/modules/TextEntry/constant'

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

  const pickerMode = DATE_FORMAT_OPTIONS.find(
    dateFormatOption => dateFormatOption.value === dateFormat,
  )?.picker ?? 'date'

  return (
    <Space orientation="horizontal">
      <DatePicker
        size="middle"
        format={dateFormat}
        picker={pickerMode}
      />
      <Dropdown
        menu={{
          items: [{
            key: 'date-format',
            label: I18n.t(
              'administration.survey_builder.property_panel.date_format',
            ),
            children: getMenuItems(DATE_FORMAT_OPTIONS, 'label', 'value', 'label'),
          }],
          onClick: handleMenuItemClick,
          triggerSubMenuAction: 'click',
          selectedKeys: allSelectedOptions,
        }}
        trigger={['click']}
      >
        <Button type="link">
          {I18n.t('administration.survey_builder.builder_area.options')}
          <DownOutlined />
        </Button>
      </Dropdown>
    </Space>
  )
}
