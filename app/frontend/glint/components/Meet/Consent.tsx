import { Modal, Button } from 'antd'

type MeetConsentProps = {
  onConsent: () => void
  onDecline: () => void
}

const { I18n } = window

export const Consent = ({ onConsent, onDecline }: MeetConsentProps) => (
  <Modal
    title={(
      <span
        className="text-align-c width100percent inline-block"
      >
        {I18n.t('shared.recording_consent_title')}
      </span>
    )}
    open
    centered
    closable={false}
    footer={[
      <Button key="cancel" danger onClick={onDecline}>
        {I18n.t('shared.decline')}
      </Button>,
      <Button key="submit" type="primary" onClick={onConsent}>
        {I18n.t('shared.agree_and_continue')}
      </Button>,
    ]}
  >
    <p className="mt32 mb24">
      {I18n.t('shared.recording_consent_notice')}
    </p>
    <p className="mb24 weight-500">
      {I18n.t('shared.recording_consent_proceed_question')}
    </p>
  </Modal>
)
