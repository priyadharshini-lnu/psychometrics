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
    removeNomination, updateStatus, rowData,
    nomination: { isSelf, options },
    match: { params: { campaignId, id: nominationId } },
  } = props

  const ActionsMenu = evaluator => (
    <Menu onClick={() => removeNomination({ campaignId, nominationId, evaluator })}>
      <Menu.Item key="0">
        Remove
      </Menu.Item>
    </Menu>
  )

  const StatusMenu = evaluator => (
    <Menu onClick={(e) => {
      updateStatus({
        campaignId, nominationId, evaluatorId: evaluator.id, status: e.key,
      })
    }}
    >
      <Menu.Item key="approved">
        Approved
      </Menu.Item>
      <Menu.Item key="waiting">
        Waiting
      </Menu.Item>
      <Menu.Item key="denied">
        Denied
      </Menu.Item>
    </Menu>
  )

  const renderNameCell = ({
    type, name, relationship, evaluator,
  }) => {
    if (type === 'link') {
      return <InlineInput title={name} relationship={relationship} {...props} />
    }
    return { children: userPresenter.getFullNameWithEmail(evaluator.evaluator) }
  }

  const renderApprovalStatus = ({ evaluator }) => {
    if (!evaluator) { return null }
    if (isSelf || !options.participants.manager.canApproveNominations) {
      return { children: evaluator && statusPresenter.getApprovalStatus(evaluator.approvalStatus) }
    }

    return (
      <Dropdown
        trigger={['click']}
        overlay={() => StatusMenu(evaluator)}
      >
        <div>
          {statusPresenter.getApprovalStatus(evaluator.approvalStatus)}
          <Icon type="down" />
        </div>
      </Dropdown>

    )
  }

  const renderStatus = ({ evaluator }) => ({
    children: evaluator && evaluator.evaluationStatus,
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
        <Column title="Evaluation Status" render={renderStatus} key="evaluatorNominationStatus" />

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
