import React, { useEffect } from 'react'
import {
  Table, Dropdown, Menu, Icon, Tag, message,
} from 'antd'
import { STATUSES } from 'constants/mailHistory'
import style from './style.scss'
import Pagination from '../../common/Pagination'
import EmailScheduleModal from '../EmailList/EmailScheduleModal'

export default function MailHistory ({
  fetch,
  page,
  openModal,
  remove,
  mailHistories: { list, total },
  match,
  match: {
    params: { campaignId },
  },
}) {
  useEffect(() => {
    fetch(campaignId, page)
  }, [page])

  const unDelivered = ({ status }) => status === STATUSES.UNDELIVERED

  const columns = [
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text) => {
        const color = text === STATUSES.SUCCESS ? 'green' : 'grey'

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
      render: (date, record) => (
        <>
          {moment(date).format('YYYY-MM-DD HH:mm:ss')}
          <div className={style.scheduledAt}>{unDelivered(record) && moment(date).fromNow()}</div>
        </>
      ),
    },
    {
      title: 'Emails Sent',
      dataIndex: 'emailsSent',
      key: 'emailsSent',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <ActionMenu
          unDelivered={unDelivered(record)}
          campaignId={campaignId}
          emailSchedulId={record.id}
          openModal={openModal}
          remove={remove}
        />
      ),
    },
  ]

  return (
    <div className="mtl">
      <Table rowKey={record => record.id} dataSource={list} columns={columns} pagination={false} />
      <div className="pm">
        <Pagination total={total} onChange={page => fetch(campaignId, page)} path="/messages/mail_histories" />
      </div>
      <EmailScheduleModal match={match} onSave={() => fetch(campaignId, page)} />
    </div>
  )
}

const ActionMenu = ({
  unDelivered, campaignId, emailSchedulId, openModal, remove,
}) => {
  const onRemove = () => {
    remove(campaignId, emailSchedulId).then(() => message.info(I18n.t('threesixty.email_schedules.delete_successful')))
  }

  const menu = (
    <Menu>
      {!unDelivered && (
      <Menu.Item key="0">
        <a
          href={`/administration/threesixty_campaigns/${campaignId}/email_schedules/${emailSchedulId}/download.csv`}
        >
          Download Details
        </a>
      </Menu.Item>
      )}
      {unDelivered && (
        <Menu.Item key="1">
          <div
            className="pll prl"
            onClick={() => { openModal('EmailScheduleModal', { selectedEmailScheduleId: emailSchedulId }) }}
            role="button"
            tabIndex={-1}
          >
            Edit
          </div>
        </Menu.Item>
      )}
      {unDelivered && (
        <Menu.Item key="2">
          <div
            className="pll prl"
            onClick={onRemove}
            role="button"
            tabIndex={-1}
          >
            Delete
          </div>
        </Menu.Item>
      )}
    </Menu>
  )

  return (
    <Dropdown
      overlay={menu}
      trigger={['click']}
      placement="bottomCenter"
    >
      <a>
        <Icon type="ellipsis" />
      </a>
    </Dropdown>
  )
}
