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
  onChangeMultiple:(data : {}) => void
}

export const DefaultFields: React.FC<Props> = ({
  requiredFields, lockedFields, enabledFields, onChangeRequired, onChangeLocked, onChangeEnabled, onChangeMultiple,
}) => {
  const changeRequired = (row) => {
    if (!requiredFields[row.index] && !enabledFields[row.index]) {
      const multiple = {
        requiredDefaultFields: {
          ...requiredFields,
          [row.index]: true,
        },
        enabledDefaultFields: {
          ...enabledFields,
          [row.index]: true,
        },
      }
      onChangeMultiple({ ...multiple })
    } else {
      onChangeRequired({ ...requiredFields, [row.index]: !requiredFields[row.index] })
    }
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
      <Column title={I18n.t('shared.name')} dataIndex="name" />
      <Column
        title={I18n.t('admin.projects_profile_settings_form_fields_enabled')}
        dataIndex="enabled"
        render={(_, row: Field) => (row.showEnabled ? (
          <Checkbox
            onChange={() => changeEnabled(row)}
            checked={requiredFields[row.index] ? true : enabledFields[row.index]}
            disabled={requiredFields[row.index]}
          />
        ) : null)
        }
      />
      <Column
        title={I18n.t('shared.required')}
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
        title={I18n.t('admin.projects_profile_settings_form_fields_locked')}
        dataIndex="locked"
        render={(_, row:Field) => (
          <Checkbox onChange={() => changeLocked(row)} checked={lockedFields[row.index]} />
        )}
      />
    </Table>
  )
}
