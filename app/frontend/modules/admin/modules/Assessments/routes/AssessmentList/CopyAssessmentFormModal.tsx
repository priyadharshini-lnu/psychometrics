import React from 'react'
import {
  Form, Input, App,
  Select,
  Spin,
  Switch,
} from 'antd'

import { connect } from 'react-redux'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { Assessment, AssessmentTR } from '~/modules/admin/modules/client/core/assessments'

import ResourceFormModal from '~/components/ResourceFormModal'
import { useResources } from '~/hooks/useResources'
import { Client } from '~/modules/admin/modules/client/core/clients'
import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'
import { MicrositeFields } from './ExternalAssessmentFields/MicrositeFields'

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
)

type OptionsType = {
  id: string
  name: string
}

const { I18n } = window

interface Props {
  assessment: Assessment
  close(): void
  currentUser
}

type RelationshipObject = { type: string, id: string }

type RequestFileds = {
  name: string
  owner?: RelationshipObject
  copyAsMicrosite?: boolean
  project?: RelationshipObject
  externalSettings?: { assessmentId: string }
}

const CopyAssessmentFormModal: React.FC<Props> = ({
  assessment, close, currentUser,
}) => {
  const { message } = App.useApp()
  const { resource } = useResourceContext<Assessment>()
  const [form] = Form.useForm()

  const isMicrositeSource = assessment.type === 'microsite'
  const canCopyAsMicrosite = assessment.type === 'common'
  const copyAsMicrosite = Form.useWatch('copyAsMicrosite', form)
  const showMicrositeFields = isMicrositeSource || (canCopyAsMicrosite && copyAsMicrosite)

  const copy = ({
    name, owner, project, externalSettings,
  }: RequestFileds) => resource.memberAction({
    id: assessment.id,
    action: 'copy',
    method: 'post',
    updateStore: true,
    responseType: AssessmentTR,
    body: showMicrositeFields ? {
      name, owner, project, externalSettings,
    } : { name, owner },
  }).then((response: Assessment) => {
    resource.setMeta({ ...resource.meta, recordCount: resource.meta?.recordCount ? resource.meta?.recordCount + 1 : 0 })
    message.success(I18n.t('assessments.actions.copy.success_message', { name: response.name }))
  })

  const {
    data: clients, fetch: fetchClients, isLoading: isClientsLoading,
  } = useResources<Client>('clients')

  const getClients = (): OptionsType[] => {
    if (!assessment || !assessment.owner || clients.find(d => assessment?.owner?.id === d.id)) {
      return clients
    }

    return [...clients, assessment.owner]
  }

  return (
    <ResourceFormModal
      resourceName="assessments"
      title={I18n.t('administration.assessments.copy.copy_assessment')}
      readableResourceName={I18n.t('administration.assessments.copy.copy_assessment')}
      close={close}
      scrollToFirstError
      request={{ createResource: copy }}
      modalProps={{ width: 550 }}
      storeManager={{ form }}
      formProps={{
        initialValues: {
          name: `${assessment.name} - ${I18n.t('administration.assessments.copy.copy')}`,
          ownerId: assessment?.owner?.id,
        },
      }}
    >
      {() => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('administration.assessments.copy.name')}
            rules={[{ required: true, transform: value => value.trim() }]}
          >
            <Input name="assessment_name" />
          </Form.Item>
          <Form.Item
            name="ownerId"
            label={I18n.t('common.column.owner')}
          >
            <Select
              showSearch={{
                filterOption: false,
                onSearch: (value) => {
                  fetchClients({
                    apiConfig: { filter: { filterable_fields: value }, fields: { clients: ['name'] } },
                  })
                },
              }}
              notFoundContent={isClientsLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')}
            >
              {isSuperAdmin(currentUser) && <Select.Option>TTE</Select.Option>}
              {getClients().map(({ id, name }) => (
                <Select.Option key={id} value={id}>{name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          {canCopyAsMicrosite && (
            <Form.Item
              name="copyAsMicrosite"
              label={I18n.t('admin.assessments_copy_as_microsite')}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          )}
          {showMicrositeFields && (
            <MicrositeFields form={form} handleAssessmentSelect={() => {}} />
          )}
        </>
      )}
    </ResourceFormModal>
  )
}

export default connecter(CopyAssessmentFormModal)
