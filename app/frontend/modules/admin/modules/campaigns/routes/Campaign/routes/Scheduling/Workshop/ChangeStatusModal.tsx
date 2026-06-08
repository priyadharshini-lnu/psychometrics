import React from 'react'
import { Form, Radio } from 'antd'
import { Workshop } from '~/modules/admin/modules/campaigns/core/workshop'
import ResourceFormModal from '~/components/ResourceFormModal'
import { MemberAction } from '~/hooks/useResources/interfaces'

const { I18n } = window

interface Props {
  workshop: Workshop
  memberAction: MemberAction
  close: () => void
}

export const ChangeStatusModal: React.FC<Props> = ({ workshop, memberAction, close }) => (
  <ResourceFormModal
    resource={workshop}
    resourceName="workshop"
    readableResourceName="Workshop"
    title={I18n.t('admin.scheduling_status_change_modal_title')}
    showSuccessMessages
    close={close}
    scrollToFirstError
    modalProps={{ width: 700 }}
    request={{
      updateResource: (values: Record<string, string>) => (
        memberAction({
          id: workshop.id, method: 'post', action: 'change_status', body: values, updateStore: true,
        })
      ),
    }}
  >
    {() => (
      <>
        {I18n.t('admin.scheduling_status_change_modal_content')}
        <Form.Item name="status">
          <Radio.Group>
            <Radio value="open">{I18n.t('admin.workshop_statuses_open')}</Radio>
            <Radio value="closed">{I18n.t('admin.workshop_statuses_closed')}</Radio>
          </Radio.Group>
        </Form.Item>
      </>
    )}
  </ResourceFormModal>
)
