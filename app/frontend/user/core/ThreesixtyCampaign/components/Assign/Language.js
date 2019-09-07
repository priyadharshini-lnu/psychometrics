import React from 'react'
import { Dropdown, Menu, Icon } from 'antd'

export default function Language ({ assignId, selectedLanguage, availableTranslations }) {
  const LangMenu = () => (
    <Menu>
      <Menu.Item key="en">
        <a href={`/assigns/${assignId}/pass?lang=en`}>
          {I18n.t('languages.en')}
        </a>
      </Menu.Item>
      {availableTranslations.map(lang => (
        <Menu.Item key={lang}>
          <a href={`/assigns/${assignId}/pass?lang=${lang}`}>
            {I18n.t(`languages.${lang}`)}
          </a>
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
