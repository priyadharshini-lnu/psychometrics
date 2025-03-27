import { useState } from 'react'
import {
  Modal, Button, Select, Checkbox,
} from 'antd'

export interface OwnProps {
  allLocales: string[]
  defaultLocale: string
  visible: boolean
  onConfirm(selectedLocales: string[], forceRegenerate: boolean): void
}

const { I18n } = window
const { Option } = Select

export default function RegenerateReportModal ({
  allLocales, defaultLocale, visible, close, onConfirm,
}) {
  const locales = [defaultLocale, ...allLocales]

  const [forceRegenerate, setForceRegenerate] = useState(false)
  const [selectedLocales, setSelectedLocales] = useState<string[]>([defaultLocale])

  const handleRegenerateReport = () => {
    onConfirm(selectedLocales, forceRegenerate)
    close()
  }

  return (
    <Modal
      width={650}
      title="Regenerate Report"
      open={visible}
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>{I18n.t('common.actions.cancel')}</Button>,
        <Button
          key="submit"
          onClick={() => {
            handleRegenerateReport()
          }}
        >
          Regenerate
        </Button>,
      ]}
    >
      <Select
        mode="multiple"
        placeholder="select Locale"
        defaultValue={[defaultLocale]}
        onChange={(value: string[]) => {
          setSelectedLocales(value)
        }}
        style={{ width: '100%' }}
      >
        {locales.map(locale => (
          <Option
            key={locale}
            value={locale}
          >
            {locale}
          </Option>
        ))}
      </Select>
      <Checkbox
        className="mt-5"
        checked={forceRegenerate}
        onChange={e => setForceRegenerate(e.target.checked)}
      >
        Force Regenerate
      </Checkbox>
    </Modal>
  )
}
