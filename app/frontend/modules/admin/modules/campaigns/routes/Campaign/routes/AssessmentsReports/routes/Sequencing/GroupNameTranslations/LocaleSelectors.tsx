import { Flex, Select } from 'antd'

const { I18n } = window

export type LocaleSelectorsProps = {
  editingLocale: string
  referenceLocale: string | undefined
  availableLocales: string[]
  availableNameLocales: string[]
  onEditingLocaleChange: (locale: string) => void
  onReferenceLocaleChange: (locale: string | undefined) => void
}

export const LocaleSelectors = ({
  editingLocale,
  referenceLocale,
  availableLocales,
  availableNameLocales,
  onEditingLocaleChange,
  onReferenceLocaleChange,
}: LocaleSelectorsProps) => (
  <Flex justify="space-between">
    <Select value={editingLocale} className="width150px" onChange={onEditingLocaleChange}>
      {availableLocales.map(locale => (
        <Select.Option key={locale} value={locale}>
          {I18n.t(`languages.${locale}`)}
        </Select.Option>
      ))}
    </Select>
    <div>
      <span className="mr8">{I18n.t('common.text.reference_language')}</span>
      <Select
        className="width150px"
        placeholder={I18n.t('select')}
        onChange={onReferenceLocaleChange}
        value={referenceLocale}
        allowClear
      >
        {availableNameLocales.map(locale => (
          <Select.Option key={locale} value={locale}>
            {I18n.t(`languages.${locale}`)}
          </Select.Option>
        ))}
      </Select>
    </div>
  </Flex>
)
