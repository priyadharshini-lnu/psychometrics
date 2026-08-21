import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Row, Col, Form, Checkbox, Input, Select, Button,
} from 'antd'
import {
  ProjectGeneralSettings as GeneralSettingsType,
} from '~/modules/admin/modules/client/core/projectGeneralSettings'
import ResourceForm from '~/components/ResourceForm'
import { useResources } from '~/hooks/useResources/useResources'
import { CampaignDashboardInstructions } from './CampaignDashboardInstructions'

const { I18n } = window
const { availableLocales } = I18n

export const General: React.FC = () => {
  const { projectId } = useParams() as { projectId: string }
  const [form] = Form.useForm()
  const [enableLiveChatChecked, setEnableLiveChatChecked] = useState(false)

  const {
    data, fetchSingle,
  } = useResources<GeneralSettingsType>('projects')

  const [project] = data

  const { updateResource } = useResources<GeneralSettingsType>(
    'projects',
    {
      basePath: `clients/${project?.clientId}`,
    },
  )

  const transformValues = values => ({
    ...values,
    liveChatToken: values.enableLiveChat ? values.liveChatToken : null,
  })


  useEffect(() => {
    fetchSingle({
      id: projectId,
    })
  }, [projectId])

  useEffect(() => {
    if (project) {
      form.setFieldsValue(project)
      setEnableLiveChatChecked(project.enableLiveChat)
    }
  }, [project])

  return (
    <Row justify="space-between" className="pl" gutter={[24, 24]}>
      <Col sm={24} md={12} xl={12} xxl={10}>
        <ResourceForm
          resourceName="projects"
          resource={project}
          showSuccessMessages
          storeManager={{ form }}
          formProps={{
            labelAlign: 'left',
            id: 'edit_project_general_settings',
            preserve: false,
          }}
          request={{
            updateResource,
          }}
          transformValues={transformValues}
          scrollToFirstError
        >
          {() => (
            <>
              <Form.Item name="name" label={I18n.t('shared.name')} required>
                <Input name="general_settings_name" />
              </Form.Item>
              <Form.Item name="subdomain" label={I18n.t('admin.projects_general_settings_sub_domain_label')}>
                <Input name="general_settings_subdomain" />
              </Form.Item>
              <Form.Item
                name="number"
                label={I18n.t('admin.projects_general_settings_project_number_label')}
                required
              >
                <Input name="general_settings_number" />
              </Form.Item>

              <Form.Item name="locales" label={I18n.t('admin.projects_general_settings_locales_label')}>
                <Select mode="multiple">
                  {availableLocales.map(locale => (
                    <Select.Option key={locale} value={locale}>{I18n.t(`languages.${locale}`)}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="enableLiveChat" valuePropName="checked">
                <Checkbox
                  checked={enableLiveChatChecked}
                  onChange={(e) => {
                    setEnableLiveChatChecked(e.target.checked)
                  }}
                >
                  {I18n.t('admin.projects_general_settings_live_chat')}
                </Checkbox>
              </Form.Item>
              <Form.Item name="liveChatToken" label="Live Chat Token" hidden={!enableLiveChatChecked}>
                <Input />
              </Form.Item>

              <Button type="primary" htmlType="submit" className="mb-16">
                {I18n.t('admin.projects_general_settings_save_changes')}
              </Button>
            </>
          )}
        </ResourceForm>
      </Col>
      <Col sm={24} md={12} xl={12} xxl={12}>
        <CampaignDashboardInstructions />
      </Col>
    </Row>
  )
}
