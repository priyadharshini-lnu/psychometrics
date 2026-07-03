import React, { useState } from 'react'
import {
  Table, Button, Modal, Form, Input, InputNumber, Flex, Space, message,
} from 'antd'
import type { TableColumnsType, FormInstance } from 'antd'
import { DeleteOutlined, PlusOutlined, EditOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { ScoreDefinitions } from './ScoreDefinitions'
import { generateScoreDefinitionsFromRange } from './utils/scoreDefinitions'

const { I18n } = window

const DESCRIPTION_PREVIEW_LENGTH = 50

interface ScoreDefinition {
  score: number
  definition: string
}

interface Indicator {
  id?: string
  name: string
  description?: string
  whatToLookFor?: string
  precision?: number
  weight?: number
  scoreMin?: number | null
  scoreMax?: number | null
  scoreDefinitions?: ScoreDefinition[]
  subFactorId?: number | null
  factorsSubFactorId?: number | null
  position?: number
  factorType?: string
}

type Props = {
  form: FormInstance
}

export const IndicatorList: React.FC<Props> = ({ form: parentForm }) => {
  const indicators: Indicator[] = Form.useWatch(['subFactors'], parentForm) || []
  const factorScoreMin: number = Form.useWatch(['scoreMin'], parentForm)
  const factorScoreMax: number = Form.useWatch(['scoreMax'], parentForm)

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null)
  const [indicatorForm] = Form.useForm()

  const defaultIndicator: Indicator = {
    name: '',
    description: '',
    whatToLookFor: '',
    precision: 0,
    weight: 1,
    scoreMin: factorScoreMin,
    scoreMax: factorScoreMax,
    scoreDefinitions: generateScoreDefinitionsFromRange(factorScoreMin, factorScoreMax, []),
  }

  const openModal = (index: number | null = null) => {
    if (index !== null) {
      setEditingIndex(index)
      const data = indicators[index]
      const indicatorData: Indicator = {
        ...data,
        scoreMin: factorScoreMin,
        scoreMax: factorScoreMax,
        scoreDefinitions: generateScoreDefinitionsFromRange(
          factorScoreMin,
          factorScoreMax,
          data.scoreDefinitions || [],
        ),
      }
      setEditingIndicator(indicatorData)
      setTimeout(() => {
        indicatorForm.setFieldsValue(indicatorData)
      }, 0)
    } else {
      setEditingIndex(null)
      setEditingIndicator(defaultIndicator)
      setTimeout(() => {
        indicatorForm.setFieldsValue(defaultIndicator)
      }, 0)
    }
    setIsModalVisible(true)
  }

  const closeModal = () => {
    setIsModalVisible(false)
    setEditingIndex(null)
    setEditingIndicator(null)
    indicatorForm.resetFields()
  }

  const handleScoreRangeChange = (_: unknown, values: Partial<Indicator>) => {
    if (values.scoreDefinitions) {
      setEditingIndicator((prev) => {
        if (prev) {
          return { ...prev, scoreDefinitions: values.scoreDefinitions }
        }
        return null
      })
    }

    const newMin = values.scoreMin
    const newMax = values.scoreMax
    if (newMin !== undefined && newMax !== undefined && newMin !== null && newMax !== null) {
      const currentDefinitions = indicatorForm.getFieldValue('scoreDefinitions') || []
      const newDefinitions = generateScoreDefinitionsFromRange(
        newMin,
        newMax,
        currentDefinitions,
      )
      setEditingIndicator((prev) => {
        if (prev) {
          return {
            ...prev,
            scoreMin: newMin,
            scoreMax: newMax,
            scoreDefinitions: newDefinitions,
          }
        }
        return null
      })
      indicatorForm.setFieldValue('scoreDefinitions', newDefinitions)
    }
  }

  const saveIndicator = async () => {
    try {
      await indicatorForm.validateFields()
      const formValues = indicatorForm.getFieldsValue(true)
      const values: Indicator = {
        ...formValues,
        scoreDefinitions: formValues.scoreDefinitions || [],
      }

      const currentIndicators = [...indicators]
      if (editingIndex !== null) {
        const existingIndicator = currentIndicators[editingIndex]
        currentIndicators[editingIndex] = {
          ...existingIndicator, // Preserves id, subFactorId, factorsSubFactorId, position, etc.
          ...values, // Updates with new form values
          factorType: 'indicator',
        }
      } else {
        const newIndicator: Indicator = {
          ...values,
          position: indicators.length,
          factorType: 'indicator',
        }
        currentIndicators.push(newIndicator)
      }

      parentForm.setFieldValue('subFactors', currentIndicators)
      closeModal()
    } catch (e) {
      // AntD form validation throws a structured object; field errors are already shown inline.
      if (e && typeof e === 'object' && 'errorFields' in e) {
        return
      }

      message.error(I18n.t('admin.validation_error'))
      console.error('Save indicator failed:', e)
    }
  }

  const removeIndicator = (index: number) => {
    const updatedIndicators = indicators.filter((_, i) => i !== index)
    parentForm.setFieldValue('subFactors', updatedIndicators)
  }

  const columns: TableColumnsType<Indicator> = [
    {
      title: I18n.t('shared.name'),
      dataIndex: 'name',
      key: 'name',
      render: text => <span>{text || '-'}</span>,
    },
    {
      title: I18n.t('shared.description'),
      dataIndex: 'description',
      key: 'description',
      render: text => (
        <span>
          {text
            ? text.substring(0, DESCRIPTION_PREVIEW_LENGTH) + (text.length > DESCRIPTION_PREVIEW_LENGTH ? '...' : '')
            : '-'}
        </span>
      ),
    },
    {
      title: I18n.t('admin.weight'),
      dataIndex: 'weight',
      key: 'weight',
      width: 80,
      render: text => <span>{text || 1}</span>,
    },
    {
      title: I18n.t('admin.precision'),
      dataIndex: 'precision',
      key: 'precision',
      width: 100,
      render: text => <span>{text || 0}</span>,
    },
    {
      title: I18n.t('shared.actions'),
      key: 'actions',
      width: 100,
      render: (_: unknown, __: Indicator, index: number) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openModal(index)}
          />
          <Button
            type="link"
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => removeIndicator(index)}
          />
        </Space>
      ),
    },
  ]

  return (
    <div className="mtm mbm">
      <div style={{ marginBottom: '16px' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          {I18n.t('admin.add_indicator')}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={indicators}
        rowKey={(_, index) => `indicator-${index}`}
        pagination={false}
        size="small"
      />

      <Modal
        title={editingIndex !== null
          ? I18n.t('admin.edit_indicator')
          : I18n.t('admin.create_indicator')}
        open={isModalVisible}
        onOk={saveIndicator}
        onCancel={closeModal}
        okText={I18n.t('shared.save')}
        cancelText={I18n.t('shared.cancel')}
        width={800}
        getContainer={false}
      >
        <Form
          form={indicatorForm}
          layout="vertical"
          onValuesChange={handleScoreRangeChange}
        >
          <Form.Item
            label={I18n.t('shared.name')}
            name="name"
            rules={[
              { required: true, message: I18n.t('admin.name_required') },
              { max: 250, message: I18n.t('admin.name_max_length', { length: 250 }) },
            ]}
          >
            <Input placeholder={I18n.t('admin.enter_name')} />
          </Form.Item>

          <Form.Item
            label={I18n.t('shared.description')}
            name="description"
          >
            <Input.TextArea placeholder={I18n.t('admin.enter_description')} rows={3} />
          </Form.Item>

          <Form.Item
            label={I18n.t('admin.what_to_look_for')}
            name="whatToLookFor"
          >
            <Input.TextArea
              placeholder={I18n.t('admin.what_to_look_for_placeholder')}
              rows={4}
              aria-label="What to look for"
            />
          </Form.Item>

          <Form.Item
            label={I18n.t('admin.precision')}
            name="precision"
            rules={[{ type: 'number' }]}
          >
            <InputNumber min={0} max={6} />
          </Form.Item>

          <Form.Item
            label={I18n.t('admin.weight')}
            name="weight"
            rules={[{ type: 'number' }]}
          >
            <InputNumber min={0} step={0.1} />
          </Form.Item>

          <Flex gap="middle">
            <Form.Item
              label={I18n.t('admin.score_min')}
              name="scoreMin"
            >
              <InputNumber min={1} max={10} disabled />
            </Form.Item>
            <Form.Item
              label={I18n.t('admin.score_max')}
              name="scoreMax"
            >
              <InputNumber min={1} max={10} disabled />
            </Form.Item>
          </Flex>

          {editingIndicator?.scoreMin !== null
            && editingIndicator?.scoreMax !== null
            && editingIndicator?.scoreMin !== undefined
            && editingIndicator?.scoreMax !== undefined
            && (
              <ScoreDefinitions
                scoreDefinitions={editingIndicator.scoreDefinitions || []}
                form={indicatorForm}
              />
            )
          }
        </Form>
      </Modal>
    </div>
  )
}
