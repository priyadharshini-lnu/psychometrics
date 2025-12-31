import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Form, Upload, Button } from 'antd'
import { UploadFile } from 'antd/lib/upload/interface'
import { UploadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import ResourceForm from '~/components/ResourceForm'
import { Report, Files, uploadFiles } from '~/modules/admin/modules/client/core/reports'
import { getFormDataForFiles } from '~/utils/formData'

const { I18n } = window
interface Props {
  report: Report
}

export const Assets: React.FC<Props> = ({ report }) => {
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)

  const [form] = Form.useForm()
  const icon = Form.useWatch('icon', form)
  const poster = Form.useWatch('poster', form)

  const removeFile = (file: UploadFile) => {
    form.setFieldsValue({ [file.name]: null })
  }

  const updateResource = (values: Files) => {
    setIsLoading(true)
    const formData = getFormDataForFiles<Files>(values, ['icon', 'poster'])

    if (!formData) return

    return dispatch(uploadFiles(report.id, formData)).then(() => {
      setIsLoading(false)
    })
  }

  return (
    <ResourceForm
      resourceName="reports"
      readableResourceName={I18n.t('reports.report')}
      resource={report}
      showSuccessMessages
      storeManager={{ form }}
      formProps={{
        labelAlign: 'left',
        id: 'edit_report',
        preserve: false,
      }}
      request={{ updateResource }}
      scrollToFirstError
    >
      {() => (
        <>
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
              <Button icon={<UploadOutlined />}>{I18n.t('reports.upload')}</Button>
            </Upload>
          </Form.Item>
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
              <Button icon={<UploadOutlined />}>{I18n.t('reports.upload')}</Button>
            </Upload>
          </Form.Item>
          <Button type="primary" htmlType="submit" className="mt-8" loading={isLoading}>
            {I18n.t('reports.update')}
          </Button>
        </>
      )}

    </ResourceForm>
  )
}
