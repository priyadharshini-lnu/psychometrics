import React from 'react'
import {
  Form, Input, Switch,
} from 'antd'
import { useParams } from 'react-router-dom'
import { CreateResource, UpdateResource } from '~/hooks/useResources/interfaces'
import ResourceFormModal from '~/components/ResourceFormModal'
import { SamlServiceProvider } from '~/modules/admin/modules/client/core/samlServiceProviders'

const { I18n } = window

interface Props {
  addSamlServiceProvider: CreateResource<SamlServiceProvider | {projectId: string }>
  updateSamlServiceProvider: UpdateResource<SamlServiceProvider>
  saml_service_provider: SamlServiceProvider | null
  close(): void
}

export const AddEditSamlServiceProviderModal: React.FC<Props> = ({
  addSamlServiceProvider,
  updateSamlServiceProvider,
  saml_service_provider,
  close,
}) => {
  const { projectId } = useParams() as { projectId: string }

  return (
    <ResourceFormModal
      resourceName="saml_service_providers"
      resource={saml_service_provider || undefined}
      readableResourceName={I18n.t('admin.saml_service_provider')}
      showSuccessMessages
      close={close}
      scrollToFirstError
      modalProps={{ width: 620 }}
      request={{
        createResource: addSamlServiceProvider,
        updateResource: updateSamlServiceProvider,
      }}
      transformValues={(values: Record<string, unknown>) => {
        const transformedValues = {
          ...values,
          projectId: saml_service_provider ? undefined : projectId,
          acs_urls: typeof values.acs_urls === 'string'
            ? values.acs_urls.split(',').map((url: string) => url.trim()).filter(Boolean)
            : values.acs_urls,
        }
        return transformedValues
      }}
      formProps={{
        preserve: false,
        initialValues: (() => {
          const initialValues = saml_service_provider ? {
            enabled: saml_service_provider.enabled ?? true,
            mask_identity: saml_service_provider.maskIdentity ?? false,
            name: saml_service_provider.name || '',
            entity_id: saml_service_provider.entityId || '',
            acs_urls: Array.isArray(saml_service_provider.acsUrls) && saml_service_provider.acsUrls.length > 0
              ? saml_service_provider.acsUrls.join(', ')
              : '',
          } : {
            enabled: true,
            mask_identity: false,
            name: '',
            entity_id: '',
            acs_urls: '',
          }
          return initialValues
        })(),
      }}
    >
      {() => (
        <>
          <Form.Item
            name="enabled"
            label={I18n.t('admin.saml_service_provider_enabled')}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="mask_identity"
            label={I18n.t('admin.saml_service_provider_masking_enabled')}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="name"
            label={I18n.t('admin.saml_service_provider_name')}
            rules={[{ required: true, message: I18n.t('admin.saml_service_provider_name_required') }]}
          >
            <Input placeholder={I18n.t('admin.saml_service_provider_name_placeholder')} />
          </Form.Item>

          <Form.Item
            name="entity_id"
            label={I18n.t('admin.saml_service_provider_entity_id')}
            rules={[{ required: true, message: I18n.t('admin.saml_service_provider_entity_id_required') }]}
          >
            <Input placeholder={I18n.t('admin.saml_service_provider_entity_id_placeholder')} />
          </Form.Item>

          <Form.Item
            name="acs_urls"
            label={I18n.t('admin.saml_service_provider_acs_urls')}
            rules={[
              { required: true, message: I18n.t('admin.saml_service_provider_acs_urls_required') },
            ]}
          >
            <Input.TextArea
              placeholder={I18n.t('admin.saml_service_provider_acs_urls_placeholder')}
              rows={3}
              autoSize={{ minRows: 2, maxRows: 6 }}
            />
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}
