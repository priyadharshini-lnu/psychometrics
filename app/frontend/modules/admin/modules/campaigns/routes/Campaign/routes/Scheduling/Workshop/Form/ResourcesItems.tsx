import React, { useState } from 'react'
import {
  Form, Input, Row, Col, Button, Space, Radio,
} from 'antd'
import { CloseOutlined, PlusOutlined } from '@ant-design/icons'
import styles from './Form.less'

const fieldLayout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 },
}
const { I18n } = window

interface Props {
  videoCallTypeValue?: number
  showMeetigOption?: boolean
}

export const ResourcesItems: React.FC<Props> = ({ videoCallTypeValue, showMeetigOption }) => {
  const [videoCallType, setVideoCallType] = useState<number>(videoCallTypeValue || 0)

  return (
    <>
      {showMeetigOption && (
        <>
          <Form.Item
            label={I18n.t('administration.scheduling.assessment_center_form.video_call_type_label')}
            {...fieldLayout}
            name="video_call_type"
            rules={[{ required: true }]}
          >
            <Radio.Group onChange={e => setVideoCallType(e.target.value)}>
              <Radio value={0}>
                {I18n.t('administration.scheduling.assessment_center_form.video_call_type.none')}
              </Radio>
              <Radio value={1}>
                {I18n.t('administration.scheduling.assessment_center_form.video_call_type.internal')}
              </Radio>
              <Radio value={2}>
                {I18n.t('administration.scheduling.assessment_center_form.video_call_type.custom')}
              </Radio>
            </Radio.Group>
          </Form.Item>
          {videoCallType === 2 && (
            <Form.Item
              label="Meeting Link"
              name="meeting_link"
              {...fieldLayout}
            >
              <Input />
            </Form.Item>
          )}
        </>
      )}
      <label>Resources</label>
      <Form.List name="workshop_resources">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <Row key={field.key}>
                <Col span={8}>
                  <Form.Item
                    {...field}
                    name={[field.name, 'name']}
                    label="Name"
                    rules={[{ required: true }]}
                    {...fieldLayout}
                  >
                    <Input placeholder="Name" />
                  </Form.Item>
                </Col>
                <Col span={8} offset={1}>
                  <Form.Item
                    {...field}
                    name={[field.name, 'url']}
                    label="Url"
                    {...fieldLayout}
                  >
                    <Input placeholder="Url" />
                  </Form.Item>
                </Col>
                <Col span={1}>
                  <CloseOutlined
                    className={styles.removeResource}
                    onClick={() => remove(index)}
                  />
                </Col>
              </Row>
            ))}
            <Space>
              <Button
                type="link"
                icon={<PlusOutlined />}
                onClick={() => add()}
              >
                Add More
              </Button>
            </Space>
          </>
        )}
      </Form.List>
    </>
  )
}
