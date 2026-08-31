import { useEffect } from 'react'
import {
  Table, Button, Dropdown, Tag, message,
} from 'antd'
import { useParams, useSearchParams } from 'react-router-dom'
import { MoreOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import dayjs from '~/utils/dayjs'
import { STATUSES } from '~/modules/admin/constants/mailHistory'
import { TableLayout } from '~/modules/admin/components/TableLayout'
import styles from './styles.less'
import settings from '../../../settings'
import EmailScheduleModal from '../EmailList/EmailScheduleModal'

export default function MailHistory ({
  fetch,
  page,
  openModal,
  remove,
  mailHistories: { list, total },
}) {
  const { campaignId } = useParams()
  const [params, setParams] = useSearchParams()
  useEffect(() => {
    fetch(campaignId, page)
  }, [page])

  const changePage = (nextPage) => {
    params.set('page', nextPage)
    setParams(params)
    fetch(campaignId, nextPage)
  }

  const unDelivered = ({ status }) => status === STATUSES.UNDELIVERED

  const columns = [
    {
      title: I18n.t('shared.status'),
      fixed: 'left',
      dataIndex: 'status',
      key: 'status',
      minWidth: 150,
      render: (text) => {
        const color = text === STATUSES.SUCCESS ? 'green' : 'grey'

        return <Tag color={color}>{I18n.t(`threesixty.mail_history.statuses.${text}`)}</Tag>
      },
    },
    {
      title: I18n.t('admin.threesixty_campaigns_mail_history_recipient'),
      dataIndex: 'recipient',
      key: 'recipient',
      minWidth: 200,
    },
    {
      title: I18n.t('admin.threesixty_campaigns_mail_history_subject'),
      dataIndex: 'subject',
      key: 'subjects',
      minWidth: 200,
    },
    {
      title: I18n.t('admin.threesixty_campaigns_mail_history_date'),
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      minWidth: 150,
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
      minWidth: 100,
    },
    {
      title: I18n.t('shared.actions'),
      fixed: 'right',
      key: 'actions',
      minWidth: 100,
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
    <>
      <TableLayout
        title={I18n.t('admin.mail_history')}
        recordCount={total}
        pagination={{
          page,
          pageSize: settings.pageLimit,
          total,
          onChange: changePage,
          showSizeChanger: false,
        }}
        table={(
          <Table
            rowKey={record => record.id}
            dataSource={list}
            columns={columns}
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        )}
      />
      <EmailScheduleModal onSave={() => fetch(campaignId, page)} />
    </>
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
      <Button type="link" icon={<MoreOutlined />} />
    </Dropdown>
  )
}
