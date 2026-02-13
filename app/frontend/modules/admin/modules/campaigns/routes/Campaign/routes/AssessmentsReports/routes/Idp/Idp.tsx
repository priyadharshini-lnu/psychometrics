import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Select, Button, Checkbox, Form, Card, Typography,
  message, Drawer, Space, Popover,
} from 'antd'
import { InfoCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { CampaignIdpTR, CampaignIdp } from '~/modules/admin/modules/campaigns/core/campaignIdp'
import { useResources } from '~/hooks/useResources'
import { IdpTemplate, IdpTemplateTR } from '~/modules/admin/modules/campaigns/core/idp/index'
import ResourceForm from '~/components/ResourceForm'
import { AssessmentsForm } from
  '~/modules/admin/modules/campaigns/routes/Campaign/routes/AIArtifacts/Settings/AssessmentsForm'
import { transformAssessmentsToQuestions } from
  '~/modules/admin/modules/campaigns/routes/Campaign/routes/AIArtifacts/Settings/helpers'

const { I18n } = window

export const Idp = () => {
  const { campaignId, projectId } = useParams() as { campaignId: string, projectId: string }
  const [form] = Form.useForm()
  const [dependenciesForm] = Form.useForm()
  const [isDependencyConfigurationDrawerOpen, setIsDependencyConfigurationDrawerOpen] = useState(false)

  const {
    data, fetch, createResource, updateResource,
  } = useResources<CampaignIdp>(
    'campaign_idps',
    {
      basePath: `campaigns/${campaignId}`,
      responseType: CampaignIdpTR,
      apiConfig: {
        include: ['idp_template'],
      },
    },
  )

  const currentIdp = data[0]

  const {
    data: idpTemplates, fetch: fetchTemplates,
  } = useResources<IdpTemplate>(
    'idp_templates',
    {
      basePath: `projects/${projectId}`,
      trackUrl: true,
      responseType: IdpTemplateTR,
      apiConfig: {
        filter: { status_eq: 'published' },
        fields: { idp_templates: ['name', 'description'] },
      },
    },
  )

  useEffect(() => {
    fetchTemplates()
    fetch()
  }, [])

  useEffect(() => {
    form.setFieldsValue({
      ...currentIdp,
      idpTemplateId: currentIdp?.idpTemplate?.id,
    })
  }, [data])

  const handleCancelDependencies = () => {
    dependenciesForm.resetFields()
    setIsDependencyConfigurationDrawerOpen(false)
  }

  return (
    <Space orientation="vertical" size="large" className="w-100">
      <Card title={I18n.t('idp_templates.assign_idp_template')}>
        <ResourceForm
          resourceName="campaign_idps"
          readableResourceName={I18n.t('idp_templates.idp_template')}
          resource={currentIdp}
          scrollToFirstError
          request={{
            createResource, updateResource,
          }}
          onSuccessfulSubmission={() => message.success(I18n.t('idp_templates.success_scheduled'))}
          transformValues={values => ({
            ...values,
            campaignId,
          })}
          storeManager={{ form }}
        >
          {({ status }) => (
            <>
              <Form.Item
                name="idpTemplateId"
                label={I18n.t('idp_templates.idp_template')}
              >
                <Select
                  showSearch
                  placeholder={I18n.t('idp_templates.placeholder')}
                  style={{ width: '400px' }}
                  options={idpTemplates.map((idpTemplate: IdpTemplate) => ({
                    label: idpTemplate.name,
                    value: idpTemplate.id,
                  }))}
                />
              </Form.Item>
              <Form.Item name="overrideExists" valuePropName="checked">
                <Checkbox defaultChecked={false}>
                  {I18n.t('idp_templates.override_exists')}
                </Checkbox>
              </Form.Item>
              <Form.Item name="automaticallyAssignNew" valuePropName="checked">
                <Checkbox defaultChecked={false}>
                  {I18n.t('idp_templates.auto_assign')}
                </Checkbox>
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={status === 'saving'}>
                {I18n.t('idp_templates.save_and_assign')}
              </Button>
            </>
          )}
        </ResourceForm>
      </Card>

      {!!currentIdp && (
        <Card title={I18n.t('shared.configurations')}>
          <Typography.Paragraph type="secondary">
            {I18n.t('admin.ai_idp_assistant_configure_dependencies_description')}
          </Typography.Paragraph>
          <Button
            type="primary"
            onClick={() => setIsDependencyConfigurationDrawerOpen(true)}
          >
            {I18n.t('admin.ai_idp_assistant_configure_dependencies')}
          </Button>
        </Card>
      )}
      <Drawer
        title={(
          <Space>
            {I18n.t('admin.ai_idp_assistant_configure_dependencies')}
            <Popover
              content={(
                <div style={{ maxWidth: 300 }}>
                  {I18n.t('admin.ai_idp_assistant_configure_dependencies_description')}
                </div>
              )}
            >
              <span>
                <InfoCircleOutlined style={{ cursor: 'pointer' }} />
              </span>
            </Popover>
          </Space>
        )}
        placement="right"
        onClose={handleCancelDependencies}
        open={isDependencyConfigurationDrawerOpen}
        size="large"
        closable={false}
        extra={(
          <Space>
            <Button onClick={handleCancelDependencies}>
              {I18n.t('common.actions.cancel')}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              form="dependencies-form"
            >
              {I18n.t('common.actions.submit')}
            </Button>
          </Space>
        )}
      >
        <ResourceForm
          resourceName="campaign_idps"
          readableResourceName={I18n.t('idp_templates.idp_template')}
          resource={currentIdp}
          request={{ updateResource }}
          onSuccessfulSubmission={() => {
            message.success(I18n.t('admin.ai_idp_assistant_dependencies_updated'))
            setIsDependencyConfigurationDrawerOpen(false)
            fetch()
          }}
          transformValues={(values) => {
            const questions = transformAssessmentsToQuestions(
              values.assessments as Record<string, { assessment: string; questions: string[] }>,
            )
            return {
              dependenciesAttributes: {
                questions,
              },
              campaignId,
              idpTemplateId: currentIdp.idpTemplate?.id,
            }
          }}
          storeManager={{ form: dependenciesForm }}
          formProps={{ id: 'dependencies-form' }}
        >
          {() => (
            <AssessmentsForm
              questions={currentIdp?.dependenciesAttributes?.questions}
              form={dependenciesForm}
            />
          )}
        </ResourceForm>
      </Drawer>
    </Space>
  )
}
