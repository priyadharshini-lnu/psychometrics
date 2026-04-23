import {
  FC, useState, useEffect,
  useRef, useCallback,
} from 'react'
import {
  Button, Form, Input, Table, message, Space, Row, Dropdown, type MenuProps,
  InputRef,
} from 'antd'
import { v4 as uuidv4 } from 'uuid'
import { DownOutlined, CloseOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import BulkUploadModal from './BulkUploadModal'
import { AiAssistant } from '~/modules/admin/modules/AiAssitant/core/aiAssistant'
import { AIAssistantSelector } from './AiAssistantSelector'
import styles from './CampaignAIArtifactsForm.less'
import { CampaignAIArtifact } from './types'

const { I18n } = window

type FieldError = { [key: string]: string }

type Props = {
    artifacts: CampaignAIArtifact[]
    saveCampaignAIArtifacts: (artifacts: CampaignAIArtifact[]) => void
    onSaveCampaignAIArtifacts?: (formItems: CampaignAIArtifact[]) => void
}

const isFieldUnique = (
  value: string,
  index: number,
  fieldName: keyof CampaignAIArtifact,
  artifacts: CampaignAIArtifact[],
) => (artifacts.every((column, i) => i === index || column[fieldName] !== value))

export const CampaignAIArtifactsForm: FC<Props> = ({
  artifacts,
  saveCampaignAIArtifacts,
  onSaveCampaignAIArtifacts,
}) => {
  const [form] = Form.useForm()
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const [formData, setFormData] = useState<CampaignAIArtifact[]>([])
  const [bulkUpload, setBulkUpload] = useState(false)
  const lastRowRef = useRef<InputRef>(null)

  const handleBulkUpload = (cfs: { code: string, name: string,
      aiAssistant: CampaignAIArtifact['aiAssistant'] }[]) => {
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

  const handleAiAssistantSelection = (index: number, assistantId: number, assistant: AiAssistant) => {
    const newData = formData.map((item, idx) => {
      if (idx !== index) {
        return item
      }
      return {
        ...item,
        aiAssistant: {
          id: assistantId,
          name: assistant.name,
          assistantOutputSchemaKeys: assistant.assistantOutputSchemaKeysAttributes || [],
        },
      }
    })

    setFormData(newData)
    form.setFieldsValue({ items: newData })
  }

  useEffect(() => {
    if (formData.length) return
    const initializedData = artifacts?.map(artifact => ({
      ...artifact,
      key: artifact.id?.toString() || uuidv4(),
    }))
    setFormData(initializedData ?? [])
    form.setFieldsValue({ items: initializedData ?? [] })
  }, [artifacts])

  useEffect(() => {
    if (lastRowRef.current?.input && lastRowRef.current?.input?.scrollIntoView) {
      lastRowRef.current?.input?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [lastRowRef.current?.input])

  const onValuesChange = (_: unknown, allValues: { items: CampaignAIArtifact[] }) => {
    setFormData(prevData => prevData.map((row, index) => {
      const formItem = allValues.items[index] || {}
      return {
        ...row,
        name: formItem.name ?? row.name,
        code: formItem.code ?? row.code,
        // Keep the complete aiAssistant object from formData - it's managed by handleAiAssistantSelection
      }
    }))
  }

  const onFinish = (values: { items: CampaignAIArtifact[] }) => {
    const newCampaignAIArtifacts = (values.items || []).map((item, index) => ({
      ...formData[index],
      ...item,
      // Ensure fetched keys are not lost in the form
      aiAssistant: formData[index]?.aiAssistant || item.aiAssistant,
    }))
    let save = false

    if (newCampaignAIArtifacts.length) {
      const validateField = (value: string, index: number, fieldName: keyof CampaignAIArtifact): FieldError => ({
        [fieldName]: isFieldUnique(value, index, fieldName, newCampaignAIArtifacts)
          ? '' : `${fieldName}s must be unique`,
      })

      const validateFields = (
        fieldValues: string[],
        fieldName: keyof CampaignAIArtifact,
      ): FieldError[] => fieldValues?.map((value, index) => validateField(value, index, fieldName))

      const nameErrors: FieldError[] = validateFields(newCampaignAIArtifacts?.map(column => column.name), 'name')
      const codeErrors: FieldError[] = validateFields(newCampaignAIArtifacts?.map(column => column.code), 'code')
      const setFields = (errors: FieldError[], fieldName: keyof CampaignAIArtifact) => form.setFields(
        errors?.map((error, index) => ({
          name: ['items', index, fieldName],
          errors: error[fieldName] ? [error[fieldName]] : undefined,
        })),
      )

      setFields(nameErrors, 'name')
      setFields(codeErrors, 'code')

      const hasNoErrors = (errors: FieldError[], key: string) => errors.every(error => error[key] === '')
      if (hasNoErrors(nameErrors, 'name') && hasNoErrors(codeErrors, 'code')) {
        save = true
      }
    }
    if (!newCampaignAIArtifacts.length || save) {
      saveCampaignAIArtifacts(newCampaignAIArtifacts)
      message.config({
        getContainer: () => document.getElementById('fixed_header') || document.body,
      })
      onSaveCampaignAIArtifacts && onSaveCampaignAIArtifacts(newCampaignAIArtifacts)
      message.success(I18n.t('admin.campaign_ai_artifact_updated_successfully'))
    }
  }

  const removeRow = (key: string) => {
    setFormData((prevData) => {
      const updatedData = prevData.filter(row => row.key !== key)
      form.setFieldsValue({ items: updatedData })
      return updatedData
    })
    setSelectedRowKeys(selectedRowKeys.filter(k => k !== key))
  }

  const columns = [
    {
      title: I18n.t('administration.report_builder.campaign_factors.name'),
      dataIndex: 'name',
      render: (_: unknown, record: CampaignAIArtifact, index: number) => (
        <Form.Item
          name={['items', index, 'name']}
          rules={[
            {
              required: true,
              message: I18n.t('admin.name_required'),
            },
            {
              pattern: /^\S.*(?<!\s)$/,
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
      render: (_: unknown, record: CampaignAIArtifact, index: number) => (
        <Form.Item
          name={['items', index, 'code']}
          rules={[
            {
              required: true,
              message: I18n.t('admin.code_required'),
            },
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
      title: 'AI Assistant',
      dataIndex: 'aiAssistant',
      render: (_: unknown, record: CampaignAIArtifact, index: number) => (
        <Form.Item
          name={['items', index, 'aiAssistant', 'id']}
          rules={[{
            required: true,
            message: I18n.t('admin.ai_assistant_required'),
          }]}
          className={styles.formItem}
        >
          <AIAssistantSelector
            value={record.aiAssistant?.id}
            selectedLabel={record.aiAssistant?.name}
            onChange={(assistantId, assistant) => handleAiAssistantSelection(index, assistantId, assistant)}
            className={styles.formItem}
          />
        </Form.Item>
      ),
    },
    {
      title: I18n.t('administration.report_builder.campaign_factors.delete'),
      render: (_: unknown, record: CampaignAIArtifact) => (
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

  const handleToolSelection = useCallback((key: string) => {
    switch (key) {
      case 'importAiArtifacts':
        setBulkUpload(true)
        break
      default:
        break
    }
  }, [])

  const tools: MenuProps['items'] = [
    {
      label: I18n.t('admin.import_ai_artifacts'),
      key: 'importAiArtifacts',
      onClick: () => handleToolSelection('importAiArtifacts'),
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
            {I18n.t('shared.tools')}
            <DownOutlined />
          </Button>
        </Dropdown>
      </Row>
      <Form
        form={form}
        name="campaign_ai_artifacts"
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
                aiAssistant: null,
                key: uuidv4(),
              }
              setFormData((prev) => {
                const updatedData = [...prev, newRow]
                form.setFieldsValue({ items: updatedData })
                return updatedData
              })
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
