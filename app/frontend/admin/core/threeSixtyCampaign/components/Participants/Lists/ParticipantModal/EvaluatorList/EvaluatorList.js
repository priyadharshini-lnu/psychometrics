import React from 'react'
import { Table } from 'antd'
import userPresenter from 'presenters/userPresenter'

export default function EvaluatorList ({ participants }) {
  return (
    <Table className="mtm" rowKey="id" dataSource={participants} pagination={false}>
      <Table.Column
        title="Evaluating you"
        key="fullName"
        render={({ evaluator }) => userPresenter.getFullName(evaluator)}
      />
      <Table.Column title="Relationship" dataIndex="relationship.name" key="relationshipname" />
      <Table.Column title="Approved" dataIndex="managerStatus" key="managerStatus" />
      <Table.Column title="Complete" dataIndex="evaluatorStatus" key="evaluatorStatus" />
    </Table>
  )
}
