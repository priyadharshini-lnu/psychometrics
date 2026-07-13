import {
  Form, Input, Alert, App, Radio,
} from 'antd'
import { useEffect } from 'react'
import { useResourceContext } from '~/modules/admin/components/Resource'
import ResourceFormModal from '~/components/ResourceFormModal'
import { OccupationConditionSet, OccupationConditionSetTR } from './interfaces'

const { I18n } = window

export const OccupationConditionSetsFormModal: React.FC<{
  close: () => void
  occupationConditionSet?: OccupationConditionSet
  copying?: boolean
}> = ({ close, occupationConditionSet, copying = false }) => {
  const { resource } = useResourceContext<OccupationConditionSet>()
  const [form] = Form.useForm()
  const { message } = App.useApp()

  useEffect(() => {
    copying && form.setFieldsValue({ newName: `${occupationConditionSet?.name} - Copy` })
    !occupationConditionSet && form.setFieldsValue({ scoreType: 'raw' })
  }, [])


  const copyResource = (values: { newName: string }) => resource.memberAction({
    id: occupationConditionSet!.id,
    action: 'copy',
    method: 'post',
    updateStore: true,
    responseType: OccupationConditionSetTR,
    body: values,
  }).then(() => {
    message.success(I18n.t('admin.occupation_condition_set_copy_success'))
  })

  return (
    <ResourceFormModal
      title={copying ? I18n.t('admin.copy_occupation_condition_set') : null}
      resourceName="occupation_condition_sets"
      readableResourceName={I18n.t('admin.occupation_condition_sets')}
      close={close}
      modalProps={{ width: '50%' }}
      storeManager={{ form }}
      request={copying
        ? { createResource: copyResource }
        : { createResource: resource.createResource, updateResource: resource.updateResource }}
      resource={copying ? undefined : occupationConditionSet}
    >
      {
        () => (
          <>
            {copying && (
              <Alert
                title={I18n.t('admin.copy_occupation_condition_set_msg')}
                type="info"
                className="mb-3"
              />
            )}
            <Form.Item
              label={I18n.t('admin.name')}
              name={copying ? 'newName' : 'name'}
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            {!copying && (
              <Form.Item
                label={I18n.t('admin.score_type')}
                name="scoreType"
              >
                <Radio.Group>
                  <Radio value="raw">{I18n.t('admin.raw_score')}</Radio>
                  <Radio value="normed">{I18n.t('admin.norm_score')}</Radio>
                </Radio.Group>
              </Form.Item>
            )}
          </>
        )
      }
    </ResourceFormModal>
  )
}
