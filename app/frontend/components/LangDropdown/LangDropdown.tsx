import React, { useState } from 'react'
import { Dropdown, Space, Flex } from 'antd'
import _ from 'lodash'
import { useLocation } from 'react-router-dom'
import { useMedia } from 'use-media'
import cs from 'classnames'
import { DownOutlined, LoadingOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { LanguageIcon } from '~/glint/icons/LanguageIcon'
import { getLocalizedLanguageName } from '~/utils/locales'
import styles from './styles.less'

const { I18n } = window
const defaultLocales = I18n.availableLocales
const { locale } = document.body.dataset
const defaultCurrentLocale = locale || I18n.locale

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (locale: string) => any
  locales?: string[]
  currentLocale?: string
  withBg?: boolean
}

export const LangDropdown: React.FC<Props & { useLoading?: boolean }> = ({
  locales, currentLocale, onChange, withBg, useLoading = true,
}) => {
  const [loading, setLoading] = useState(false)
  const [openMenu, setOpenChange] = useState(false)
  const isMobile = useMedia({
    maxWidth: 600,
  })

  const onSelect = ({ key }) => {
    setLoading(useLoading)
    onChange(key)
  }

  const menuItems = _.map(locales, (locale) => {
    const localeItem = { key: locale, label: <span lang={locale}>{getLocalizedLanguageName(locale)}</span> }

    if (isMobile) {
      return localeItem
    }
    return (
      locale !== currentLocale ? (
        localeItem
      ) : null
    )
  })

  if (locales && locales?.length <= 1) return null

  return (
    <div>
      <Space>
        <Dropdown
          classNames={{ root: styles.dropdownContainer }}
          onOpenChange={setOpenChange}
          menu={{ items: menuItems, onClick: onSelect }}
          trigger={['click']}
        >
          <a aria-expanded={openMenu} href="" className={styles.link} onClick={e => e.preventDefault()}>
            <Flex
              className={cs(styles.container, { [styles.containerWithBg]: withBg })}
              align="center"
              gap={4}
              flex={0}
            >
              <LanguageIcon className={styles.icon} />
              {loading
                ? <LoadingOutlined />
                : (
                  <>
                    <span lang={currentLocale}>
                      {isMobile ? null
                        : getLocalizedLanguageName(currentLocale)}
                      {' '}
                      <DownOutlined />
                    </span>
                    <span className="sr-only">
                      {I18n.t('frontend.aria.change_language')}
                    </span>
                  </>
                )}
            </Flex>
          </a>
        </Dropdown>
      </Space>
    </div>
  )
}

// updates `lang` query param in URL

export const LangDropdownWithChangeUrl: React.FC<Omit<Props, 'onChange'> & {paramName?: string}> = ({
  locales = defaultLocales,
  currentLocale = defaultCurrentLocale,
  withBg,
  paramName = 'lang',
}) => {
  const { search } = useLocation()
  const searchParams = new URLSearchParams(search)

  const handleLanguageChange = (key) => {
    searchParams.set(paramName, key)
    window.location.search = searchParams.toString()
  }

  return (
    <LangDropdown
      locales={locales}
      currentLocale={currentLocale}
      onChange={handleLanguageChange}
      withBg={withBg}
    />
  )
}

// updates locale in I18n and reloads the page
export const LangDropdownWithChangeLocaleComponent: React.FC<Props> = ({
  locales, currentLocale, withBg, onChange,
}) => {
  const availableLocales = locales || defaultLocales
  const availableCurrentLocale = currentLocale || defaultCurrentLocale

  return (
    <LangDropdown
      locales={availableLocales}
      currentLocale={availableCurrentLocale}
      withBg={withBg}
      onChange={(key) => {
        onChange(key).then(() => { location.reload() })
      }}
    />
  )
}

export default LangDropdown
