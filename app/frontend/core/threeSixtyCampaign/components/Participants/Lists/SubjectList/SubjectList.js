import React, { useEffect } from 'react'
import { Table, Divider } from 'antd'

const { Column } = Table

export default function SubjectList ({
  fetchSubjects,
  subjects,
  match: {
    params: { campaignId },
  },
}) {
  useEffect(() => {
    fetchSubjects(campaignId)
  }, [])

  return (
    <Table rowKey="id" dataSource={subjects}>
      <Column title="First Name" dataIndex="user.firstName" key="firstName" />
      <Column title="Last Name" dataIndex="user.lastName" key="lastName" />

      <Column
        title="Action"
        key="action"
        render={(text, record) => (
          <span>
            <span>
              Invite
              {record.lastName}
            </span>
            <Divider type="vertical" />
            <span>Delete</span>
          </span>
        )}
      />
    </Table>
  )
}
