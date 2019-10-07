import React from 'react'
import { Dropdown, Menu, Icon } from 'antd'
import qs from 'query-string'

export default function Language ({ selectedLanguage, availableTranslations }) {
  const handleLanguageChange = ({ key }) => {
    const query = qs.parse(location.search)
    query.lang = key
    window.location.search = qs.stringify(query)
  }

  const LangMenu = () => (
    <Menu onClick={handleLanguageChange}>
      <Menu.Item key="en">
        {I18n.t('languages.en')}
      </Menu.Item>
      {availableTranslations.map(lang => (
        <Menu.Item key={lang}>
          {I18n.t(`languages.${lang}`)}
        </Menu.Item>
      ))}
    </Menu>
  )

  return (
    <Dropdown trigger={['click']} overlay={() => LangMenu()}>
      <div>
        {I18n.t(`languages.${(selectedLanguage && selectedLanguage.code) || 'en'}`)}
        {' '}
        <Icon type="down" />
      </div>
    </Dropdown>
  )
}
