import { useEffect } from 'react'
import {
  Table, Dropdown, Tag, message,
} from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import dayjs from '~/utils/dayjs'
import { STATUSES } from '~/modules/admin/constants/mailHistory'
import styles from './styles.less'
import Pagination from '../../../components/Pagination'
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
          {dayjs(date).format('YYYY-MM-DD HH:mm:ss')}
          <div className={styles.scheduledAt}>{unDelivered(record) && dayjs(date).fromNow()}</div>
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
        <Pagination
          total={total}
          onChange={page => fetch(campaignId, page)}
          path="/messages/mail_histories"
        />
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

  const menuItems = [
    !unDelivered && {
      key: 'download',
      label: (
        <a
          href={`/administration/threesixty_campaigns/${campaignId}/email_schedules/${emailSchedulId}/download.csv`}
        >
          Download Details
        </a>
      ),
    },
    unDelivered && {
      key: 'edit',
      label: 'Edit',
    },
    unDelivered && {
      key: 'delete',
      label: 'Delete',
    },
  ]

  const handleMenuClick = ({ key }) => {
    if (key === 'edit') {
      openModal('EmailScheduleModal', { selectedEmailScheduleId: emailSchedulId })
    }
    if (key === 'delete') {
      onRemove()
    }
  }

  return (
    <Dropdown
      menu={{ items: menuItems, onClick: handleMenuClick }}
      trigger={['click']}
      placement="bottomCenter"
    >
      <a>
        <MoreOutlined />
      </a>
    </Dropdown>
  )
}
