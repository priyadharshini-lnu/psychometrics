import React, { useState } from 'react'
import {
  Button, Modal, Select,
} from 'antd'
import _ from 'lodash'

const { I18n } = window

interface Props {
  show: boolean
  locales: string[]
  close: () => void
  onSelect: (lang?: string) => void
}

export const LanguageModal: React.FC<Props> = ({
  locales, onSelect, show, close,
}) => {
  const [lang, setLang] = useState(_.first(locales))
  return (
    <Modal
      title={(
        <div className="help-modal-header">
          {I18n.t('campaign.language.title')}
        </div>
      )}
      visible={show}
      onCancel={close}
      footer={(
        <div>
          <Button type="primary" onClick={() => onSelect(lang)}>
            {I18n.t('campaign.language.proceed')}
          </Button>
          <Button danger onClick={() => close()}>
            {I18n.t('campaign.language.cancel')}
          </Button>
        </div>
      )}
    >
      <div className="help-modal-body">
        <div>
          {locales.length > 1
            ? I18n.t('campaign.language.content')
            : I18n.t('campaign.language.single_lang', { lang: I18n.t(`languages.${lang}`) })}
        </div>
        {locales.length > 1 && (
          <div>
            <Select value={lang} onChange={val => setLang(val)}>
              {_.map(locales, locale => (
                <Select.Option
                  key={locale}
                  value={locale}
                >
                  {I18n.t(`languages.${locale}`)}
                </Select.Option>
              ))}
            </Select>
          </div>
        )}
      </div>
    </Modal>
  )
}
