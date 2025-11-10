import React, { useState, useEffect } from 'react'
import {
  List, Badge, Button, Row, Col, Popover,
  Empty, Dropdown, Flex, Tooltip, Modal, Space,
} from 'antd'
import type { MenuProps } from 'antd'
import humps from 'humps'
import {
  CheckOutlined, CalendarOutlined, LockOutlined,
  UserOutlined, BellOutlined, BellFilled, LogoutOutlined, DownOutlined,
} from '@ant-design/icons'
import InfiniteScroll from 'react-infinite-scroller'
import { useResources } from '~/hooks/useResources'
import { LangDropdownWithChangeLocale } from '~/components/LangDropdown'
import styles from './styles.less'
import { PropsFromRedux } from './connect'
import AdminJob from './AdminJob'

const {
  App,
  I18n,
} = window

type UserDetails = {
  id: string
  firstName: string
  LastName: string
  name: string
  email: string
}

const AdminJobList: React.FC<PropsFromRedux> = ({
  adminJobs,
  fetch,
  unread,
  read,
  readAll,
  createJob,
  updateJob,
  hasMore,
}) => {
  const [active, setActive] = useState(false)
  const [visible, setVisible] = useState<boolean>(false) // State to control Popover visibility
  const [user, setUser] = useState<UserDetails | null>(null)
  const {
    features,
    adminLocales,
  } = window.PsyGlobalState
  const { collectionAction } = useResources('users')

  useEffect(() => {
    collectionAction({
      action: 'current_user_details',
      method: 'get',
    })
      .then((data: UserDetails) => {
        setUser(data)
      })
    fetch(adminJobs.length)
    if (App.cable) {
      App.cable.subscriptions.create({ channel: 'AdminJobChannel' }, {
        received ({
          action,
          job,
        }) {
          if (action === 'create') createJob(humps.camelizeKeys(job))
          if (action === 'update') updateJob(humps.camelizeKeys(job))
        },
      })
    }
  }, [])

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setVisible(false)
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [visible])

  const handleClick = () => {
    setActive(!active)
  }

  const handleInfiniteOnLoad = () => fetch(adminJobs.length)

  const handleLogout = () => {
    Modal.confirm({
      title: I18n.t('administration.header.logout.title'),
      content: I18n.t('administration.header.logout.content'),
      onOk () {
        window.location.href = '/administration/sign_out'
      },
      okButtonProps: { danger: true },
    })
  }

  const content = (
    <div className={styles.list}>
      <InfiniteScroll
        initialLoad={false}
        pageStart={0}
        loadMore={handleInfiniteOnLoad}
        hasMore={hasMore}
        useWindow={false}
      >
        <List
          className={styles.listBox}
          locale={{
            emptyText: (
              <Empty description={I18n.t('admin.no_notifications')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ),
          }}
          itemLayout="vertical"
          dataSource={adminJobs}
          renderItem={job => <AdminJob job={job} read={read} />}
          header={(
            <Row>
              <Col span="12">
                <h3 className="pt8 pl24">{I18n.t('admin.notifications')}</h3>
              </Col>
              <Col span="12" className="text-align-r">
                <Button
                  type="link"
                  disabled={!unread}
                  icon={<CheckOutlined />}
                  onClick={readAll}
                >
                  <span className={styles.btnText}>{I18n.t('admin_jobs.mark_as_read')}</span>
                </Button>
              </Col>
            </Row>
          )}
        />
      </InfiniteScroll>
    </div>
  )

  const profileSubmenuItems: MenuProps['items'] = [
    {
      key: 'profile_details',
      label: I18n.t('admin.profile_details'),
      icon: <UserOutlined aria-hidden="true" />,
      onClick: () => {
        window.location.href = '/admin/profile/details'
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'change_password',
      label: I18n.t('shared.change_password'),
      icon: <LockOutlined aria-hidden="true" />,
      onClick: () => {
        window.location.href = '/admin/profile/change_password'
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: I18n.t('administration.navigation.logout'),
      icon: <LogoutOutlined aria-hidden="true" />,
      onClick: handleLogout,
    },
  ]

  return (
    <Flex
      flex={1}
      justify="flex-end"
      align="center"
      gap={8}
      style={{
        height: 55,
        borderBottom: '1px solid #ddd',
      }}
    >
      {features.enable_intl_for_admins ? <LangDropdownWithChangeLocale locales={adminLocales.split(',')} />
        : null}
      <Popover
        placement="bottomRight"
        content={content}
        trigger="click"
        open={visible}
        onOpenChange={setVisible}
        overlayClassName={styles.overlay}
      >
        <Button
          aria-label={`${I18n.t('admin.notification_bell_icon_alt_text')}`}
          type="text"
          onClick={handleClick}
          icon={(
            <Badge count={unread} overflowCount={9}>
              {unread > 0 ? <BellFilled aria-hidden="true" /> : <BellOutlined aria-hidden="true" />}
            </Badge>
          )}
          className="ms-2"
        />
      </Popover>
      <Tooltip title={I18n.t('admin.availability')}>
        <Button
          type="text"
          onClick={() => {
            window.location.href = '/admin/user_availabilities'
          }}
          icon={<CalendarOutlined aria-hidden="true" />}
        />
      </Tooltip>
      <Dropdown menu={{ items: profileSubmenuItems }} trigger={['click']}>
        <Button
          className="ms-2 me-2"
          icon={<UserOutlined />}
        >
          {user?.firstName ? (
            <Space>
              {user?.firstName}
              <DownOutlined />
            </Space>
          ) : null}
        </Button>
      </Dropdown>
    </Flex>
  )
}

export default AdminJobList
