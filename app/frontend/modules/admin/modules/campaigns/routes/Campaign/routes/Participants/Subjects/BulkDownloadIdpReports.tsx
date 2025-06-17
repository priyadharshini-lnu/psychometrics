import React, { useState } from 'react'
import { LoadingOutlined, CheckOutlined } from '@ant-design/icons'
import {
  Button, Modal, message, Form, Select,
  Checkbox,
} from 'antd'
import {
  connect, ConnectedProps, useDispatch, useSelector,
} from 'react-redux'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  bulkDownloadIdpReports, DOWNLOAD_IDP_REPORTS,
} from '~/modules/admin/modules/campaigns/core/users'
import { isRequestInProgress } from '~/core/request'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    loading: isRequestInProgress(state, DOWNLOAD_IDP_REPORTS),
  }),
  {
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>
interface OwnProps {
  campaignId: number
  close(): void
  allowReflectionQuestions: boolean
}

const BulkDownloadIdpReports: React.FC<PropsFromRedux & OwnProps> = ({
  campaignId,
  allowReflectionQuestions = false,
  close,
}) => {
  const [form] = Form.useForm()
  const [, setFields] = useState({})
  const dispatch = useDispatch()
  const loading = useSelector((state: RootState) => isRequestInProgress(state, DOWNLOAD_IDP_REPORTS))

  const handleUpdate = (params) => {
    dispatch(bulkDownloadIdpReports(campaignId, params)).then((response) => {
      if (response.error) {
        message.error(I18n.t('administration.users.modals.download_idp_reports.error'))
      } else {
        message.success(I18n.t('administration.users.modals.download_idp_reports.success'))
        close()
      }
    }).catch((r) => {
      message.error(r?.[0] || I18n.t('administration.users.modals.download_idp_reports.error'))
    })
  }

  return (
    <Modal
      width={700}
      title={I18n.t('administration.users.modals.download_idp_reports.title')}
      open
      onCancel={close}
      footer={[
        <Button
          key="back"
          onClick={close}
        >
          {I18n.t('common.actions.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => {
            form.submit()
          }}
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('common.actions.send')}
        </Button>,
      ]}
    >
      <Form
        name="basic"
        form={form}
        onFinish={handleUpdate}
        onFieldsChange={(a, allFields) => {
          setFields(allFields)
        }}
      >
        <Form.Item name="lang">
          <Select
            options={I18n.availableLocales.map(locale => ({
              label: I18n.t(`languages_localized.${locale}`),
              value: locale,
            }))}
            placeholder={I18n.t('campaign.language.title')}
          />
        </Form.Item>
        {allowReflectionQuestions && (
          <Form.Item name="includeReflectiveQuestions" valuePropName="checked">
            <Checkbox>
              {I18n.t('administration.users.modals.download_idp_reports.include_reflective_questions')}
            </Checkbox>
          </Form.Item>
        )}
      </Form>
    </Modal>
  )
}


export default connecter(BulkDownloadIdpReports)
