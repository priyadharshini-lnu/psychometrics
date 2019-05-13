import React from 'react'
import {
  Table, Dropdown, Menu, Icon,
} from 'antd'
import userPresenter from 'presenters/userPresenter'
import statusPresenter from 'presenters/statusPresenter'
import './styles.scss'
import InlineInput from './InlineInput'

const { Column } = Table

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

export default function NominationTable (props) {
  const {
    removeNomination, rowData,
    match: { params: { campaignId, id: nominationId } },
  } = props

  const ActionsMenu = evaluator => (
    <Menu onClick={() => removeNomination({ campaignId, nominationId, evaluator })}>
      <Menu.Item key="0">
        Remove
      </Menu.Item>
    </Menu>
  )

  const renderNameCell = ({
    type, name, relationship, evaluator,
  }) => {
    if (type === 'link') {
      return <InlineInput title={name} relationship={relationship} {...props} />
    }
    return { children: userPresenter.getFullName(evaluator.evaluator) }
  }

  const renderApprovalStatus = ({ evaluator }) => ({
    children: evaluator && statusPresenter.getApprovalStatus(evaluator.approvalStatus),
  })

  const renderStatus = ({ evaluator }) => ({
    children: evaluator && statusPresenter.getStatus(evaluator.status),
  })

  return (
    <div className="nominations-table">
      <Table
        className="mtm"
        rowKey="key"
        dataSource={rowData}
        pagination={false}
        bordered
        rowClassName="nomination-row"
      >
        <Column title="Requirements" key="title" render={renderRequirementCell} />
        <Column title="Name" key="name" render={renderNameCell} width="40%" />
        <Column title="Approval Status" render={renderApprovalStatus} key="status" />
        <Column title="Evaluation Status" dataIndex={renderStatus} key="evaluatorStatus" />

        <Column
          key="action"
          render={({ evaluator }) => (evaluator && (
            <Dropdown overlay={() => ActionsMenu(evaluator)} trigger={['click']}>
              <div><Icon type="down" /></div>
            </Dropdown>
          ))}
        />
      </Table>

    </div>
  )
}
