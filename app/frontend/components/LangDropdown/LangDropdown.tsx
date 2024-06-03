import React, { useState } from 'react'
import { Dropdown, Space, Button } from 'antd'
import { DownOutlined, LoadingOutlined } from '@ant-design/icons'
import _ from 'lodash'
import { useLocation } from 'react-router-dom'
import { LanguageIcon } from '~/glint/icons/LanguageIcon'
import styles from './styles.less'

const { I18n } = window
const defaultLocales = I18n.availableLocales
const defaultCurrentLocale = I18n.locale

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (locale: string) => any
  locales?: string[]
  currentLocale?: string
}

const LangDropdown: React.FC<Props> = ({ locales, currentLocale, onChange }) => {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const onSelect = ({ key }) => {
    setLoading(true)
    onChange(key)
  }

  const handleOpenChange = (open) => {
    setOpen(open)
  }

  const menuItems = _.map(locales, locale => (
    locale !== currentLocale ? (
      { key: locale, label: I18n.t(`languages_localized.${locale}`) }
    ) : null
  ))

  if (locales && locales?.length <= 1) return null

  return (
    <div>
      <Space>
        <LanguageIcon className={styles.icon} />
        <Dropdown
          autoFocus
          onOpenChange={handleOpenChange}
          menu={{ items: menuItems, onClick: onSelect }}
          trigger={['click']}
        >
          <Button
            aria-expanded={open}
            className="ps-0 pe-0"
            type="link"
            tabIndex={0}
            onClick={e => e.preventDefault()}
            aria-description={I18n.t('frontend.aria.lang_dropdown_description')}
          >
            {loading
              ? <LoadingOutlined />
              : (
                <span>
                  {I18n.t(`languages_localized.${currentLocale}`)}
                  {' '}
                  <DownOutlined aria-label="" />
                </span>
              )}
          </Button>
        </Dropdown>
      </Space>
    </div>
  )
}

// updates `lang` query param in URL
export const LangDropdownWithChangeUrl: React.FC<Omit<Props, 'onChange'>> = ({ locales, currentLocale }) => {
  const { search } = useLocation()
  const searchParams = new URLSearchParams(search)

  const handleLanguageChange = (key) => {
    searchParams.set('lang', key)
    window.location.search = searchParams.toString()
  }

  return (
    <LangDropdown
      locales={locales}
      currentLocale={currentLocale}
      onChange={handleLanguageChange}
    />
  )
}

// updates locale in I18n and reloads the page
export const LangDropdownWithChangeLocaleComponent: React.FC<Props> = ({ locales, currentLocale, onChange }) => {
  const availableLocales = locales || defaultLocales
  const availableCurrentLocale = currentLocale || defaultCurrentLocale

  return (
    <LangDropdown
      locales={availableLocales}
      currentLocale={availableCurrentLocale}
      onChange={(key) => {
        onChange(key).then(() => { location.reload() })
      }}
    />
  )
}

export default LangDropdown
