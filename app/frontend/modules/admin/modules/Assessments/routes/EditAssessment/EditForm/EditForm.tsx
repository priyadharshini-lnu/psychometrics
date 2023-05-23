import React, { useEffect, useState } from 'react'
import _ from 'lodash'
import { useDispatch } from 'react-redux'
import {
  Form, Upload, Button, Divider, Card, Col, Row, Select, Switch,
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { UploadFile } from 'antd/lib/upload/interface'
import type { Merge } from 'type-fest'
import { ColorPicker } from '~/components/ColorPicker'
import ResourceForm from '~/components/ResourceForm'
import { Assessment, Files, uploadFiles } from '~/modules/admin/modules/client/core/assessments'
import { BaseFormFields } from '../../AssessmentList/BaseFormFields'
import { useResources } from '~/hooks/useResources/useResources'
import styles from './EditForm.less'
import { getFormDataForFiles } from '~/utils/formData'

const { I18n } = window

interface Props {
  assessment: Assessment
}

export const EditForm: React.FC<Props> = ({ assessment }) => {
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const { updateResource } = useResources<Assessment>('assessments')

  const [form] = Form.useForm()
  const icon = Form.useWatch('icon', form)
  const poster = Form.useWatch('poster', form)
  const iconColor = Form.useWatch('iconColor', form)

  useEffect(() => {
    if (!assessment.iconColor) {
      form.setFieldsValue({ iconColor: '#009ea7' })
    }
  }, [form.getFieldsValue(), assessment])

  const removeFile = (file: UploadFile) => {
    form.setFieldsValue({ [file.name]: null })
  }

  const resetColor = (field: 'iconColor') => {
    form.setFieldsValue({ [field]: null })
  }
  const handleUpdate = (values: Merge<Assessment, Files>) => {
    setIsLoading(true)
    const formData = getFormDataForFiles<Files>(values, ['icon', 'poster'])
    const valuesWithoutFiles = _.omit(values, ['icon', 'poster'])

    if (formData) {
      return dispatch(uploadFiles(assessment.id, formData)).then(() => {
        updateResource(valuesWithoutFiles).then(() => setIsLoading(false))
      })
    }
    return updateResource(valuesWithoutFiles).then(() => setIsLoading(false))
  }

  return (
    <Row justify="space-between" className="pl">
      <Col sm={24} md={16} xl={12} xxl={10}>
        <ResourceForm
          resourceName="assessments"
          resource={assessment}
          showSuccessMessages
          storeManager={{ form }}
          formProps={{
            labelAlign: 'left',
            id: 'edit_assessment',
            preserve: false,
          }}
          request={{ updateResource: handleUpdate }}
          scrollToFirstError
        >
          {() => (
            <>
              <Form.Item name="type" label={I18n.t('common.column.type')}>
                <Select disabled>
                  <Select.Option value={assessment.type}>
                    {I18n.t(`assessments.fields.type.${assessment.type}`)}
                  </Select.Option>
                </Select>
              </Form.Item>
              <BaseFormFields assessment={assessment} form={form} />
              <Form.Item name="status" label={I18n.t('common.column.status')}>
                <Select>
                  <Select.Option value="in_progress">{I18n.t('assessments.fields.status.in_progress')}</Select.Option>
                  <Select.Option value="finished">{I18n.t('assessments.fields.status.finished')}</Select.Option>
                </Select>
              </Form.Item>
              <Divider />
              <Form.Item
                valuePropName="checked"
                name="enableVideoCheck"
                label={I18n.t('assessments.column.enable_video_check')}
              >
                <Switch />
              </Form.Item>
              <Form.Item
                valuePropName="checked"
                name="enableAudioCheck"
                label={I18n.t('assessments.column.enable_audio_check')}
              >
                <Switch />
              </Form.Item>
              <Form.Item
                valuePropName="checked"
                name="enableNetworkCheck"
                label={I18n.t('assessments.column.enable_network_check')}
              >
                <Switch />
              </Form.Item>
              <Form.Item name="poster" label={I18n.t('common.column.poster')}>
                <Upload
                  listType="picture"
                  maxCount={1}
                  onRemove={removeFile}
                  accept=".jpg, .png, .jpeg, |image/*"
                  fileList={poster && typeof poster === 'string' ? [{
                    uid: '1', name: 'poster', status: 'done', url: poster,
                  }] : undefined}
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadOutlined />}>{I18n.t('assessments.upload')}</Button>
                </Upload>
              </Form.Item>
              <Card size="small">
                <Form.Item name="icon" label={I18n.t('common.column.icon')}>
                  <Upload
                    listType="picture"
                    maxCount={1}
                    onRemove={removeFile}
                    accept=".jpg, .png, .jpeg, |image/*"
                    fileList={icon && typeof icon === 'string' ? [{
                      uid: '1', name: 'icon', status: 'done', url: icon,
                    }] : undefined}
                    beforeUpload={() => false}
                  >
                    <Button icon={<UploadOutlined />}>{I18n.t('assessments.upload')}</Button>
                  </Upload>
                </Form.Item>
                <div>OR</div>
                <Form.Item label={I18n.t('common.column.icon_color')}>
                  <div className={styles.iconColorContainer}>
                    <Form.Item name="iconColor">
                      <ColorPicker value={iconColor} />
                    </Form.Item>
                    <Button onClick={() => resetColor('iconColor')}>
                      {I18n.t('assessments.reset')}
                    </Button>
                  </div>
                </Form.Item>
              </Card>
              <Button type="primary" htmlType="submit" className="mt-8" loading={isLoading}>
                {I18n.t('assessments.update')}
              </Button>
            </>
          )}

        </ResourceForm>
      </Col>
    </Row>
  )
}
