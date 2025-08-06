import React, { useState } from 'react'
import {
  App, Button, Alert, Form, Upload, Typography, Flex,
} from 'antd'
import { useParams } from 'react-router'
import { User } from '~/modules/admin/modules/client/core/users'
import { CheckOutlined, LoadingOutlined, UploadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources'

const { I18n } = window

const TAXONOMY_IMPORT = 'skill_rater_assessments/import_taxonomies'

export const TaxonomyImport: React.FC = () => {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState([])

  const { projectId: projectIdParam } = useParams()
  const { uploadFileAction, isLoading } = useResources<User>(TAXONOMY_IMPORT)

  const handleTaxonomyImport = (data: FormData, projectId: number | null) => {
    let action = TAXONOMY_IMPORT
    if (projectId) {
      action += `?project_id=${projectId}`
    }

    setErrors([])

    uploadFileAction(action, data)
      .then(() => {
        form.resetFields()
        setFile(null)
        message.info(I18n.t('administration.taxonomy.import.success_msg'))
      })
      .catch((error) => {
        setErrors(error)
      })
  }

  const handleUpload = () => {
    if (!file) return

    const data = new FormData()
    data.append('file', file)

    handleTaxonomyImport(data, projectIdParam ? Number(projectIdParam) : null)
  }

  return (
    <Flex vertical className="pl">
      {errors.length ? (
        <Alert
          message={false}
          description={errors.map((e, i) => <div key={i}>{e}</div>)}
          type="error"
          className="mbm"
        />
      ) : null}
      <Flex gap={20} align="center">
        <Typography.Title className="fs-20 mt-2 self-start" level={1}>
          {I18n.t('administration.taxonomy.import_action.taxonomy')}
          :
        </Typography.Title>
        <Upload
          accept=".xls,.xlsx"
          showUploadList
          beforeUpload={(file) => {
            setFile(file)
            return false
          }}
          maxCount={1}
          onRemove={() => {
            setFile(null)
            setErrors([])
            return true
          }}
          fileList={file ? [{
            uid: '1',
            name: file.name,
          }] : []}
        >
          <Button icon={<UploadOutlined />}>{I18n.t('common.actions.upload')}</Button>
        </Upload>
        { !file && (
          <Typography.Link target="_blank" href="/example_csv/import_taxonomy_sample_file.xlsx">
            {I18n.t('administration.taxonomy.import.download_example_file')}
          </Typography.Link>
        )}
      </Flex>
      <Button
        className="mt-2 self-start"
        type="primary"
        htmlType="submit"
        disabled={!file}
        loading={isLoading(`upload/${TAXONOMY_IMPORT}`)}
        onClick={handleUpload}
        icon={isLoading(`upload/${TAXONOMY_IMPORT}`) ? <LoadingOutlined /> : <CheckOutlined />}
      >
        {I18n.t('common.actions.update')}
      </Button>
    </Flex>
  )
}
