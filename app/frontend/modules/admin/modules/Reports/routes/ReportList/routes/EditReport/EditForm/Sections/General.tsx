import React, { useState } from 'react'
import {
  Form, Button, Divider, Switch,
} from 'antd'
import { ColorPicker } from '~/glint'
import ResourceForm from '~/components/ResourceForm'
import { Report } from '~/modules/admin/modules/client/core/reports'
import { useResources } from '~/hooks/useResources/useResources'
import styles from './General.less'
import { BaseFormFields } from '../../../ReportList/BaseFormFields'

const { I18n } = window
interface Props {
  report: Report
}

export const General: React.FC<Props> = ({ report }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { updateResource } = useResources<Report>('reports')

  const [form] = Form.useForm()
  const iconColor = Form.useWatch('iconColor', form)

  const resetColor = () => {
    form.setFieldsValue({ iconColor: null })
  }

  const handleUpdate = (values: Report) => {
    setIsLoading(true)

    return updateResource(values)
      .then((response) => {
        setIsLoading(false)
        return response
      })
      .catch((error) => {
        setIsLoading(false)
        throw error
      })
  }

  return (
    <ResourceForm
      resourceName="reports"
      readableResourceName={I18n.t('reports.report')}
      resource={{ ...report, active: !report.disabled }}
      showSuccessMessages
      storeManager={{ form }}
      formProps={{ labelAlign: 'left', id: 'edit_', preserve: false }}
      request={{ updateResource: handleUpdate }}
      scrollToFirstError
      transformValues={
        (values) => {
          const { active, ...submittedValues } = values
          return { ...submittedValues, disabled: !active }
        }
      }
    >
      {() => (
        <>
          <Form.Item
            valuePropName="checked"
            name="active"
            label={I18n.t('common.column.active')}
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="disabled"
            noStyle
          >
            <input type="hidden" />
            {' '}
            {/* Hidden field to store the 'disabled' value */}
          </Form.Item>
          <BaseFormFields report={report} form={form} />
          <Divider />
          <Form.Item label={I18n.t('common.column.icon_color')}>
            <div className={styles.iconColorContainer}>
              <Form.Item name="iconColor">
                <ColorPicker getValueInHexFormat defaultColor="#00000000" value={iconColor} />
              </Form.Item>
              <Button onClick={() => resetColor()}>
                {I18n.t('reports.reset')}
              </Button>
            </div>
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {I18n.t('reports.update')}
          </Button>
        </>
      )}

    </ResourceForm>
  )
}
