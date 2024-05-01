import React from 'react'
import {
  Table, Checkbox,
} from 'antd'

const { Column } = Table
const { I18n } = window

interface Field {
  index: string
  name: string
  required: boolean
  locked: boolean
  default: boolean
  showEnabled: boolean
}

interface Props {
  requiredFields: {}
  lockedFields: {}
  enabledFields: {}
  onChangeRequired: (data: {}) => void
  onChangeLocked: (data: {}) => void
  onChangeEnabled: (data: {}) => void
}

export const DefaultFields: React.FC<Props> = ({
  requiredFields, lockedFields, enabledFields, onChangeRequired, onChangeLocked, onChangeEnabled,
}) => {
  const changeRequired = (row) => {
    onChangeRequired({ ...requiredFields, [row.index]: !requiredFields[row.index] })
  }
  const changeLocked = (row) => {
    onChangeLocked({ ...lockedFields, [row.index]: !lockedFields[row.index] })
  }

  const changeEnabled = (row) => {
    onChangeEnabled({ ...enabledFields, [row.index]: !enabledFields[row.index] })
  }

  const defaultFields = [{
    name: I18n.t('profile.first_name'),
    index: 'first_name',
    default: true,
  }, {
    name: I18n.t('profile.last_name'),
    index: 'last_name',
    default: true,
  }, {
    name: I18n.t('profile.age'),
    index: 'age',
    showEnabled: true,
  }, {
    name: I18n.t('profile.gender'),
    index: 'gender',
    showEnabled: true,
  }, {
    name: I18n.t('profile.locale'),
    index: 'locale',
  },
  {
    name: I18n.t('profile.photo'),
    index: 'photo',
    showEnabled: true,
  }]

  const fields = defaultFields.map(f => ({ ...f, required: requiredFields[f.index], locked: lockedFields[f.index] }))

  return (
    <Table
      pagination={false}
      dataSource={fields}
      rowKey="position"
    >
      <Column title="Name" dataIndex="name" />
      <Column
        title="Enabled"
        dataIndex="enabled"
        render={(_, row: Field) => (row.showEnabled ? (
          <Checkbox
            onChange={() => changeEnabled(row)}
            checked={requiredFields[row.index] ? true : enabledFields[row.index]}
          />
        ) : null)
        }
      />
      <Column
        title="Required"
        dataIndex="required"
        render={(_, row:Field) => (
          <Checkbox
            disabled={row.default}
            onChange={() => changeRequired(row)}
            checked={row.default ? true : requiredFields[row.index]}
          />
        )}
      />
      <Column
        title="Locked"
        dataIndex="locked"
        render={(_, row:Field) => (
          <Checkbox onChange={() => changeLocked(row)} checked={lockedFields[row.index]} />
        )}
      />
    </Table>
  )
}
