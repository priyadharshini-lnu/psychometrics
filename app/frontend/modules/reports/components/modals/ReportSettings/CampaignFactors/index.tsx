import {
  Button, Flex, Form, Input, Select,
  Typography,
  message,
} from 'antd'
import {
  CloseOutlined,
} from '@ant-design/icons'
import { connect } from 'react-redux'
import styles from './styles.less'
import { saveCampaignFactors } from '~/modules/reports/core/builder/actions'
import { RootState } from '~/modules/reports/core/rootReducers'

const connecter = connect(
  ({ report: { builder } }: RootState) => ({
    columns: builder.campaign_factors, id: builder.id,
  }),
  {
    saveCampaignFactors,
  },
)

const CAMPAIGN_FACTORS_TYPES = ['numeric', 'string']

type Column = {
  outputType: string
  name: string
  code: string
}

type Props = {
  saveCampaignFactors: (columns: Column[]) => void
  columns: Column[]
}

type FieldError = { [key: string]: string }

const isFieldUnique = (
  value: string,
  index: number,
  fieldName: keyof Column,
  columns: Column[],
) => (columns.every((column, i) => i === index || column[fieldName] !== value))

export const CampaignFactorsComponent = ({ columns, saveCampaignFactors }: Props) => {
  const [form] = Form.useForm()

  const onFinish = (values: { items: Column[] }) => {
    const validateField = (value: string, index: number, fieldName: keyof Column): FieldError => ({
      [fieldName]: isFieldUnique(value, index, fieldName, values.items) ? '' : `${fieldName}s must be unique`,
    })

    const validateFields = (
      fieldValues: string[],
      fieldName: keyof Column,
    ): FieldError[] => fieldValues.map((value, index) => validateField(value, index, fieldName))

    const nameErrors: FieldError[] = validateFields(values.items.map(column => column.name), 'name')
    const codeErrors: FieldError[] = validateFields(values.items.map(column => column.code), 'code')
    const setFields = (errors: FieldError[], fieldName: keyof Column) => form.setFields(
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
      message.success('Campaign factors updated successfully')
    }
  }

  return (
    <>
      <Typography.Title level={4}>Campaign Factors</Typography.Title>
      <Form
        form={form}
        name="campaign_factors"
        autoComplete="off"
        onFinish={onFinish}
        initialValues={{ items: columns }}
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
    </>
  )
}


export const CampaignFactors = connecter(CampaignFactorsComponent)
