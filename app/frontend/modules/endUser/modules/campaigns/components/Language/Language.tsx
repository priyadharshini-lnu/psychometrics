import { FC } from 'react'
import {
  Dropdown, Menu, Button, Space,
} from 'antd'
import { DownOutlined } from '@ant-design/icons'
import { useLocation } from 'react-router-dom'

import { LanguageIcon } from '~/glint/icons'

import styles from './Language.less'

const { I18n } = window

type LanguageObj = {
code: string,
name: string,
direction: string,
}
type Props = {
  selectedLanguage: LanguageObj,
  availableTranslations: string[]
}

export const Language: FC<Props> = ({ selectedLanguage, availableTranslations }) => {
  const { search } = useLocation()
  const searchParams = new URLSearchParams(search)

  const handleLanguageChange = ({ key }) => {
    searchParams.set('lang', key)
    window.location.search = searchParams.toString()
  }

  const LangMenu = () => (
    <Menu
      onClick={handleLanguageChange}
      items={availableTranslations.map(lang => (
        { key: lang, label: I18n.t(`languages.${lang}`) }
      ))}
    />
  )

  return (
    <Space>
      <LanguageIcon className="display-block" />
      <Dropdown trigger={['click']} overlay={() => LangMenu()}>
        <Button className={styles.btnLink} type="link">
          {I18n.t(`languages.${(selectedLanguage && selectedLanguage.code) || 'en'}`)}
          <DownOutlined />
        </Button>
      </Dropdown>
    </Space>
  )
}
