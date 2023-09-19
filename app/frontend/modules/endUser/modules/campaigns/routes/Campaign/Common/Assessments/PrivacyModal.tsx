import { FC, MouseEventHandler } from 'react'
import {
  Button, Modal,
  Typography,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from 'modules/endUser/core/rootReducers'
import { SafeHTML } from '~/components/SafeHTML'
import {
  getCustomPrivacyConsentText, getlighthousePrivacyUrl, getprivacyPolicyVersion,
} from '~/modules/endUser/core/config'

const { I18n } = window
const { Paragraph } = Typography

const connector = connect(
  (state: RootState) => ({
    lighthousePrivacyUrl: getlighthousePrivacyUrl(state),
    privacyPolicyVersion: getprivacyPolicyVersion(state),
    customPrivacyConsentText: getCustomPrivacyConsentText(state),
  }),
  {},
)

type OwnProps = {
  accept: (version: number) => void,
  show: boolean,
  close: MouseEventHandler<HTMLElement>,
}

type PropsFromRedux = ConnectedProps<typeof connector>
type Props = OwnProps & PropsFromRedux


export const PrivacyModalComponent: FC<Props> = ({
  accept, show, close, lighthousePrivacyUrl, privacyPolicyVersion, customPrivacyConsentText,
}) => (
  <Modal
    title={(
      <div className="help-modal-header">
        {I18n.t('threesixty.accept_privacy_modal.title')}
      </div>
      )}
    visible={show}
    onCancel={close}
    width={customPrivacyConsentText ? 800 : 600}
    footer={(
      <div>
        <Button type="primary" onClick={() => accept(privacyPolicyVersion)}>
          {I18n.t('threesixty.accept_privacy_modal.accept')}
        </Button>
        <Button danger onClick={close}>
          {I18n.t('threesixty.accept_privacy_modal.reject')}
        </Button>
      </div>
      )}
  >
    <Paragraph>
      {customPrivacyConsentText
        ? <SafeHTML html={customPrivacyConsentText} config="adminRichText" />
        : I18n.t('threesixty.accept_privacy_modal.text')
      }
    </Paragraph>
    {!customPrivacyConsentText && (
    <Paragraph>
      <a href={lighthousePrivacyUrl} target="_blank" rel="noreferrer">
        {I18n.t('threesixty.accept_privacy_modal.policy_link')}
      </a>
    </Paragraph>
    )}
  </Modal>
)

export const PrivacyModal = connector(PrivacyModalComponent)
