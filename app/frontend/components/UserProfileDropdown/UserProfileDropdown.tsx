import React, { useState, useEffect, useMemo } from 'react'
import {
  Avatar, Dropdown, Button, Typography, Flex, Modal,
} from 'antd'
import type { MenuProps } from 'antd'
import { createAvatar } from '@dicebear/core'
import { shapes } from '@dicebear/collection'
import { useMedia } from 'use-media'
import {
  UserOutlined, LockOutlined, LogoutOutlined, DownOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { fetchCurrentUserDetails } from '~/components/AdminShell/currentUserDetails'
import type { CurrentUserDetails } from '~/components/AdminShell/currentUserDetails'

const { I18n } = window

interface Props {
  hideProfileLinks?: boolean
}

export const UserProfileDropdown: React.FC<Props> = ({ hideProfileLinks = false }) => {
  const [user, setUser] = useState<CurrentUserDetails | null>(null)
  const isMobile = useMedia({ maxWidth: 600 })

  const avatarSrc = useMemo(() => {
    if (!user?.email) return null
    return createAvatar(shapes, { size: 48, seed: user.email }).toDataUri()
  }, [user?.email])

  useEffect(() => {
    fetchCurrentUserDetails().then(setUser)
  }, [])

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

  const menuItems: MenuProps['items'] = [
    {
      key: 'user_info',
      label: (
        <Flex gap={16} justify="center" align="center">
          <Avatar size={48} src={user?.photo || avatarSrc} icon={<UserOutlined />} />
          <Flex vertical justify="center">
            <Typography.Title level={5} className="m-0 mb-0">
              {user?.name}
            </Typography.Title>
            <Typography.Text>{user?.email}</Typography.Text>
            <Typography.Text style={{ fontSize: 12 }}>
              {`${I18n.t('admin.role')} - ${user?.roleTitle}`}
            </Typography.Text>
          </Flex>
        </Flex>
      ),
      disabled: true,
    },
    { type: 'divider' },
    ...(!hideProfileLinks ? [
      {
        key: 'profile_details',
        label: I18n.t('admin.profile_details'),
        icon: <UserOutlined aria-hidden="true" />,
        onClick: () => { window.location.href = '/admin/profile/details' },
      },
      { type: 'divider' as const },
      {
        key: 'change_password',
        label: I18n.t('shared.change_password'),
        icon: <LockOutlined aria-hidden="true" />,
        onClick: () => { window.location.href = '/admin/profile/change_password' },
      },
      { type: 'divider' as const },
    ] : []),
    {
      key: 'logout',
      label: I18n.t('admin.navigation_logout'),
      icon: <LogoutOutlined aria-hidden="true" />,
      onClick: handleLogout,
    },
  ]

  return (
    <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
      <Button type="text" className="ps-1 pe-1">
        <Avatar size={24} src={user?.photo || avatarSrc} icon={<UserOutlined />} />
        {!isMobile && user?.firstName && (
          <Flex gap={4} align="center">
            <Typography.Text>{user.firstName}</Typography.Text>
            <DownOutlined style={{ fontSize: 10 }} />
          </Flex>
        )}
      </Button>
    </Dropdown>
  )
}
