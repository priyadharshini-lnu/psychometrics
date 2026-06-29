import React, { useState, useEffect, useMemo } from 'react'
import {
  List, Badge, Button, Row, Col, Popover,
  Empty, Dropdown, Flex, Modal,
  Avatar, Typography,
} from 'antd'
import type { MenuProps } from 'antd'
import humps from 'humps'
import InfiniteScroll from 'react-infinite-scroller'
import { createAvatar } from '@dicebear/core'
import { shapes } from '@dicebear/collection'
import { useMedia } from 'use-media'
import {
  CheckOutlined, LockOutlined,
  UserOutlined, BellOutlined, BellFilled, LogoutOutlined,
  DownOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources'
import { LangDropdownWithChangeLocale } from '~/components/LangDropdown'
import styles from './styles.less'
import { PropsFromRedux } from './connect'
import AdminJob from './AdminJob'
import consumer from '~/core/consumer'

const {
  I18n,
} = window

type UserDetails = {
  id: string
  firstName: string
  LastName: string
  name: string
  email: string
  roleTitle: string
  photo?: string
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
  const isMobile = useMedia({
    maxWidth: 600,
  })

  const largeAvatar = useMemo(() => {
    if (!user?.email) return null
    return createAvatar(shapes, {
      size: 48,
      seed: user.email,
    })
      .toDataUri()
  }, [user?.email])

  useEffect(() => {
    collectionAction({
      action: 'current_user_details',
      method: 'get',
    })
      .then((data: UserDetails) => {
        setUser(data)
      })
    fetch(adminJobs.length)
    if (consumer()) {
      consumer().subscriptions.create({ channel: 'AdminJobChannel' }, {
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
      title: I18n.t('admin.header_logout_title'),
      content: I18n.t('admin.header_logout_content'),
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
      key: 'user_info',
      label: (
        <Flex gap={16} justify="center" align="center">
          <Avatar
            size={48}
            src={user?.photo || largeAvatar}
            icon={<UserOutlined />}
          />
          <Flex vertical justify="center">
            <Typography.Title level={5} className="m-0 mb-0">
              {user?.name}
            </Typography.Title>
            <Typography.Text>
              {user?.email}
            </Typography.Text>
            <Typography.Text style={{ fontSize: 12 }}>
              {`${I18n.t('admin.role')} - ${user?.roleTitle}`}
            </Typography.Text>
          </Flex>
        </Flex>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
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
      label: I18n.t('admin.navigation_logout'),
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
      >
        <Button
          aria-label={`${I18n.t('admin.notification_bell_icon_alt_text')}`}
          type="text"
          onClick={handleClick}
          icon={(
            <Badge count={unread} overflowCount={9} size="small">
              {unread > 0 ? <BellFilled aria-hidden="true" /> : <BellOutlined aria-hidden="true" />}
            </Badge>
          )}
          className="ms-2"
        />
      </Popover>
      <Dropdown
        menu={{ items: profileSubmenuItems }}
        trigger={['click']}
        placement="bottomRight"
      >
        <Button
          className="me-2 ps-1 pe-1"
          type="text"
        >
          <Avatar
            size={24}
            src={user?.photo || largeAvatar}
            icon={<UserOutlined />}
          />
          {!isMobile && user?.firstName ? (
            <Flex gap={4}>
              <Typography.Text>{user?.firstName}</Typography.Text>
              <DownOutlined />
            </Flex>
          ) : null}
        </Button>
      </Dropdown>
    </Flex>
  )
}

export default AdminJobList
