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
  <div
    className={className}
    style={vertical ? {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    } : {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      columnGap: 12,
      rowGap: 12,
      alignItems: 'start',
    }}
  >
    <Flex vertical gap={8}>
      <span>{I18n.t('admin.current_locale')}</span>
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
    </Flex>


    <Flex
      vertical
      align={vertical ? 'stretch' : 'flex-start'}
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
  </div>
)
