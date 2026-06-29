import React from 'react'
import {
  Form, Input, Switch, Select, Alert,
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
            integration_type: saml_service_provider.integrationType || 'generic',
            name: saml_service_provider.name || '',
            entity_id: saml_service_provider.entityId || '',
            acs_urls: Array.isArray(saml_service_provider.acsUrls) && saml_service_provider.acsUrls.length > 0
              ? saml_service_provider.acsUrls.join(', ')
              : '',
          } : {
            enabled: true,
            mask_identity: false,
            integration_type: 'generic',
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
            noStyle
            shouldUpdate={(prevValues, currentValues) => (
              prevValues.integration_type !== currentValues.integration_type
            )}
          >
            {({ getFieldValue }) => {
              const integrationType = getFieldValue('integration_type')
              const isGeneric = integrationType === 'generic'

              if (isGeneric) {
                return (
                  <Form.Item
                    name="mask_identity"
                    label={I18n.t('admin.saml_service_provider_masking_enabled')}
                    valuePropName="checked"
                    tooltip={I18n.t('admin.saml_service_provider_masking_help_generic')}
                  >
                    <Switch />
                  </Form.Item>
                )
              }

              return (
                <Form.Item label={I18n.t('admin.saml_service_provider_masking_enabled')}>
                  <Alert
                    message={(
                      <span>
                        {I18n.t('admin.saml_service_provider_integration_masking_info')}
                        {' '}
                        <a
                          href={`/admin/projects/${projectId}/settings/privacy`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <strong>{I18n.t('admin.saml_service_provider_privacy_policy')}</strong>
                        </a>
                      </span>
                    )}
                    type="warning"
                    showIcon
                    style={{ marginBottom: 0 }}
                  />
                </Form.Item>
              )
            }}
          </Form.Item>

          <Form.Item
            name="integration_type"
            label={I18n.t('admin.saml_service_provider_integration_type')}
            rules={[{ required: true, message: I18n.t('admin.saml_service_provider_integration_type_required') }]}
          >
            <Select placeholder={I18n.t('admin.saml_service_provider_integration_type_placeholder')}>
              <Select.Option value="generic">{I18n.t('admin.saml_service_provider_integration_generic')}</Select.Option>
              <Select.Option value="yoodli">{I18n.t('admin.saml_service_provider_integration_yoodli')}</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="name"
            label={I18n.t('shared.name')}
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
