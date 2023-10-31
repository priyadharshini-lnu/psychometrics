import React, { useState } from 'react'
import {
  Modal, Button, Form, Select, message,
} from 'antd'
import { LoadingOutlined, CheckOutlined } from '@ant-design/icons'
import { connect, ConnectedProps } from 'react-redux'
import {
  updateAvailableLocales,
  UPDATE_AVAILABLE_LOCALES,
} from '~/modules/admin/modules/campaigns/core/assessments/actions'
import { RootState } from '~/modules/admin/core/rootReducers'
import { isRequestInProgress } from '~/core/request'

const connecter = connect(
  (state: RootState) => ({
    loading: isRequestInProgress(state, UPDATE_AVAILABLE_LOCALES),
  }),
  {
    updateAvailableLocales,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>


const { I18n } = window
const { Option } = Select

export interface OwnProps {
  close(): void
  campaignAssessmentId: number,
  campaignId: number
  allLocales: string[]
  availableLocales: string[]
}

export type Props = OwnProps & PropsFromRedux

const UpdateLocalesModal: React.FC<Props> = ({
  close, campaignId, updateAvailableLocales, campaignAssessmentId, allLocales, availableLocales, loading,
}) => {
  const [form] = Form.useForm()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_fields, setFields] = useState({})

  const handleUpdate = (params: { availableLocales: string[] }) => {
    updateAvailableLocales(campaignId, campaignAssessmentId, params).then(() => {
      message.success(I18n.t('campaign_assessment.modals.update_locales.success_msg'))
      close()
    })
  }

  return (
    <Modal
      width={650}
      title={I18n.t('campaign_assessment.modals.update_locales.title')}
      open
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>{I18n.t('common.actions.cancel')}</Button>,
        <Button
          key="submit"
          onClick={() => {
            form.submit()
          }}
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('common.actions.update')}
        </Button>,
      ]}
    >
      <Form
        name="basic"
        form={form}
        onFinish={handleUpdate}
        initialValues={{ availableLocales }}
        onFieldsChange={(_, allFields) => {
          setFields(allFields)
        }}
      >
        <Form.Item name="availableLocales">
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder={I18n.t('campaign_assessment.modals.update_locales.select_locales')}
          >
            {allLocales.map(locale => (
              <Option
                key={locale}
                value={locale}
              >
                {locale}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default connecter(UpdateLocalesModal)
