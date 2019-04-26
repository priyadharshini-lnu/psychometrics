import React, { useEffect } from 'react'
import {
  Table, Dropdown, Menu, Icon,
} from 'antd'
import css from './NominationTable.scss'
import InlineInput from './InlineInput'

const { Column } = Table

const prepareRowData = (roles) => {
  const rows = []
  _.each(roles, ({ title, subjects, condition }, role) => {
    _.each(subjects, (subject, i) => rows.push({
      rowSpan: i === 0 && subjects.length > 0 ? subjects.length + 1 : 0,
      title: i === 0 ? title : null,
      key: subject.id,
      condition,
      subject,
    }))
    rows.push({
      rowSpan: subjects.length > 0 ? 0 : 1,
      title: subjects.length > 0 ? null : title,
      name: `Add ${title}`,
      key: `${role}_link`,
      type: 'link',
      condition,
      role,
    })
  })
  return rows
}

const renderRequirementCell = value => ({
  children: (
    <div>
      <div className="title">{value.title}</div>
      <div className="condition">{value.condition}</div>
    </div>
  ),
  props: {
    rowSpan: value.rowSpan,
  },
})

export default function NominationForm (props) {
  const { nomination: { evaluators }, removeNomination, addNomination } = props

  const rows = prepareRowData(evaluators)

  const ActionsMenu = subject => (
    <Menu onClick={() => removeNomination(subject)}>
      <Menu.Item key="0">
        Remove
      </Menu.Item>
    </Menu>
  )

  const renderNameCell = ({
    type, name, role, subject,
  }) => {
    if (type === 'link') {
      return <InlineInput title={name} role={role} addNomination={addNomination} />
    }
    return { children: subject.name }
  }

  return (
    <div className="nominations-table">
      <Table className="mtm" rowKey="id" dataSource={rows} pagination={false} bordered rowClassName="nomination-row">
        <Column title="Requirements" key="title" render={renderRequirementCell} />
        <Column title="Name" key="name" render={renderNameCell} width="40%" />
        <Column title="Approval Status" dataIndex="subject.status" key="status" />
        <Column title="Evaluation Status" dataIndex="subject.evaluatorStatus" key="evaluatorStatus" />

        <Column
          key="action"
          render={({ subject }) => (subject ? (
            <Dropdown overlay={() => ActionsMenu(subject)} trigger={['click']}>
              <div className={css.actions}>
                <Icon type="down" />
              </div>
            </Dropdown>
          ) : null)}
        />
      </Table>

    </div>
  )
}
