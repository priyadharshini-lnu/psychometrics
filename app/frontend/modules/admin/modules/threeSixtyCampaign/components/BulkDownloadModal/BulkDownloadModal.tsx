import { useState } from 'react'
import {
  Modal, Button, Select,
} from 'antd'

export interface OwnProps {
  allLocales: string[]
  defaultLocale: string
  visible: boolean
  onConfirm(selectedLocales: string[]): void
}

const { I18n } = window
const { Option } = Select

export default function BulkDownloadModal ({
  allLocales, defaultLocale, visible, close, onConfirm,
}) {
  const locales = [defaultLocale, ...allLocales]

  const [selectedLocales, setSelectedLocales] = useState<string[]>([defaultLocale])

  const handleBulkDownload = () => {
    onConfirm(selectedLocales)
    close()
  }

  return (
    <Modal
      width={650}
      title="Bulk Download Reports"
      open={visible}
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>{I18n.t('common.actions.cancel')}</Button>,
        <Button
          key="submit"
          onClick={() => {
            handleBulkDownload()
          }}
        >
          Download
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
    </Modal>
  )
}
