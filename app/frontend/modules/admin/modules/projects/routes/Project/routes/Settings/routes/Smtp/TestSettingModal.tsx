import React, { useState } from 'react'
import {
  Modal, Button, message, Input,
} from 'antd'
import { LoadingOutlined, CheckOutlined, MailOutlined } from '@ant-design/icons'
import { connect, ConnectedProps } from 'react-redux'
import {
  TEST_SETTINGS,
  sendTestEmail,
} from 'modules/admin/modules/projects/core/smtpSetting'
import { RootState } from 'modules/admin/core/rootReducers'
import { isRequestInProgress } from 'modules/admin/core/request'
import ErrorAlertBox from 'components/ErrorAlertBox'

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
  smtpSettingId: number
  close(): void
}

export type PropsFromRedux = ConnectedProps<typeof connecter>
export type Props = OwnProps & PropsFromRedux

const { I18n } = window

const TestSettingModalComponent: React.FC<Props> = ({
  loading, projectId, smtpSettingId, sendTestEmail, close,
}) => {
  const [email, setEmail] = useState<string>('')
  const [errors, setErrors] = useState(null)

  const handleOnSubmit = () => {
    sendTestEmail(projectId, smtpSettingId, email)
      .then(() => {
        close()
        setErrors(null)
        message.success(I18n.t('administration.smtp_settings.test_modal.success_message', { email_id: email }), 5)
      })
      .catch(setErrors)
  }

  return (
    <Modal
      width={650}
      title={I18n.t('administration.smtp_settings.test_modal.title')}
      visible
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>{I18n.t('common.actions.cancel')}</Button>,
        <Button
          key="submit"
          onClick={handleOnSubmit}
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('common.actions.send')}
        </Button>,
      ]}
    >
      <ErrorAlertBox errors={errors} className="mbm" />
      <Input
        placeholder="Enter email address"
        prefix={<MailOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
        value={email as string}
        size="large"
        onChange={e => setEmail(e.target.value)}
      />
    </Modal>
  )
}

export const TestSettingModal = connecter(TestSettingModalComponent)
