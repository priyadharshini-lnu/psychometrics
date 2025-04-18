import { Modal, Button } from 'antd'
import bg from '../../../../../endUser/modules/campaigns/routes/Insights/media/Background2.png'

const { I18n } = window

export default function DownloadReportModal ({
  visible,
  close,
  reportName,
  reportIcon,
  allLocales,
  defaultLocale,
  onConfirm,
  reportDownloadUrl,
}) {
  const locales = [defaultLocale, ...allLocales]

  const subjectReportDownloadUrl = reportDownloadUrl || {}

  const handleRegenerateReport = (locale) => {
    onConfirm([locale])
    close()
  }

  return (
    <Modal
      width={650}
      title={I18n.t('campaign_assessment.actions.download')}
      open={visible}
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>
          {I18n.t('common.actions.cancel')}
        </Button>,
      ]}
    >
      <div
        style={{
          maxHeight: 300,
          overflowY: 'auto',
          paddingRight: 10,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            justifyContent: 'center',
            alignItems: 'start',
          }}
        >
          {locales.map((locale) => {
            const downloadUrl = subjectReportDownloadUrl?.[locale] || null

            return (
              <div
                key={locale}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  minHeight: '180px',
                }}
              >
                {reportIcon ? (
                  <img src={reportIcon} alt={`Report for ${locale}`} width={100} height={100} />
                ) : (
                  <img src={bg} alt={`Report for ${locale}`} width={100} height={100} />
                )}
                <p
                  style={{
                    minHeight: '40px',
                    maxWidth: '120px',
                    textAlign: 'center',
                    wordBreak: 'break-word',
                    marginBottom: 8,
                  }}
                >
                  {reportName}
                  -[
                  {locale}
                  ]
                </p>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    downloadUrl ? window.open(downloadUrl, '_blank') : handleRegenerateReport(locale)
                  }}
                >
                  {downloadUrl ? I18n.t('user_reports.actions.download') : I18n.t('user_reports.actions.generate')}
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </Modal>
  )
}
