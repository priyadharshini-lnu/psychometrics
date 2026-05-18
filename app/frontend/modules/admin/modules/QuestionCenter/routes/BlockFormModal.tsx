import React from 'react'
import {
  Form, Input,
} from 'antd'
import { CreateResource, UpdateResource } from '~/hooks/useResources/interfaces'
import ResourceFormModal from '~/components/ResourceFormModal'
import { Block } from '~/modules/admin/modules/QuestionCenter/core/blocks'
import { AdditionRelationshipAttribute } from '~/libs/jsonApi/interfaces'

const { I18n } = window

interface Props {
    block: AdditionRelationshipAttribute<Block>
    addBlock: CreateResource<Block>
    updateBlock: UpdateResource<Block>
    close(): void
}

type BlockFormValues = {
  name: string
  props?: Record<string, unknown>
  position?: number
  disabled?: boolean
  save_as_template?: boolean
}

export const BlockFormModal: React.FC<Props> = ({
  block,
  addBlock,
  updateBlock,
  close,
}) => (
  <ResourceFormModal
    resourceName="blocks"
    resource={block}
    readableResourceName={I18n.t('admin.blocks_title') || 'Block'}
    showSuccessMessages
    close={close}
    scrollToFirstError
    modalProps={{ width: 620 }}
    request={{
      createResource: addBlock,
      updateResource: updateBlock,
    }}
    transformValues={(values: BlockFormValues) => ({
      ...values,
      ...(block ? {} : {
        props: {},
        position: 1, // Default position
        disabled: false,
        save_as_template: false,
      }),
    })}
  >
    {() => (
      <>
        <Form.Item
          name="name"
          label={I18n.t('shared.name')}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
      </>
    )}
  </ResourceFormModal>
)
