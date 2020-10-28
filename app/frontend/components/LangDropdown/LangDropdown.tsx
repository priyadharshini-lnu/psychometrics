import React, { useState } from 'react'
import { Dropdown, Menu } from 'antd'
import { DownOutlined, LoadingOutlined } from '@ant-design/icons'
import _ from 'lodash'
import styles from './styles.scss'

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

  return (
    <div className={styles.container}>
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
    </div>
  )
}

export default LangDropdown
