import React, { useState, useEffect } from 'react'
import {
  Table, Button, Modal, Form as AntForm, Input, InputNumber, Flex, Space, message,
} from 'antd'
import type { TableColumnsType } from 'antd'
import { DeleteOutlined, PlusOutlined, EditOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import ScoreDefinitions from './ScoreDefinitions'
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
  what_to_look_for?: string
  precision?: number
  weight?: number
  score_min?: number | null
  score_max?: number | null
  score_definitions?: ScoreDefinition[]
  sub_factor_id?: number | null
  position?: number
  factor_type?: string
  _is_new?: boolean
}

interface Factor {
  factors_sub_factors?: Indicator[]
  score_min?: number | null
  score_max?: number | null
}

type Props = {
  factor: Factor
  onChange: (event: { currentTarget: { name: string; value: Indicator[] } }) => void
  errors?: {
    factors_sub_factors?: string[]
  }
  indicatorErrors?: string[]
}

const IndicatorList: React.FC<Props> = ({
  factor,
  onChange,
  errors,
  indicatorErrors,
}) => {
  const [indicators, setIndicators] = useState<Indicator[]>(
    factor.factors_sub_factors || [],
  )
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null)
  const [form] = AntForm.useForm()

  useEffect(() => {
    setIndicators(factor.factors_sub_factors || [])
  }, [factor.factors_sub_factors])

  const defaultIndicator: Indicator = {
    name: '',
    description: '',
    what_to_look_for: '',
    precision: 0,
    weight: 1,
    score_min: factor.score_min,
    score_max: factor.score_max,
    score_definitions: generateScoreDefinitionsFromRange(factor.score_min, factor.score_max, []),
  }

  const openModal = (index: number | null = null) => {
    if (index !== null) {
      setEditingIndex(index)
      const data = indicators[index]
      const scoreMin = factor.score_min
      const scoreMax = factor.score_max
      const indicatorData: Indicator = {
        ...data,
        score_min: scoreMin,
        score_max: scoreMax,
        score_definitions: generateScoreDefinitionsFromRange(
          scoreMin,
          scoreMax,
          data.score_definitions || [],
        ),
      }
      setEditingIndicator(indicatorData)
      setTimeout(() => {
        form.setFieldsValue(indicatorData)
      }, 0)
    } else {
      setEditingIndex(null)
      setEditingIndicator(defaultIndicator)
      setTimeout(() => {
        form.setFieldsValue(defaultIndicator)
      }, 0)
    }
    setIsModalVisible(true)
  }

  const closeModal = () => {
    setIsModalVisible(false)
    setEditingIndex(null)
    setEditingIndicator(null)
    form.resetFields()
  }

  const handleScoreDefinitionsChange = (
    { currentTarget }: { currentTarget: { name: string; value: ScoreDefinition[] } },
  ) => {
    if (currentTarget.name === 'score_definitions') {
      setEditingIndicator((prev) => {
        if (prev) {
          return {
            ...prev,
            score_definitions: currentTarget.value,
          }
        }
        return null
      })
    }
  }

  const handleScoreRangeChange = (_: unknown, values: Partial<Indicator>) => {
    const newMin = values.score_min
    const newMax = values.score_max
    if (newMin !== undefined && newMax !== undefined && newMin !== null && newMax !== null) {
      const newDefinitions = generateScoreDefinitionsFromRange(
        newMin,
        newMax,
        editingIndicator?.score_definitions || [],
      )
      setEditingIndicator((prev) => {
        if (prev) {
          return {
            ...prev,
            score_min: newMin,
            score_max: newMax,
            score_definitions: newDefinitions,
          }
        }
        return null
      })
    }
  }

  const saveIndicator = async () => {
    try {
      await form.validateFields()
      const formValues = form.getFieldsValue()
      const values: Indicator = {
        ...formValues,
        score_definitions: editingIndicator?.score_definitions || [],
      }

      if (editingIndex !== null) {
        const updatedIndicators = [...indicators]
        updatedIndicators[editingIndex] = {
          ...updatedIndicators[editingIndex],
          ...values,
          factor_type: 'indicator',
        }
        setIndicators(updatedIndicators)
        onChange({
          currentTarget: { name: 'factors_sub_factors', value: updatedIndicators },
        })
      } else {
        const newIndicator: Indicator = {
          id: `temp_${Date.now()}`,
          ...values,
          sub_factor_id: null,
          position: indicators.length,
          factor_type: 'indicator',
          _is_new: true,
        }
        const updatedIndicators = [...indicators, newIndicator]
        setIndicators(updatedIndicators)
        onChange({
          currentTarget: { name: 'factors_sub_factors', value: updatedIndicators },
        })
      }

      closeModal()
    } catch (e) {
      message.error(e)
      console.error('Validation failed:', e)
    }
  }

  const removeIndicator = (index: number) => {
    const updatedIndicators = indicators.filter((_, i) => i !== index)
    setIndicators(updatedIndicators)
    onChange({
      currentTarget: { name: 'factors_sub_factors', value: updatedIndicators },
    })
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


      {indicatorErrors && indicatorErrors.length > 0 && (
        <div style={{ color: 'red', marginTop: '8px' }}>
          {indicatorErrors.map((err, idx) => (
            <div key={idx}>{err}</div>
          ))}
        </div>
      )}

      <Table
        columns={columns}
        dataSource={indicators}
        rowKey={(_, index) => `indicator-${index}`}
        pagination={false}
        size="small"
      />

      {errors?.factors_sub_factors && errors.factors_sub_factors.length > 0 && (
        <div style={{ color: 'red', marginTop: '8px' }}>
          {errors.factors_sub_factors.join(', ')}
        </div>
      )}

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
        <AntForm
          form={form}
          layout="vertical"
          onValuesChange={handleScoreRangeChange}
        >
          <AntForm.Item
            label={I18n.t('shared.name')}
            name="name"
            rules={[
              { required: true, message: I18n.t('admin.name_required') },
              { max: 250, message: I18n.t('admin.name_max_length', { length: 250 }) },
            ]}
          >
            <Input placeholder={I18n.t('admin.enter_name')} />
          </AntForm.Item>

          <AntForm.Item
            label={I18n.t('shared.description')}
            name="description"
          >
            <Input.TextArea placeholder={I18n.t('admin.enter_description')} rows={3} />
          </AntForm.Item>

          <AntForm.Item
            label={I18n.t('admin.what_to_look_for')}
            name="what_to_look_for"
          >
            <Input.TextArea
              placeholder={I18n.t('admin.what_to_look_for_placeholder')}
              rows={4}
              aria-label="What to look for"
            />
          </AntForm.Item>

          <AntForm.Item
            label={I18n.t('admin.precision')}
            name="precision"
            rules={[{ type: 'number' }]}
          >
            <InputNumber min={0} max={6} />
          </AntForm.Item>

          <AntForm.Item
            label={I18n.t('admin.weight')}
            name="weight"
            rules={[{ type: 'number' }]}
          >
            <InputNumber min={0} step={0.1} />
          </AntForm.Item>

          <Flex gap="middle">
            <AntForm.Item
              label={I18n.t('admin.score_min')}
              name="score_min"
            >
              <InputNumber min={1} max={10} disabled />
            </AntForm.Item>
            <AntForm.Item
              label={I18n.t('admin.score_max')}
              name="score_max"
            >
              <InputNumber min={1} max={10} disabled />
            </AntForm.Item>
          </Flex>
        </AntForm>

        {editingIndicator?.score_min !== null
          && editingIndicator?.score_max !== null
          && editingIndicator?.score_min !== undefined
          && editingIndicator?.score_max !== undefined
          && (
            <ScoreDefinitions
              scoreDefinitions={editingIndicator.score_definitions || []}
              onChange={handleScoreDefinitionsChange}
            />
          )
        }
      </Modal>
    </div>
  )
}

export default IndicatorList
