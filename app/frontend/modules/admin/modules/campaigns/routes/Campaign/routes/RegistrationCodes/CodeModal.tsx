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
            label={I18n.t('admin.form_name')}
            rules={[{ required: true }]}
          >
            <Input name="registraion_code_name" />
          </Form.Item>
          <Form.Item
            name="code"
            label={I18n.t('admin.form_code')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="totalCount"
            label={I18n.t('admin.form_total_count')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="startDate"
            label={I18n.t('admin.form_start_date')}
            rules={[{ required: true }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" className={styles.datepicker} />
          </Form.Item>
          <Form.Item
            name="endDate"
            label={I18n.t('admin.form_end_date')}
            rules={[{ required: true }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" className={styles.datepicker} />
          </Form.Item>
          <Form.Item
            name="disabled"
            label={I18n.t('admin.form_active')}
            valuePropName="checked"
          >
            <Checkbox>{I18n.t('admin.form_active')}</Checkbox>
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
