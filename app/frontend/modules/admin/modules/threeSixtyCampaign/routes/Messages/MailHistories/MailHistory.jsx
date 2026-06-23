import { useEffect } from 'react'
import {
  Table, Dropdown, Tag, message,
} from 'antd'
import { useParams } from 'react-router-dom'
import { MoreOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import dayjs from '~/utils/dayjs'
import { STATUSES } from '~/modules/admin/constants/mailHistory'
import styles from './styles.less'
import Pagination from '../../../components/Pagination'
import EmailScheduleModal from '../EmailList/EmailScheduleModal'
import { useWindowSize } from '~/hooks/useWindowSize'

export default function MailHistory ({
  fetch,
  page,
  openModal,
  remove,
  mailHistories: { list, total },
}) {
  const { campaignId } = useParams()
  const { width: windowWidth } = useWindowSize()
  useEffect(() => {
    fetch(campaignId, page)
  }, [page])

  const unDelivered = ({ status }) => status === STATUSES.UNDELIVERED

  const columns = [
    {
      title: I18n.t('shared.status'),
      fixed: windowWidth > 800 ? 'left' : undefined,
      dataIndex: 'status',
      key: 'status',
      render: (text) => {
        const color = text === STATUSES.SUCCESS ? 'green' : 'grey'

        return <Tag color={color}>{I18n.t(`threesixty.mail_history.statuses.${text}`)}</Tag>
      },
    },
    {
      title: I18n.t('admin.threesixty_campaigns_mail_history_recipient'),
      dataIndex: 'recipient',
      key: 'recipient',
    },
    {
      title: I18n.t('admin.threesixty_campaigns_mail_history_subject'),
      dataIndex: 'subject',
      key: 'subjects',
    },
    {
      title: I18n.t('admin.threesixty_campaigns_mail_history_date'),
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
      title: I18n.t('admin.threesixty_campaigns_mail_history_emails_sent'),
      dataIndex: 'emailsSent',
      key: 'emailsSent',
    },
    {
      title: I18n.t('shared.actions'),
      fixed: windowWidth > 800 ? 'right' : undefined,
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
      <Table
        rowKey={record => record.id}
        dataSource={list}
        columns={columns}
        pagination={false}
        scroll={{ x: 'max-content' }}
      />
      <div className="pm">
        <Pagination
          total={total}
          onChange={page => fetch(campaignId, page)}
          path="/messages/mail_histories"
        />
      </div>
      <EmailScheduleModal onSave={() => fetch(campaignId, page)} />
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
          {I18n.t('admin.threesixty_campaigns_mail_history_download_details')}
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
