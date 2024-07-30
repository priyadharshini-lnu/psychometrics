import React, { useState } from 'react'
import { Dropdown, Flex, Space } from 'antd'
import { DownOutlined, LoadingOutlined } from '@ant-design/icons'
import _ from 'lodash'
import { useMedia } from 'react-use-media'
import { LanguageIcon } from '~/glint/icons/LanguageIcon'
import styles from './styles.less'

const { I18n } = window
const defaultLocales = I18n.availableLocales
const defaultCurrentLocale = I18n.locale

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  changeLocale: (locale: string) => any
  locales?: string[]
  current?: string,
}

const LangDropdown: React.FC<Props> = ({
  locales, current, changeLocale,
}) => {
  const [loading, setLoading] = useState(false)
  const availableLocales = locales || defaultLocales
  const availableCurrentLocale = current || defaultCurrentLocale
  const isMobile = useMedia({
    maxWidth: 600,
  })

  const onSelect = ({ key }) => {
    setLoading(true)
    changeLocale(key).then(() => { location.reload() })
  }

  const menuItems = _.map(availableLocales, locale => (
    locale !== availableCurrentLocale ? (
      { key: locale, label: I18n.t(`languages_localized.${locale}`) }
    ) : null
  ))

  if (availableLocales?.length <= 1) return null

  return (
    <div>
      <Space>
        <Dropdown menu={{ items: menuItems, onClick: onSelect }} trigger={['click']}>
          <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
            <Flex align="center" gap={4} flex={0}>
              <LanguageIcon className={styles.icon} />
              {loading
                ? <LoadingOutlined />
                : (
                  <span>
                    {isMobile ? null
                      : I18n.t(`languages_localized.${availableCurrentLocale}`)}
                    {' '}
                    <DownOutlined />
                  </span>
                )}
            </Flex>
          </a>
        </Dropdown>
      </Space>
    </div>
  )
}

export default LangDropdown
