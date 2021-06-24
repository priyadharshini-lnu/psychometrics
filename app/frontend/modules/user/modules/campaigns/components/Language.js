import React from 'react'
import { Dropdown, Menu, Button } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import qs from 'qs'

export default function Language ({ selectedLanguage, availableTranslations }) {
  const handleLanguageChange = ({ key }) => {
    const query = qs.parse(location.search.substr(1))
    query.lang = key
    window.location.search = qs.stringify(query)
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
      <Button>
        {I18n.t(`languages.${(selectedLanguage && selectedLanguage.code) || 'en'}`)}
        {' '}
        <DownOutlined />
      </Button>
    </Dropdown>
  )
}
