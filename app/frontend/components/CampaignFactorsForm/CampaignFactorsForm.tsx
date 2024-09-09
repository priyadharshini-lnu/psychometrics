import { FC } from 'react'
import {
  Button, Flex, Form, Input, Select, message,
} from 'antd'
import {
  CloseOutlined,
} from '@ant-design/icons'
import styles from './CampaignFactorsForm.less'

export type CampaignFactor = {
  outputType: string
  name: string
  code: string
}

type FieldError = { [key: string]: string }

type Props = {
  factors: CampaignFactor[]
  saveCampaignFactors: (factors: CampaignFactor[]) => void
  onSaveCampaignFactors?: (formItems: CampaignFactor[]) => void
}

const CAMPAIGN_FACTORS_TYPES = ['numeric', 'string']

const isFieldUnique = (
  value: string,
  index: number,
  fieldName: keyof CampaignFactor,
  factors: CampaignFactor[],
) => (factors.every((column, i) => i === index || column[fieldName] !== value))

export const CampaignFactorsForm:FC<Props> = ({
  factors, saveCampaignFactors, onSaveCampaignFactors,
}) => {
  const [form] = Form.useForm()

  const onFinish = (values: { items: CampaignFactor[] }) => {
    const validateField = (value: string, index: number, fieldName: keyof CampaignFactor): FieldError => ({
      [fieldName]: isFieldUnique(value, index, fieldName, values.items) ? '' : `${fieldName}s must be unique`,
    })

    const validateFields = (
      fieldValues: string[],
      fieldName: keyof CampaignFactor,
    ): FieldError[] => fieldValues.map((value, index) => validateField(value, index, fieldName))

    const nameErrors: FieldError[] = validateFields(values.items.map(column => column.name), 'name')
    const codeErrors: FieldError[] = validateFields(values.items.map(column => column.code), 'code')
    const setFields = (errors: FieldError[], fieldName: keyof CampaignFactor) => form.setFields(
      errors.map((error, index) => ({
        name: ['items', index, fieldName],
        errors: error[fieldName] ? [error[fieldName]] : undefined,
      })),
    )

    setFields(nameErrors, 'name')
    setFields(codeErrors, 'code')

    const hasNoErrors = (errors: FieldError[], key: string) => errors.every(error => error[key] === '')
    if (hasNoErrors(nameErrors, 'name') && hasNoErrors(codeErrors, 'code')) {
      saveCampaignFactors(values.items)
      message.config({
        getContainer: () => document.getElementById('fixed_header') || document.body,
      })
      onSaveCampaignFactors && onSaveCampaignFactors(values.items)
      message.success('Campaign factors updated successfully')
    }
  }

  return (
    <Form
      form={form}
      name="campaign_factors"
      autoComplete="off"
      onFinish={onFinish}
      initialValues={{ items: factors }}
    >
      <div className={styles.headerContainer}>
        <div className={styles.header}>
          <div className={styles.headerItem}>Name</div>
          <div className={styles.headerItem}>Code</div>
          <div className={styles.headerItem}>Type</div>
        </div>
      </div>

      <Form.List name="items">
        {(fields, { add, remove }) => (
          <Flex vertical>
            <div className={styles.columnContainer}>
              {fields.map(field => (
                <div className={styles.container} key={field.key}>
                  <Form.Item
                    className={styles.formItem}
                    name={[field.name, 'name']}
                    rules={[
                      { required: true, message: 'Name is required' },
                      {
                        pattern: /^[^\s].*(?<!\s)$/,
                        message: 'Name cannot start or end with a space',
                      },
                    ]}
                  >
                    <Input placeholder="Name" />
                  </Form.Item>
                  <Form.Item
                    className={styles.formItem}
                    name={[field.name, 'code']}
                    rules={[
                      { required: true, message: 'Code is required' },
                      {
                        pattern: /^[a-z][a-z0-9_]*$/,
                        message: `Code must start with a lowercase letter and
                           can only contain lowercase letters, numbers, and underscores`,
                      },
                    ]}
                  >
                    <Input placeholder="Code" />
                  </Form.Item>
                  <Form.Item
                    className={styles.formItem}
                    name={[field.name, 'outputType']}
                    rules={[{ required: true }]}
                  >
                    <Select
                      popupClassName={styles.selectOptions}
                      options={CAMPAIGN_FACTORS_TYPES.map(t => ({ label: t, value: t }))}
                    />
                  </Form.Item>
                  <Button
                    data-testid="remove-button"
                    type="text"
                    danger
                    aria-label="Remove"
                    icon={<CloseOutlined />}
                    onClick={() => remove(field.name)}
                  />
                </div>
              ))}
            </div>
            <div className={styles.footer}>
              <Button
                key="add"
                onClick={() => add({
                  name: '', outputType: CAMPAIGN_FACTORS_TYPES[0], code: '',
                })}
              >
                Add Field
              </Button>
              <Flex gap="4px">
                <Button key="submit" type="primary" htmlType="submit">
                  Update
                </Button>
              </Flex>
            </div>
          </Flex>
        )}
      </Form.List>
    </Form>
  )
}
