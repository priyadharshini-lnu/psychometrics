import React, { useEffect } from 'react'
import {
  Row, Col, Table
} from 'antd'
import _ from 'lodash'
import style from './style.scss'

export default function InstructionList({
  fetch,
  history,
  mailHistories: { list },
  match: {
    params: { campaignId },
  },
}) {
  useEffect(() => {
    fetch(campaignId)
  }, [])

  const columns = [
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Recipient',
      dataIndex: 'recipient',
      key: 'recipient',
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Date',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
    },
    {
      title: 'Emails Sent',
      dataIndex: 'emailsSent',
      key: 'emailsSent',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (<div>Action</div>)
    },
  ];

  return (
    <div className='mtl'>
      <Table dataSource={list} columns={columns} />;
    </div>
  )
}
