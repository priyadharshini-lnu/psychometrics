import React, { useState } from 'react'
import {
  Modal, Button, App, Input, Typography,
  Space,
} from 'antd'
import {
  LoadingOutlined, CheckOutlined, MailOutlined, InfoCircleOutlined,
} from '@ant-design/icons'
import { connect, ConnectedProps } from 'react-redux'
import isEmpty from 'lodash/isEmpty'
import {
  SAVE_SETTINGS,
  saveSettings,
  State as SmtpSetting,
} from '~/modules/admin/modules/client/core/smtpSetting'
import { RootState } from '~/modules/admin/core/rootReducers'
import { isRequestInProgress } from '~/core/request'
import ErrorAlertBox from '~/components/ErrorAlertBox'


const connecter = connect(
  (state: RootState) => ({
    loading: isRequestInProgress(state, SAVE_SETTINGS),
  }),
  {
    saveSettings,
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

const TestEmailModalComponent: React.FC<Props> = ({
  loading, projectId, smtpSetting, saveSettings, close,
}) => {
  const [email, setEmail] = useState<string>('')
  const [errors, setErrors] = useState(null)
  const { message } = App.useApp()

  const handleOnSubmit = () => {
    saveSettings(projectId, smtpSetting.id, { ...smtpSetting, testEmailId: email }).then(() => {
      message.success(I18n.t('administration.smtp_settings.update_success_msg'))
    }).catch(setErrors)
      .finally(() => close())
  }

  return (
    <Modal
      width={650}
      title={I18n.t('administration.smtp_settings.test_email_modal.title')}
      open
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>{I18n.t('common.actions.cancel')}</Button>,
        <Button
          key="submit"
          onClick={handleOnSubmit}
          disabled={!email || loading}
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('common.actions.send')}
        </Button>,
      ]}
    >
      {!isEmpty(errors) && (
        <ErrorAlertBox errors={errors} className="mbm" />
      )}
      <Input
        placeholder={I18n.t('administration.smtp_settings.test_email_modal.input_placeholder')}
        prefix={<MailOutlined className="me-2" />}
        value={email as string}
        size="large"
        onChange={e => setEmail(e.target.value)}
        className="mb-4"
        required
      />
      <Typography.Text strong>
        <Space className="items-baseline">
          <InfoCircleOutlined />
          {I18n.t('administration.smtp_settings.test_email_modal.input_hint')}
        </Space>
      </Typography.Text>
    </Modal>
  )
}

export const TestEmailModal = connecter(TestEmailModalComponent)
