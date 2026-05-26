import React, { useEffect, useState } from 'react'
import {
  Form, Button, Divider, Select, Switch,
} from 'antd'
import { ColorPicker } from '~/glint'
import ResourceForm from '~/components/ResourceForm'
import { Assessment } from '~/modules/admin/modules/client/core/assessments'
import { BaseFormFields } from '../../../AssessmentList/BaseFormFields'
import { useResources } from '~/hooks/useResources/useResources'
import styles from './General.less'

const { I18n } = window
interface Props {
  assessment: Assessment
}

export const General: React.FC<Props> = ({ assessment }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { updateResource } = useResources<Assessment>('assessments')

  const [form] = Form.useForm()
  const iconColor = Form.useWatch('iconColor', form)
  const category = Form.useWatch('category', form)

  useEffect(() => {
    if (!assessment.iconColor) {
      form.setFieldsValue({ iconColor: '#04717B' })
    }
  }, [form.getFieldsValue(), assessment])

  const resetColor = (field: 'iconColor') => {
    form.setFieldsValue({ [field]: null })
  }

  const handleUpdate = (values: Assessment) => {
    setIsLoading(true)
    let newValues = values

    if (values.linkedAssessment === undefined && category === 'assessor_form') {
      newValues = { ...values, linkedAssessment: null }
    }
    return updateResource(newValues)
  }

  return (
    <ResourceForm
      resourceName="assessments"
      readableResourceName={I18n.t('assessments.assessment')}
      resource={assessment}
      showSuccessMessages
      storeManager={{ form }}
      formProps={{ labelAlign: 'left', id: 'edit_assessment', preserve: false }}
      request={{ updateResource: handleUpdate }}
      scrollToFirstError
      onSuccessfulSubmission={() => setIsLoading(false)}
      onFailedSubmission={() => setIsLoading(false)}
    >
      {() => (
        <>
          <Form.Item name="type" label={I18n.t('common.column.type')}>
            <Select disabled>
              <Select.Option value={assessment.type}>
                {I18n.t(`admin.${assessment.type}_assessment`)}
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
          {/* <Form.Item
            valuePropName="checked"
            name="enableNetworkCheck"
            label={I18n.t('assessments.column.enable_network_check')}
          >
            <Switch />
          </Form.Item> */}
          <Form.Item
            valuePropName="checked"
            name="translationsMigrated"
            label={I18n.t('assessments.column.translations_migrated')}
          >
            <Switch />
          </Form.Item>
          <Form.Item label={I18n.t('common.column.icon_color')}>
            <div className={styles.iconColorContainer}>
              <Form.Item name="iconColor">
                <ColorPicker getValueInHexFormat defaultColor="#00000000" value={iconColor} />
              </Form.Item>
              <Button onClick={() => resetColor('iconColor')}>
                {I18n.t('assessments.reset')}
              </Button>
            </div>
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {I18n.t('assessments.update')}
          </Button>
        </>
      )}

    </ResourceForm>
  )
}
