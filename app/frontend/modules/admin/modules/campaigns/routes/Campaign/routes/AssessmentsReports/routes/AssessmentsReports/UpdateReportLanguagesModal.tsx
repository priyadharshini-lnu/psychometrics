import React, { useEffect, useState } from 'react'
import {
  Modal, Button, Form, Select, App,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import filter from 'lodash/filter'
import { LoadingOutlined, CheckOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import {
  updateDefaultAndAvailableLocales,
  UPDATE_DEFAULT_AND_AVAILABLE_LOCALES,
} from '~/modules/admin/modules/campaigns/core/reports'
import { RootState } from '~/modules/admin/core/rootReducers'
import { isRequestInProgress } from '~/core/request'

const connector = connect(
  (state: RootState) => ({
    loading: isRequestInProgress(state, UPDATE_DEFAULT_AND_AVAILABLE_LOCALES),
  }),
  {
    updateDefaultAndAvailableLocales,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connector>


const { I18n } = window

export interface OwnProps {
  close(): void
  id: string
  campaignId: string
  availableLanguages: string[]
  defaultLanguage:string
  reportLocales: string[]
}

export type Props = OwnProps & PropsFromRedux

const UpdateReportLanguagesModal: React.FC<Props> = ({
  close, campaignId,
  updateDefaultAndAvailableLocales,
  reportLocales,
  id,
  defaultLanguage,
  availableLanguages,
  loading,
}) => {
  const [form] = Form.useForm()
  const selectedDefaultLang = Form.useWatch('defaultLanguage', form)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_fields, setFields] = useState({})
  const { message } = App.useApp()

  const handleUpdate = (params: { availableLanguages: string[], defaultLanguage: string }) => {
    updateDefaultAndAvailableLocales(campaignId, id, params).then(() => {
      message.success(I18n.t('campaign_report.modals.update_languages.success_msg'))
      close()
    })
  }

  useEffect(() => {
    const availableLang = form.getFieldValue('availableLanguages')
    const newAvailableLang = filter(availableLang, l => l !== selectedDefaultLang)
    form.setFieldValue('availableLanguages', newAvailableLang)
  }, [selectedDefaultLang])

  return (
    <Modal
      width={650}
      title={I18n.t('campaign_report.modals.update_languages.title')}
      open
      onCancel={close}
      footer={[
        <Button key="back" onClick={close}>{I18n.t('common.actions.cancel')}</Button>,
        <Button
          key="submit"
          onClick={() => {
            form.submit()
          }}
          type="primary"
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('common.actions.update')}
        </Button>,
      ]}
    >
      <Form
        name="basic"
        form={form}
        layout="vertical"
        onFinish={handleUpdate}
        initialValues={{ availableLanguages, defaultLanguage }}
        onFieldsChange={(_, allFields) => {
          setFields(allFields)
        }}
      >
        { reportLocales.length > 0 && (
          <Form.Item
            name="defaultLanguage"
            label={I18n.t('campaign_report.modals.update_languages.default_language')}
          >
            <Select placeholder={I18n.t('campaign_report.modals.update_languages.select_default_language')}>
              {reportLocales.map(locale => (
                <Select.Option key={locale} value={locale}>{I18n.t(`languages.${locale}`)}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
        {
          reportLocales.length > 1 && (
            <Form.Item
              name="availableLanguages"
              label={I18n.t('campaign_report.modals.update_languages.other_available_languages')}
            >
              <Select
                mode="multiple"
                placeholder={I18n.t('campaign_report.modals.update_languages.select_languages')}
              >
                {reportLocales.filter(l => l !== selectedDefaultLang).map(locale => (
                  <Select.Option key={locale} value={locale}>{I18n.t(`languages.${locale}`)}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          )
        }
      </Form>
    </Modal>
  )
}

export default connector(UpdateReportLanguagesModal)
