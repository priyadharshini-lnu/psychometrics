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

  const menu = (
    <Menu onClick={onSelect}>
      {_.map(locales, locale => (
        <Menu.Item key={locale}>
          {I18n.t(`languages.${locale}`)}
        </Menu.Item>
      ))}
    </Menu>
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
                  {I18n.t(`languages.${current}`)}
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
