import React, { useEffect } from 'react'
import {
  Row, Col, Table, Dropdown, Menu, Icon, Tag
} from 'antd'
import _ from 'lodash'
import style from './style.scss'
import Pagination from '../../common/Pagination'

export default function MailHistory({
  fetch,
  page,
  mailHistories: { list, total },
  match: {
    params: { campaignId },
  },
}) {
  useEffect(() => {
    fetch(campaignId, page)
  }, [page])

  const columns = [
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text) => {
        const color = text == 'success' ? 'green' : 'grey'

        return <Tag color={color}>{I18n.t(`threesixty.mail_history.statuses.${text}`)}</Tag>
      },
    },
    {
      title: 'Recipient',
      dataIndex: 'recipient',
      key: 'recipient',
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subjects',
    },
    {
      title: 'Date',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      render: (date) => (moment(date).format('YYYY-MM-DD HH:mm:ss'))
    },
    {
      title: 'Emails Sent',
      dataIndex: 'emailsSent',
      key: 'emailsSent',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => <ActionMenu unDelivered={!!record.delivered_at} campaignId={campaignId} emailSchedulId={record.id} />
    },
  ];

  return (
    <div className='mtl'>
      <Table rowKey={record => record.id} dataSource={list} columns={columns} pagination={false} />
      <Pagination total={total} onChange={(page) => fetch(campaignId, page)} path="/messages/mail_histories" />
    </div>
)
}

const ActionMenu = ({ unDelivered, campaignId, emailSchedulId }) => {
  const menu = (
    <Menu>
      <Menu.Item key="0">
        <a
          href={`/administration/threesixty_campaigns/${campaignId}/mail_histories/${emailSchedulId}/download.csv`}
        >
          Download Details
        </a>
      </Menu.Item>
    </Menu>
  )

  return (
    <Dropdown
      overlay={menu}
      trigger={['click']}
    >
      <a>
        <Icon type="ellipsis" />
      </a>
    </Dropdown>
  )
}