import React from 'react'
import { Dropdown, Icon, Table } from 'antd'
import userPresenter from 'presenters/userPresenter'
import ActionsMenu from '../ActionsMenu'
import css from './EvaluatorTable.scss'

const { Column } = Table

export default function EvaluatorTable ({ evaluators, openModal }) {
  return (
    <Table
      className="mtm"
      rowKey="id"
      dataSource={evaluators}
      pagination={false}
      onRow={record => ({
        onClick: (e) => {
          if (['TR', 'TD'].includes(e.target.tagName)) {
            openModal('ParticipantModal', record.user)
          }
        },
      })}
    >
      <Column title="Name" key="fullName" render={({ user }) => userPresenter.getFullName(user)} />
      <Column title="Email" dataIndex="user.email" key="email" />
      <Column title="Evaluations Received" dataIndex="evaluators" key="received_evaluations" />
      <Column title="Evaluations Completed" dataIndex="evaluations" key="completed_evaluations" />
      <Column title="Report Status" dataIndex="reportStatus" key="report_status" />
      <Column title="Status" dataIndex="status" key="status" />
      <Column
        title="Is Subject"
        render={({ isSubject }) => isSubject && <Icon className="text-success" type="check" />}
        key="isSubject"
      />

      <Column
        key="action"
        render={() => (
          <Dropdown overlay={ActionsMenu} trigger={['click']}>
            <div className={css.actions}>
              <Icon type="ellipsis" />
            </div>
          </Dropdown>
        )}
      />
    </Table>
  )
}
