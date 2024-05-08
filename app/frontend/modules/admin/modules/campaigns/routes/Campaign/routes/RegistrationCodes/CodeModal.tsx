import React from 'react'
import {
  Form, Input, Checkbox, DatePicker,
} from 'antd'
import ResourceFormModal from '~/components/ResourceFormModal'
import styles from './styles.less'

const { TextArea } = Input
const { I18n } = window

interface Props {
  campaignId: number
  close(): void
  code?: {
    id: number
    startDate: Date,
    endDate: Date
  }
}

const CodeFormModal: React.FC<Props> = ({
  campaignId,
  close,
  code,
}) => {
  const transformValues = values => ({
    ...values,
    id: code && code.id,
    disabled: !values.disabled,
    startDate: values.startDate.format(),
    endDate: values.endDate.format(),
  })

  return (
    <ResourceFormModal
      resourceName="registrationCodes"
      readableResourceName={I18n.t('registration_code.modals.title')}
      requestScope="campaigns"
      resourceBaseUrl={`/administration/new_campaigns/${campaignId}/registration_codes`}
      resource={code}
      showSuccessMessages
      close={close}
      modalProps={{ width: 550 }}
      transformValues={transformValues}
    >
      {() => (
        <>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true }]}
          >
            <Input name="registraion_code_name" />
          </Form.Item>
          <Form.Item
            name="code"
            label="Code"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="totalCount"
            label="Total count"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[{ required: true }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" className={styles.datepicker} />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="End Date"
            rules={[{ required: true }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" className={styles.datepicker} />
          </Form.Item>
          <Form.Item
            name="disabled"
            label="Active"
            valuePropName="checked"
          >
            <Checkbox>Active</Checkbox>
          </Form.Item>
          <Form.Item
            name="restrictedDomains"
            label={I18n.t('registration_code.allowed_domains')}
          >
            <TextArea
              placeholder={I18n.t('registration_code.one_domain_per_line')}
              autoSize={{ minRows: 2, maxRows: 5 }}
            />
          </Form.Item>
        </>
      )}
    </ResourceFormModal>
  )
}

export default CodeFormModal
