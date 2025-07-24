import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import {
  Select, Button, Checkbox, Form,
  message,
} from 'antd'
import { CampaignIdpTR, CampaignIdp } from '~/modules/admin/modules/campaigns/core/campaignIdp'
import { useResources } from '~/hooks/useResources'
import { IdpTemplate, IdpTemplateTR } from '~/modules/admin/modules/campaigns/core/idp/index'
import ResourceForm from '~/components/ResourceForm'

const { I18n } = window

export const Idp = () => {
  const { campaignId, projectId } = useParams() as { campaignId: string, projectId: string }
  const [form] = Form.useForm()

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

  return (
    <div>
      <h3>{I18n.t('idp_templates.assign_idp_template')}</h3>
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
        {() => (
          <>
            <Form.Item
              name="idpTemplateId"
              label={I18n.t('idp_templates.idp_template')}
              initialValue={currentIdp?.idpTemplate?.id}
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
            <Button type="primary" htmlType="submit">
              {I18n.t('idp_templates.save_and_assign')}
            </Button>
          </>
        )}
      </ResourceForm>
    </div>
  )
}
