import React, { useState } from 'react'
import {
  Table, Checkbox, Button, Select, Space,
} from 'antd'
import _ from 'lodash'
import type { SortableContainerProps, SortEnd } from 'react-sortable-hoc'
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc'
import { arrayMove } from '@dnd-kit/sortable'
import { MenuOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import {
  ProfileField,
  QuestionField as QuestionFieldType,
} from '~/modules/admin/modules/client/core/profileSettings'
import styles from './Profile.less'

const { Column } = Table
const { I18n } = window
const DragHandle = SortableHandle(() => <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />)

const SortableItem = SortableElement((props: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr {...props} />
))
const SortableBody = SortableContainer((props: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody {...props} />
))

interface Props {
  questions: QuestionFieldType[]
  profileFields: ProfileField[]
  onAddField: (question: QuestionFieldType) => void
  onRemoveField: (row: ProfileField) => void
  onChange: (data: ProfileField[]) => void
  onSort: (data: ProfileField[]) => void
}

export const Fields: React.FC<Props> = ({
  questions, profileFields, onAddField, onChange, onSort, onRemoveField,
}) => {
  const [question, setQuestion] = useState<number | null>(null)

  const changeRequired = (row) => {
    onChange(profileFields.map(d => (d.position === row.position ? { ...row, required: !row.required } : d)))
  }
  const changeHalfsize = (row) => {
    onChange(profileFields.map(d => (d.position === row.position ? { ...row, halfSize: !row.halfSize } : d)))
  }

  const changeLocked = (row) => {
    onChange(profileFields.map(d => (d.position === row.position ? { ...row, locked: !row.locked } : d)))
  }

  const addField = () => {
    if (question) {
      const q = _.find(questions, { id: question })
      q && onAddField(q)
      setQuestion(null)
    }
  }

  const onSortEnd = ({ oldIndex, newIndex }: SortEnd) => {
    if (oldIndex !== newIndex) {
      const newData = arrayMove(profileFields.slice(), oldIndex, newIndex).filter(
        (el: ProfileField) => !!el,
      )
      onSort(newData.map((d, i) => ({ ...d, position: i + 1 })))
    }
  }

  const DraggableContainer = (props: SortableContainerProps) => (
    <SortableBody
      useDragHandle
      disableAutoscroll
      lockAxis="y"
      helperClass="row-dragging"
      onSortEnd={onSortEnd}
      {...props}
    />
  )

  const DraggableBodyRow: React.FC<{}> = ({ ...restProps }) => {
    const index = profileFields.findIndex(x => x.position === restProps['data-row-key'])
    return <SortableItem index={index} {...restProps} />
  }

  const questionsFields = questions.filter(q => !_.find(profileFields, { questionId: q.id }))
  return (
    <Table
      pagination={false}
      // eslint-disable-next-line no-underscore-dangle
      dataSource={profileFields.filter(f => !f._remove)}
      rowKey="position"
      components={{
        body: {
          wrapper: DraggableContainer,
          row: DraggableBodyRow,
        },
      }}
      footer={() => (
        <div className={styles.tableFooter}>
          <Space>
            <Select
              showSearch
              className={styles.select}
              value={question}
              filterOption={(input, option) => (option?.children as unknown as string).toLowerCase()
                .includes(input.toLowerCase())
              }
              onChange={value => setQuestion(value)}
            >
              {questionsFields.map(q => (
                <Select.Option value={q.id}>{q.name}</Select.Option>
              ))}
            </Select>
            <Button onClick={addField}>{I18n.t('profile.add_field')}</Button>
          </Space>
        </div>
      )}
    >
      <Column
        title={I18n.t('admin.projects_profile_settings_form_fields_sort')}
        dataIndex="sort"
        width={30}
        render={() => <DragHandle />}
      />
      <Column title="ID" dataIndex="id" />
      <Column title={I18n.t('shared.name')} dataIndex="name" />
      <Column
        title={I18n.t('shared.required')}
        dataIndex="required"
        render={(_, row:ProfileField) => <Checkbox onChange={() => changeRequired(row)} checked={row.required} />}
      />
      <Column
        title={I18n.t('admin.projects_profile_settings_form_fields_locked')}
        dataIndex="locked"
        render={(_, row:ProfileField) => <Checkbox onChange={() => changeLocked(row)} checked={row.locked} />}
      />
      <Column
        title={I18n.t('admin.projects_profile_settings_form_fields_half_size')}
        dataIndex="halfSize"
        render={(_, row:ProfileField) => <Checkbox onChange={() => changeHalfsize(row)} checked={row.halfSize} />}
      />
      <Column
        title={I18n.t('shared.remove')}
        dataIndex="remove"
        render={(_, row:ProfileField) => (
          <Button onClick={() => onRemoveField(row)}>
            {I18n.t('shared.remove')}
          </Button>
        )}
      />
    </Table>
  )
}
