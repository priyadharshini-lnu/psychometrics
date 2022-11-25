import React, { useState } from 'react'
import { Dropdown, Menu, Space } from 'antd'
import { DownOutlined, LoadingOutlined } from '@ant-design/icons'
import _ from 'lodash'
import { LanguageIcon } from 'glint/icons/LanguageIcon'
import styles from './styles.less'

const { I18n } = window

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  changeLocale: (locale: string) => any
  locales: string[]
  current: string
}

const LangDropdown: React.FC<Props> = ({ locales, current, changeLocale }) => {
  const [loading, setLoading] = useState(false)

  const onSelect = ({ key }) => {
    setLoading(true)
    changeLocale(key).then(() => { location.reload() })
  }

  const menuItems = _.map(locales, locale => (
    locale !== current ? (
      { key: locale, label: I18n.t(`languages_localized.${locale}`) }
    ) : null
  ))

  const menu = (
    <Menu items={menuItems} onClick={onSelect} />
  )
  if (locales?.length <= 1) return null

  return (
    <div>
      <Space>
        <LanguageIcon className={styles.icon} />
        <Dropdown overlay={menu} trigger={['click']}>
          <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
            {loading
              ? <LoadingOutlined />
              : (
                <span>
                  {I18n.t(`languages_localized.${current}`)}
                  {' '}
                  <DownOutlined />
                </span>
              )}
          </a>
        </Dropdown>
      </Space>
    </div>
  )
}

export default LangDropdown
