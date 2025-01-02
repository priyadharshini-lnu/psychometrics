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
  fieldName?: number
  videoCallTypeValue?: number
  showMeetigOption?: boolean
  validationsErrors?: {
    [key: string]: {
      title: string,
      detail: string,
    }
  }
}

export const ResourcesItems: React.FC<Props> = ({
  videoCallTypeValue, showMeetigOption, fieldName, validationsErrors,
}) => {
  const [videoCallType, setVideoCallType] = useState<number>(videoCallTypeValue || 0)

  const getAttributeValidationError = (attribute: string, index: number) => {
    if (validationsErrors && fieldName !== undefined) {
      return validationsErrors[`workshops/${fieldName}/workshopResources/${index}/${attribute}`]
    }
    return undefined
  }

  return (
    <>
      {showMeetigOption && (
        <>
          <Form.Item
            label={I18n.t('administration.scheduling.assessment_center_form.video_call_type_label')}
            {...fieldLayout}
            name={fieldName !== undefined ? [fieldName, 'video_call_type'] : 'video_call_type'}
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
              rules={[{ required: true },
                { type: 'url', message: I18n.t('administration.scheduling.errors.invalid_url') },
                {
                  pattern: /^https:\/\/(.*)/,
                  message: I18n.t('administration.scheduling.errors.meeting_link_https'),
                }]}
            >
              <Input />
            </Form.Item>
          )}
        </>
      )}
      <Title level={5}>Resources</Title>
      <Form.List
        name={fieldName !== undefined ? [fieldName, 'workshop_resources'] : 'workshop_resources'}
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
                    <Input placeholder={
                      I18n.t(
                        'administration.scheduling.assessment_center_form.resources_panel.resource_name_placeholder',
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col xs={23} sm={15}>
                  <Form.Item
                    {...field}
                    name={[field.name, 'url']}
                    label="URL"
                    {...fieldLayout}
                    validateStatus={
                      getAttributeValidationError('url', index) ? 'error' : undefined
                    }
                    help={
                      getAttributeValidationError('url', index)?.title
                    }
                    rules={[
                      {
                        type: 'url',
                        pattern: /https?:\/\/(.*)/,
                        message: I18n.t('administration.scheduling.resources.invalid_url'),
                      },
                    ]}
                  >
                    <Input placeholder={
                      I18n.t(
                        'administration.scheduling.assessment_center_form.resources_panel.resource_url_placeholder',
                      )}
                    />
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
