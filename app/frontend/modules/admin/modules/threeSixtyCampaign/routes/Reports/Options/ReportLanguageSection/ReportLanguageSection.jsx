import { useState, useEffect } from 'react'
import {
  Form, Select, Button, Col, App,
} from 'antd'
import { useParams } from 'react-router-dom'
import OptionSection from '~/modules/admin/components/Options/Section'


export default function ReportLanguageSection ({
  options,
  updateLanguages,
  campaignReportPermissions,
}) {
  const [isLoading, setIsLoading] = useState(false)

  const { reportLocales, defaultLanguage, availableLanguages } = options
  const { campaignId } = useParams()

  const [form] = Form.useForm()
  const { message } = App.useApp()

  const handleUpdate = async (payload) => {
    try {
      setIsLoading(true)

      await updateLanguages(payload, campaignId)
      message.success(I18n.t('reports.language_updated'), 5)
    } catch (_) {
      message.error(I18n.t('common.errors.something_wrong'), 5)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    form.setFieldsValue({
      defaultLanguage,
      availableLanguages,
    })
  }, [form, defaultLanguage, availableLanguages])

  return (
    <OptionSection label={I18n.t('reports.language')}>
      <Col lg={12} sm={24}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            defaultLanguage,
            availableLanguages,
          }}
          onFinish={handleUpdate}
        >
          {
          () => (
            <>
              <Form.Item
                name="defaultLanguage"
                label={I18n.t('reports.columns.default_language')}
              >
                <Select>
                  {reportLocales.map(locale => (
                    <Select.Option key={locale} value={locale}>{I18n.t(`languages.${locale}`)}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="availableLanguages"
                label={I18n.t('reports.columns.other_available_languages')}
              >
                <Select mode="multiple">
                  {reportLocales.filter(l => l !== (form.getFieldValue('defaultLanguage'))).map(locale => (
                    <Select.Option key={locale} value={locale}>{I18n.t(`languages.${locale}`)}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                disabled={!campaignReportPermissions.manageReportsOptions}
              >
                {I18n.t('reports.actions.update_language')}
              </Button>
            </>
          )
        }
        </Form>
      </Col>

    </OptionSection>
  )
}
