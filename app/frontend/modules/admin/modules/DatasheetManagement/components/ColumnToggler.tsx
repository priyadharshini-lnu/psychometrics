/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState, FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import {
  Button, Checkbox, Dropdown, Menu, Tooltip, Typography,
} from 'antd'
import { TableOutlined, DownOutlined } from '@ant-design/icons'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'

import { COLUMN_ID_EMAIL } from 'modules/admin/modules/DatasheetManagement/constants'

import { RootState } from 'modules/admin/core/rootReducers'
import { get as getColumnDefinitions } from 'modules/admin/modules/DatasheetManagement/core/columnDefinitions'

import { toReadableString } from 'modules/admin/modules/DatasheetManagement/utils'

const { I18n } = window

const connector = connect((state: RootState) => ({
  columnDefinitions: getColumnDefinitions(state),
}))

type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps {
  visibleColumnsKeys: string[]
  onVisibleColumnsChange: any
}

type Props = OwnProps & PropsFromRedux

const ColumnTogglerComponent: FC<Props> = ({
  columnDefinitions,
  visibleColumnsKeys,
  onVisibleColumnsChange,
}) => {
  const [isDropdownVisible, toggleDropdown] = useState(false)

  const columnsForCheckboxes = useMemo(
    () => columnDefinitions
      .filter(column => column.id !== COLUMN_ID_EMAIL && ['String', 'Text', 'Number'].includes(column.type))
      .map(filteredColumn => ({
        title: toReadableString(filteredColumn.id),
        name: filteredColumn.id,
        isChecked: visibleColumnsKeys.includes(filteredColumn.id),
      })),
    [visibleColumnsKeys, columnDefinitions],
  )

  const handleOnChange = (event: CheckboxChangeEvent): void => {
    const { checked, name: columnId } = event.target as HTMLInputElement

    let changedVisibleColumnKey: string[] = []
    if (checked) {
      changedVisibleColumnKey = visibleColumnsKeys.concat(columnId)
    } else {
      changedVisibleColumnKey = visibleColumnsKeys.filter(
        visibleColumn => columnId !== visibleColumn,
      )
    }
    onVisibleColumnsChange(changedVisibleColumnKey)
  }

  const columnCheckboxesMenu = (
    <Menu>
      <Typography.Text className="ps-6 pe-6">
        {I18n.t('administration.datasheets.list.column_toggler.title')}
      </Typography.Text>
      <Menu.Divider />
      <Menu.Item>
        <Checkbox checked disabled>
          Email
        </Checkbox>
      </Menu.Item>
      {columnsForCheckboxes.map(column => (
        <Menu.Item key={column.name}>
          <Checkbox
            name={`${column.name}`}
            checked={column.isChecked}
            onChange={handleOnChange}
          >
            {column.title}
          </Checkbox>
        </Menu.Item>
      ))}
    </Menu>
  )

  return (
    <Dropdown
      trigger={['click']}
      overlay={columnCheckboxesMenu}
      visible={isDropdownVisible}
      placement="bottomRight"
      onVisibleChange={visible => toggleDropdown(visible)}
    >
      <Tooltip
        title={I18n.t('administration.datasheets.list.column_toggler.tool_tip')}
      >
        <Button>
          <TableOutlined />
          <DownOutlined />
        </Button>
      </Tooltip>
    </Dropdown>
  )
}

export const ColumnToggler = connector(ColumnTogglerComponent)
