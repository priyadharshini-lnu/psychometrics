import {
  FC, useState, useEffect, useCallback,
  useRef,
} from 'react'
import {
  Button, Form, Input, Select, Table, message, Space,
  Dropdown,
  Row,
} from 'antd'
import type { InputRef, MenuProps } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { v4 as uuidv4 } from 'uuid'
import styles from './CampaignFactorsForm.less'
import { DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import BulkUploadModal from './BulkUploadModal'

const { I18n } = window

export type CampaignFactor = {
  outputType: string
  name: string
  code: string
  key: string
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

export const CampaignFactorsForm: FC<Props> = ({
  factors,
  saveCampaignFactors,
  onSaveCampaignFactors,
}) => {
  const [form] = Form.useForm()
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const [formData, setFormData] = useState<CampaignFactor[]>([])
  const [bulkUpload, setBulkUpload] = useState(false)
  const lastRowRef = useRef<InputRef>(null)

  useEffect(() => {
    if (formData.length) return
    const initializedData = factors.map(factor => ({
      ...factor,
      outputType: factor.outputType || CAMPAIGN_FACTORS_TYPES[0],
      key: factor.key || uuidv4(),
    }))
    setFormData(initializedData)
    form.setFieldsValue({ items: initializedData })
  }, [factors])

  useEffect(() => {
    if (lastRowRef.current?.input && lastRowRef.current?.input?.scrollIntoView) {
      lastRowRef.current?.input?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [lastRowRef.current?.input])

  const onValuesChange = (_: unknown, allValues: { items: CampaignFactor[] }) => {
    setFormData(prevData => prevData.map((row, index) => ({
      ...row,
      ...(allValues.items[index] || {}),
    })))
  }

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

  const removeRow = (key: string) => {
    setFormData(prevData => prevData.filter(row => row.key !== key))
    form.setFieldsValue({ items: formData.filter(row => row.key !== key) })
    setSelectedRowKeys(selectedRowKeys.filter(k => k !== key))
  }

  const handleBulkUpload = (cfs: {code: string, name: string, outputType: string}[]) => {
    const newEntries = cfs.map(cf => ({
      ...cf,
      key: uuidv4(),
    }))
    setFormData((prev) => {
      const updatedData = [...prev, ...newEntries]
      form.setFieldsValue({ items: updatedData })
      return updatedData
    })
  }

  const handleToolSelection = useCallback((key: string) => {
    switch (key) {
      case 'importFactors':
        setBulkUpload(true)
        break
      default:
        break
    }
  }, [])

  const columns = [
    {
      title: I18n.t('administration.report_builder.campaign_factors.name'),
      dataIndex: 'name',
      render: (_: unknown, record: CampaignFactor, index: number) => (
        <Form.Item
          name={['items', index, 'name']}
          rules={[
            { required: true, message: 'Name is required' },
            {
              pattern: /^[^\s].*(?<!\s)$/,
              message: I18n.t('administration.report_builder.campaign_factors.no_boundary_space'),
            },
          ]}
          className={styles.formItem}
        >
          <Input placeholder="Name" ref={index === formData.length - 1 ? lastRowRef : undefined} />
        </Form.Item>
      ),
    },
    {
      title: I18n.t('administration.report_builder.campaign_factors.code'),
      dataIndex: 'code',
      render: (_: unknown, record: CampaignFactor, index: number) => (
        <Form.Item
          name={['items', index, 'code']}
          rules={[
            { required: true, message: 'Code is required' },
            {
              pattern: /^[a-z][a-z0-9_]*$/,
              message: I18n.t('administration.report_builder.campaign_factors.code_constraint'),
            },
          ]}
          className={styles.formItem}
        >
          <Input placeholder="Code" />
        </Form.Item>
      ),
    },
    {
      title: I18n.t('administration.report_builder.campaign_factors.type'),
      dataIndex: 'outputType',
      render: (_: unknown, record: CampaignFactor, index: number) => (
        <Form.Item
          name={['items', index, 'outputType']}
          rules={[{ required: true }]}
          className={styles.formItem}
        >
          <Select options={CAMPAIGN_FACTORS_TYPES.map(t => ({ label: t, value: t }))} />
        </Form.Item>
      ),
    },
    {
      title: I18n.t('administration.report_builder.campaign_factors.delete'),
      render: (_: unknown, record: CampaignFactor) => (
        <Button
          type="text"
          danger
          icon={<CloseOutlined />}
          onClick={() => removeRow(record.key)}
          data-testid="remove-button"
        />
      ),
      width: '110px',
    },
  ]

  const tools: MenuProps['items'] = [
    {
      label: I18n.t('administration.report_builder.campaign_factors.import_factors'),
      key: 'importFactors',
      onClick: () => handleToolSelection('importFactors'),
    },
  ]

  return (
    <>
      <Row className={styles.row}>
        <Dropdown
          menu={{ items: tools }}
          trigger={['click']}
          placement="bottomRight"
          className={styles.tools}
        >
          <Button>
            {I18n.t('administration.report_builder.campaign_factors.tools')}
            <DownOutlined />
          </Button>
        </Dropdown>
      </Row>
      <Form
        form={form}
        name="campaign_factors"
        autoComplete="off"
        onFinish={onFinish}
        initialValues={{ items: formData }}
        onValuesChange={onValuesChange}
      >
        <Table
          scroll={{ y: 320 }}
          rowKey={record => record.key}
          dataSource={formData}
          columns={columns}
          pagination={false}
          bordered
          className={styles.table}
        />
        <Space className={styles.footer}>
          <Button
            onClick={() => {
              const newRow = {
                name: '',
                code: '',
                outputType: CAMPAIGN_FACTORS_TYPES[0],
                key: uuidv4(),
              }
              setFormData(prev => [...prev, newRow])
              form.setFieldsValue({ items: [...formData, newRow] })
            }}
          >
            {I18n.t('administration.report_builder.campaign_factors.add_field')}
          </Button>
          <Button type="primary" htmlType="submit">
            {I18n.t('common.actions.update')}
          </Button>
        </Space>
      </Form>
      {bulkUpload && (
        <BulkUploadModal
          open={bulkUpload}
          close={() => setBulkUpload(false)}
          handleBulkUpload={handleBulkUpload}
        />
      )}
    </>
  )
}
