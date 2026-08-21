import React from 'react'
import {
  Form, Input, Select, Spin,
} from 'antd'
import { isSuperAdmin } from '~/core/currentUser'
import ResourceFormModal from '~/components/ResourceFormModal'
import { useCurrentUser } from '~/hooks/useCurrentUser'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { useResources } from '~/hooks/useResources'
import { Client } from '~/modules/admin/modules/client/core/clients'
import { Question } from '~/modules/admin/modules/QuestionCenter/core/questions'

type Props = {
  close(): void
}

const { I18n } = window

const CreateQuestionFormModal: React.FC<Props> = ({ close }) => {
  const { currentUser } = useCurrentUser()
  const { resource } = useResourceContext<Question>()

  const {
    data: clients,
    fetch: fetchClients,
    isLoading: isClientsLoading,
  } = useResources<Client>('clients')

  const createQuestion = (values: { name: string, ownerId?: string | null }) => {
    const { ownerId, ...rest } = values

    return resource.createResource({
      ...rest,
      ...(ownerId ? { ownerId: String(ownerId) } : {}),
      type: 'MultipleChoice',
      props: {},
      validation: {},
      requiredValidation: {},
      displayLogic: {},
      skipLogic: [],
      disabled: false,
      saveAsTemplate: false,
    })
  }

  const getOptionsForClients = () => {
    const clientsOptions: { label: string, value: number | string | null }[] = clients.map(({ id, name }) => ({
      label: name,
      value: +id,
    }))

    if (isSuperAdmin(currentUser)) {
      clientsOptions.unshift({ label: I18n.t('admin.platform_owner'), value: null })
    }

    return clientsOptions
  }

  return (
    <ResourceFormModal
      resourceName="questions"
      title={I18n.t('admin.questions_new_button')}
      readableResourceName={I18n.t('admin.questions_title')}
      close={close}
      scrollToFirstError
      showSuccessMessages
      modalProps={{ width: 550 }}
      request={{ createResource: createQuestion }}
    >
      {() => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('shared.name')}
            rules={[{ required: true, transform: value => value?.trim() }]}
          >
            <Input name="question_name" />
          </Form.Item>
          <Form.Item
            name="ownerId"
            label={I18n.t('shared.owner')}
            rules={[
              {
                validator: (_, value) => {
                  if (value !== undefined) return Promise.resolve()

                  return Promise.reject(new Error(I18n.t('admin.this_field_is_required')))
                },
              },
            ]}
          >
            <Select
              showSearch
              onSearch={(value) => {
                fetchClients({
                  apiConfig: { filter: { filterable_fields: value }, fields: { clients: ['name'] } },
                })
              }}
              notFoundContent={isClientsLoading('fetch') ? <Spin size="small" /> : null}
              filterOption={false}
              options={getOptionsForClients()}
            />
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}

export default CreateQuestionFormModal
