import React from 'react'
import {
  Alert, Modal, Select, Typography,
} from 'antd'
import { SafeHTML } from '~/components/SafeHTML'
import styles from './EmailPreviewModal.less'

const { I18n } = window

export interface EmailPreview {
  subject: string
  body: string
  rtl: boolean
  from: string
}

interface Props {
  preview: EmailPreview
  to: string
  date: string
  locale: string
  onLocaleChange: (locale: string) => void
  close(): void
}

const HeaderRow: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className={styles.headerRow}>
    <Typography.Text type="secondary" className={styles.headerLabel}>{label}</Typography.Text>
    <Typography.Text className={styles.headerValue}>{value || '-'}</Typography.Text>
  </div>
)

export const EmailPreviewModal: React.FC<Props> = ({
  preview, to, date, locale, onLocaleChange, close,
}) => (
  <Modal
    open
    title={I18n.t('admin.communication_email_preview_title')}
    onCancel={close}
    footer={null}
    width={800}
  >
    <Alert
      type="warning"
      showIcon
      title={I18n.t('admin.communication_email_preview_warning')}
      className={styles.warning}
    />
    <div className={styles.envelope}>
      <div className={styles.header}>
        <HeaderRow label={I18n.t('admin.communication_email_preview_from_label')} value={preview.from} />
        <HeaderRow label={I18n.t('admin.communication_email_preview_to_label')} value={to} />
        <HeaderRow label={I18n.t('admin.communication_email_preview_date_label')} value={date} />
        <div className={styles.headerRow}>
          <Typography.Text type="secondary" className={styles.headerLabel}>
            {I18n.t('admin.idp_locales')}
          </Typography.Text>
          <Select
            size="small"
            style={{ width: 160 }}
            value={locale}
            onChange={onLocaleChange}
            options={I18n.availableLocales.map((availableLocale: string) => ({
              value: availableLocale,
              label: I18n.t(`languages.${availableLocale}`),
            }))}
          />
        </div>
        <div className={styles.subjectRow}>
          <Typography.Text strong className={styles.subject}>{preview.subject}</Typography.Text>
        </div>
      </div>
      <div className={styles.body}>
        <SafeHTML
          html={preview.body}
          config="adminRichText"
          dir={preview.rtl ? 'rtl' : 'ltr'}
        />
      </div>
    </div>
  </Modal>
)
