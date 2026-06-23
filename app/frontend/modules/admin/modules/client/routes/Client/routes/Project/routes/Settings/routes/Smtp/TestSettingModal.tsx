import React, { useState } from 'react'
import {
  Modal, Button, App, Input, Alert,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import isEmpty from 'lodash/isEmpty'
import { LoadingOutlined, CheckOutlined, MailOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import {
  TEST_SETTINGS,
  sendTestEmail,
  State as SmtpSetting,
} from '~/modules/admin/modules/client/core/smtpSetting'
import { RootState } from '~/modules/admin/core/rootReducers'
import { isRequestInProgress } from '~/core/request'


const connecter = connect(
  (state: RootState) => ({
    loading: isRequestInProgress(state, TEST_SETTINGS),
  }),
  {
    sendTestEmail,
  },
)

interface OwnProps {
  projectId: number
  smtpSetting: SmtpSetting
  close(): void
}

export type PropsFromRedux = ConnectedProps<typeof connecter>
export type Props = OwnProps & PropsFromRedux

const { I18n } = window

const TestSettingModalComponent: React.FC<Props> = ({
  loading, projectId, smtpSetting, sendTestEmail, close,
}) => {
  const [email, setEmail] = useState<string>('')
  const [errors, setErrors] = useState(null)
  const { message } = App.useApp()


  const handleOnSubmit = () => {
    sendTestEmail(projectId, smtpSetting, email)
      .then(() => {
        close()
        setErrors(null)
        message.success(I18n.t('admin.smtp_settings_test_modal_success_message', { email_id: email }), 5)
      })
      .catch(setErrors)
  }

  return (
    <Modal
      width={650}
      title={I18n.t('admin.smtp_settings_test_modal_title')}
      open
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>{I18n.t('common.actions.cancel')}</Button>,
        <Button
          key="submit"
          onClick={handleOnSubmit}
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('shared.send')}
        </Button>,
      ]}
    >
      {!isEmpty(errors) && (
        <Alert
          description={errors}
          type="error"
          className="mbm"
          showIcon
          message={null}
        />
      )}
      <Input
        placeholder="Enter email address"
        prefix={<MailOutlined className="me-2" />}
        value={email as string}
        size="large"
        onChange={e => setEmail(e.target.value)}
      />
    </Modal>
  )
}

export const TestSettingModal = connecter(TestSettingModalComponent)
