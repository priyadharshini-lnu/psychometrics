import React from 'react'
import {
  Form, Input, App,
  Select,
  Spin,
} from 'antd'

import { connect } from 'react-redux'
import { useResourceContext } from '~/modules/admin/components/Resource'
import { Question, QuestionTR } from '~/modules/admin/modules/QuestionCenter/core/questions'

import ResourceFormModal from '~/components/ResourceFormModal'
import { useResources } from '~/hooks/useResources'
import { Client } from '~/modules/admin/modules/client/core/clients'
import { RootState } from '~/modules/admin/core/rootReducers'
import { get as getCurrentUser, isSuperAdmin } from '~/core/currentUser'

const connecter = connect(
  (state: RootState) => ({
    currentUser: getCurrentUser(state),
  }),
)

type OptionsType = {
    id: string
  name: string | undefined
}

const { I18n } = window

interface Props {
    question: Question
    close(): void
  currentUser: unknown
}

type RequestFileds = {
    name: string
    ownerId?: string
}

const CopyQuestionFormModal: React.FC<Props> = ({
  question, close, currentUser,
}) => {
  const { message } = App.useApp()
  const { resource } = useResourceContext<Question>()

  const copy = (values: RequestFileds) => resource.memberAction({
    id: question.id,
    action: 'copy',
    method: 'post',
    updateStore: true,
    responseType: QuestionTR,
    body: values,
  }).then(() => {
    resource.setMeta({ ...resource.meta, recordCount: resource.meta?.recordCount ? resource.meta?.recordCount + 1 : 0 })
    message.success(I18n.t('shared.copied_successfully'))
  })

  const {
    data: clients, fetch: fetchClients, isLoading: isClientsLoading,
  } = useResources<Client>('clients')

  const getClients = (): OptionsType[] => {
    if (!question || !question.owner || clients.find(d => question?.owner?.id === d.id)) {
      return clients
    }

    return [...clients, question.owner]
  }

  return (
    <ResourceFormModal
      resourceName="questions"
      title={I18n.t('shared.copy')}
      readableResourceName={I18n.t('shared.question')}
      close={close}
      scrollToFirstError
      request={{ createResource: copy }}
      modalProps={{ width: 550 }}
      formProps={{
        initialValues: {
          name: `${question.name} (Copy)`,
          ownerId: question?.owner?.id,
        },
      }}
    >
      {() => (
        <>
          <Form.Item
            name="name"
            label={I18n.t('shared.name')}
            rules={[{ required: true, transform: value => value.trim() }]}
          >
            <Input name="question_name" />
          </Form.Item>
          <Form.Item
            name="ownerId"
            label={I18n.t('shared.owner')}
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
            >
              {isSuperAdmin(currentUser) && <Select.Option value="">{I18n.t('admin.platform_owner')}</Select.Option>}
              {getClients().map(({ id, name }) => (
                <Select.Option key={id} value={id}>{name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}

export default connecter(CopyQuestionFormModal)
