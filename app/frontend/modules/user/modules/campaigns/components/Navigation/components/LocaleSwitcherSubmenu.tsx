import React, { FC } from 'react'
import { Menu } from 'antd'
import {
  LoadingOutlined,
  DownOutlined,
} from '@ant-design/icons'

import styles from '../styles.scss'

const { I18n } = window

interface LocaleSwitcherSubmenuProps {
    isLocaleSwitcherHidden: boolean
    isLocaleLoading: boolean
    handleLocaleChange: (localeKey: string) => Promise<void>
  }

export const LocaleSwitcherSubmenu: FC<LocaleSwitcherSubmenuProps> = ({
  isLocaleSwitcherHidden,
  isLocaleLoading,
  handleLocaleChange,
  ...restMenuProps
}) => {
  const currentLocale: string = I18n.currentLocale()
  const locales: string[] = I18n.availableLocales

  const localesWithoutCurrentLocale = locales.filter(
    locale => locale !== currentLocale,
  )

  if (isLocaleSwitcherHidden || localesWithoutCurrentLocale.length === 0) {
    return null
  }

  let localeSubmenuTitle: JSX.Element = (
    <>
      <span>
        {currentLocale.toUpperCase()}
        {' '}
      </span>
      <DownOutlined />
    </>
  )
  if (isLocaleLoading) {
    localeSubmenuTitle = (
      <>
        <span className="me-2">
          {I18n.t('threesixty.assesment.navigation.menu.switching-lang')}
        </span>
        {' '}
        <LoadingOutlined spin className={styles.overideMargin} />
      </>
    )
  }

  return (
    <Menu.SubMenu
      key="language"
      title={localeSubmenuTitle}
      disabled={isLocaleLoading}
      {...restMenuProps}
    >
      {localesWithoutCurrentLocale.map(locale => (
        <Menu.Item key={locale} onClick={() => handleLocaleChange(locale)}>
          {I18n.t(`languages.${locale}`)}
        </Menu.Item>
      ))}
    </Menu.SubMenu>
  )
}
