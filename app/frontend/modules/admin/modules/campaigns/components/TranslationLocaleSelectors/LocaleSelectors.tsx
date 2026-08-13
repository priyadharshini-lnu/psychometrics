import { Flex, Select } from 'antd'

const { I18n } = window

export type LocaleSelectorsProps = {
  editingLocale: string
  referenceLocale: string | undefined
  availableLocales: string[]
  availableNameLocales: string[]
  className?: string
  vertical?: boolean
  onEditingLocaleChange: (locale: string) => void
  onReferenceLocaleChange: (locale: string | undefined) => void
}

export const LocaleSelectors = ({
  editingLocale,
  referenceLocale,
  availableLocales,
  availableNameLocales,
  className,
  vertical = false,
  onEditingLocaleChange,
  onReferenceLocaleChange,
}: LocaleSelectorsProps) => (
  <Flex
    vertical={vertical}
    justify="space-between"
    align={vertical ? 'stretch' : 'center'}
    gap={12}
    className={className}
  >
    <Select
      value={editingLocale}
      style={vertical ? { width: '100%' } : { width: 150, minWidth: 150 }}
      onChange={onEditingLocaleChange}
    >
      {availableLocales.map(locale => (
        <Select.Option key={locale} value={locale}>
          {I18n.t(`languages.${locale}`)}
        </Select.Option>
      ))}
    </Select>

    <Flex
      vertical={vertical}
      align={vertical ? 'stretch' : 'center'}
      gap={8}
      style={vertical ? undefined : { whiteSpace: 'nowrap' }}
    >
      <span>{I18n.t('common.text.reference_language')}</span>
      <Select
        style={vertical ? { width: '100%' } : { width: 150, minWidth: 150 }}
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
    </Flex>
  </Flex>
)
