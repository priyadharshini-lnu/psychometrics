import React, { FC, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Avatar, Button, Drawer, Dropdown, Flex, Menu, SchemeScope, Typography, useApp, useGlintToken,
} from '@thetalententerprise/glint'
import type { MenuProps } from '@thetalententerprise/glint'
import {
  Check,
  ExpandMore,
  Lock,
  Logout,
  Person,
  Translate,
} from '@thetalententerprise/glint/icons'
import { createAvatar } from '@dicebear/core'
import { shapes } from '@dicebear/collection'
import { AppearanceMenuItem } from '~/modules/admin/components/AppearanceMenuItem'
import { useAdminLocales } from './adminLocales'
import { currentUserFromInitialState } from './currentUserDetails'
import { THEME_SWITCHER_ENABLED } from './AdminTheme'

const { I18n } = window

type Props = {
  isMobile: boolean
}

export const ProfileMenu: FC<Props> = ({ isMobile }) => {
  const [languageOpen, setLanguageOpen] = useState(false)
  const navigate = useNavigate()
  const token = useGlintToken()
  // The themed confirm, not antd's static one: only this reaches the provider's theme.
  const { modal } = useApp()
  // Server-seeded, so the menu renders complete on first paint instead of filling in after a round trip.
  const user = useMemo(currentUserFromInitialState, [])
  const { features, adminLocales } = window.PsyGlobalState
  const {
    options: localeOptions, current: currentLocale, change: changeAdminLocale,
  } = useAdminLocales(features.enable_intl_for_admins ? (adminLocales || '').split(',') : [])

  const largeAvatar = useMemo(() => {
    if (!user?.email) return null

    return createAvatar(shapes, { size: 48, seed: user.email }).toDataUri()
  }, [user?.email])

  const handleLogout = () => {
    modal.confirm({
      title: I18n.t('admin.header_logout_title'),
      content: I18n.t('admin.header_logout_content'),
      onOk () {
        window.location.href = '/administration/sign_out'
      },
      okButtonProps: { danger: true },
    })
  }

  const profileSubmenuItems: MenuProps['items'] = [
    {
      key: 'user_info',
      label: (
        <Flex gap={token.margin} align="center">
          <Avatar size={48} src={user?.photo || largeAvatar} icon={<Person />} />
          <Flex vertical justify="center">
            <Typography.Title level={5}>{user?.name}</Typography.Title>
            <Typography.Text>{user?.email}</Typography.Text>
            {user?.roleTitle && (
              <Typography.Text type="secondary">
                {`${I18n.t('admin.role')} - ${user.roleTitle}`}
              </Typography.Text>
            )}
          </Flex>
        </Flex>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'profile_details',
      label: I18n.t('admin.profile_details'),
      icon: <Person />,
      onClick: () => navigate('/admin/profile/details'),
    },
    { type: 'divider' },
    {
      key: 'change_password',
      label: I18n.t('shared.change_password'),
      icon: <Lock />,
      onClick: () => navigate('/admin/profile/change_password'),
    },
    ...(isMobile && localeOptions.length ? [
      { type: 'divider' as const },
      {
        key: 'language',
        label: I18n.t('admin.language'),
        icon: <Translate />,
        onClick: () => setLanguageOpen(true),
      },
    ] : []),
    ...(THEME_SWITCHER_ENABLED ? [
      { type: 'divider' as const },
      {
        key: 'appearance',
        label: <SchemeScope size="medium"><AppearanceMenuItem /></SchemeScope>,
        // Clicking inside the panel changes appearance and must not dismiss the menu.
        onClick: (info: { domEvent: React.SyntheticEvent }) => info.domEvent.stopPropagation(),
        style: { height: 'auto', cursor: 'default' },
      },
    ] : []),
    { type: 'divider' },
    {
      key: 'logout',
      label: I18n.t('admin.navigation_logout'),
      icon: <Logout />,
      onClick: handleLogout,
    },
  ]

  return (
    <>
      <Dropdown
        menu={{ items: profileSubmenuItems }}
        trigger={['click']}
        placement="bottomRight"
      >
        <Button type="text">
          <Flex gap={token.marginXXS} align="center">
            <Avatar size={32} src={user?.photo || largeAvatar} icon={<Person />} />
            {!isMobile && user?.firstName ? (
              <Flex gap={token.marginXXS} align="center">
                <Typography.Text>{user?.firstName}</Typography.Text>
                <ExpandMore />
              </Flex>
            ) : null}
          </Flex>
        </Button>
      </Dropdown>
      <Drawer
        open={languageOpen}
        onClose={() => setLanguageOpen(false)}
        title={I18n.t('admin.language')}
        placement="bottom"
        size="100%"
        closable
      >
        <Menu
          mode="vertical"
          selectedKeys={[currentLocale]}
          items={localeOptions.map(option => ({
            key: option.key,
            label: option.label,
            icon: option.key === currentLocale ? <Check /> : undefined,
          }))}
          onClick={({ key }) => changeAdminLocale(key)}
        />
      </Drawer>
    </>
  )
}
