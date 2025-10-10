import React, { useState } from 'react'
import {
  Typography, Form, Input, Button, Row, Col,
} from 'antd'
import {
  CloseOutlined, CheckOutlined, EditOutlined,
} from '@ant-design/icons'
import styles from '../../../FormStyle.less'

interface OptionData {
  label?: string
  value?: string
  text?: string
}

interface Props {
  option: string
  optionData: OptionData
  i: number
  removeOption: (i: number) => void
  onEditOption: (i: number, newData: OptionData) => void
  allowRemoveOption: boolean
}

const Option: React.FC<Props> = ({
  option,
  optionData,
  i,
  removeOption,
  onEditOption,
  allowRemoveOption,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [form] = Form.useForm()


  const hasLabelValue = optionData.label !== undefined && optionData.value !== undefined
  const hasTextOnly = optionData.text !== undefined

  const handleEdit = () => {
    setIsEditing(true)
    if (hasLabelValue) {
      form.setFieldsValue({
        label: optionData.label,
        value: optionData.value,
      })
    } else if (hasTextOnly) {
      form.setFieldsValue({
        label: optionData.text,
        value: '',
      })
    }
  }

  const handleSave = (values: { label?: string; value?: string; text?: string }) => {
    onEditOption(i, {
      label: values.label?.trim(),
      value: values.value?.trim(),
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    form.resetFields()
  }

  if (isEditing) {
    return (
      <div className={styles.menuOption}>
        <Form
          form={form}
          onFinish={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault()
              handleCancel()
            }
          }}
          layout="horizontal"
          size="small"
          style={{ width: '100%' }}
        >
          <Row gutter={8} align="middle">
            <Col flex="1">
              <Form.Item
                name="label"
                rules={[{ required: true, message: 'Label is required' }]}
                style={{ marginBottom: 0 }}
              >
                <Input
                  placeholder="Enter display label"
                  size="small"
                  onPressEnter={(e) => {
                    e.preventDefault()
                    form.submit()
                  }}
                />
              </Form.Item>
            </Col>
            <Col flex="1">
              <Form.Item
                name="value"
                rules={[{ required: true, message: 'Value is required' }]}
                style={{ marginBottom: 0 }}
              >
                <Input
                  placeholder="Value"
                  size="small"
                  disabled={!allowRemoveOption && !hasTextOnly}
                  onPressEnter={(e) => {
                    e.preventDefault()
                    form.submit()
                  }}
                />
              </Form.Item>
            </Col>
            <Col>
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined className={styles.checkIcon} />}
                onClick={() => form.submit()}
              />
            </Col>
            <Col>
              <Button
                type="text"
                size="small"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    )
  }

  return (
    <div className={styles.menuOption}>
      <div style={{ display: 'flex', width: '100%' }}>
        <Typography.Text
          className={styles.editableOptionText}
          ellipsis
        >
          {option}
        </Typography.Text>
        <EditOutlined
          className={styles.editIcon}
          onClick={handleEdit}
        />
        {allowRemoveOption && (
          <CloseOutlined
            onClick={() => removeOption(i)}
            style={{ marginLeft: 8, cursor: 'pointer' }}
          />
        )}
      </div>
    </div>
  )
}

export default Option
