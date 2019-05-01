import React, { useEffect } from 'react'
import {
  Table, Dropdown, Menu, Icon,
} from 'antd'
import userPresenter from 'presenters/userPresenter'
import css from './NominationTable.scss'
import InlineInput from './InlineInput'

const { Column } = Table

const prepareRowData = (requirements, evaluators, relationships) => {
  const { conditions } = requirements
  const rows = []
  _.each(conditions, ({ id, value, predicate }) => {
    const { name } = _.find(relationships, { id })
    const count = (evaluators[name] && evaluators[name].length) || 0
    _.each(evaluators[name], (evaluator, i) => rows.push({
      rowSpan: i === 0 && count > 0 ? count + 1 : 0,
      title: i === 0 ? name : null,
      key: evaluator.id,
      condition: `${predicate} ${value}`,
      evaluator,
    }))
    rows.push({
      rowSpan: count > 0 ? 0 : 1,
      title: count > 0 ? null : name,
      name: `Add ${name}`,
      key: `${name}_link`,
      type: 'link',
      condition: `${predicate} ${value}`,
      role: id,
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
  const {
    nomination: { requirements, evaluators }, removeNomination,
    match: { params: { campaignId, id: nominationId } },
    nomination: { relationships },
  } = props

  const rows = prepareRowData(requirements, evaluators, relationships)

  const ActionsMenu = evaluator => (
    <Menu onClick={() => removeNomination({ campaignId, nominationId, evaluator })}>
      <Menu.Item key="0">
        Remove
      </Menu.Item>
    </Menu>
  )

  const renderNameCell = ({
    type, name, role, evaluator,
  }) => {
    if (type === 'link') {
      return <InlineInput title={name} role={role} {...props} />
    }
    return { children: userPresenter.getFullName(evaluator.user) }
  }

  const renderApprovalStatus = ({ evaluator }) => ({
    children: evaluator && evaluator.status,
  })

  return (
    <div className="nominations-table">
      <Table className="mtm" rowKey="id" dataSource={rows} pagination={false} bordered rowClassName="nomination-row">
        <Column title="Requirements" key="title" render={renderRequirementCell} />
        <Column title="Name" key="name" render={renderNameCell} width="40%" />
        <Column title="Approval Status" render={renderApprovalStatus} key="status" />
        <Column title="Evaluation Status" dataIndex="subject.evaluatorStatus" key="evaluatorStatus" />

        <Column
          key="action"
          render={({ evaluator }) => (evaluator ? (
            <Dropdown overlay={() => ActionsMenu(evaluator)} trigger={['click']}>
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
