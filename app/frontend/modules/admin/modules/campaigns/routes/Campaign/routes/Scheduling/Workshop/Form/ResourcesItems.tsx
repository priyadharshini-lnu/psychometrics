import React, { useState } from 'react'
import {
  Form, Input, Row, Col, Button, Radio, Typography,
} from 'antd'
import { CloseOutlined, PlusOutlined } from '@ant-design/icons'
import styles from './Form.less'

const { Title } = Typography
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
              rules={[{ required: true }, { type: 'url' }, { pattern: /^https?:\/\/(.*)/ }]}
            >
              <Input />
            </Form.Item>
          )}
        </>
      )}
      <Title level={5}>Resources</Title>
      <Form.List
        name="workshop_resources"
        rules={[{
          validator (_, resources) {
            const valid = resources.every((resource) => {
              if (!resource) return Promise.resolve()
              const { name, url } = resource
              if ((!url?.length && !name?.length) || (url?.length && name?.length)) {
                return true
              }
              return false
            })
            return valid ? Promise.resolve()
              : Promise.reject(new Error(
                I18n.t('administration.scheduling.assessment_center_form.resources_panel.validation_error'),
              ))
          },
        }]}
      >
        {(fields, { add, remove }, { errors }) => (
          <>
            {fields.map((field, index) => (
              <Row key={index} gutter={16}>
                <Col xs={23} sm={8}>
                  <Form.Item
                    {...field}
                    name={[field.name, 'name']}
                    label="Name"
                    {...fieldLayout}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={23} sm={15}>
                  <Form.Item
                    {...field}
                    name={[field.name, 'url']}
                    label="URL"
                    {...fieldLayout}
                    rules={[
                      {
                        type: 'url',
                      },
                    ]}
                  >
                    <Input placeholder="Resource Link" />
                  </Form.Item>
                </Col>
                <Col className="flex items-center justify-center" span={1}>
                  <CloseOutlined
                    className={styles.removeResource}
                    onClick={() => remove(index)}
                  />
                </Col>
              </Row>
            ))}
            <Form.ErrorList errors={errors} />
            <Button
              type="link"
              icon={<PlusOutlined />}
              onClick={() => add()}
              className="ps-0"
            >
              Add More
            </Button>
          </>
        )}
      </Form.List>
    </>
  )
}
