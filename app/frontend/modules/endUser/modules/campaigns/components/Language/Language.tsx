import React, { FC } from 'react'
import { Dropdown, Menu, Button } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import { useLocation } from 'react-router-dom'

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
    <Menu onClick={handleLanguageChange}>
      {availableTranslations.map(lang => (
        <Menu.Item key={lang}>
          {I18n.t(`languages.${lang}`)}
        </Menu.Item>
      ))}
    </Menu>
  )

  return (
    <Dropdown trigger={['click']} overlay={() => LangMenu()}>
      <Button type="link">
        {I18n.t(`languages.${(selectedLanguage && selectedLanguage.code) || 'en'}`)}
        {' '}
        <DownOutlined />
      </Button>
    </Dropdown>
  )
}
