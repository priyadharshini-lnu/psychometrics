import React, { useState } from 'react'
import {
  App, Button, Alert, Upload, Typography, Card, Space, Flex,
} from 'antd'
import type { UploadFile } from 'antd'
import { useParams } from 'react-router'
import { User } from '~/modules/admin/modules/client/core/users'
import {
  CheckOutlined, LoadingOutlined, UploadOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { useResources } from '~/hooks/useResources'
import styles from './styles.less'

const { I18n } = window
const { Text, Link } = Typography

const TAXONOMY_IMPORT = 'skill_rater_assessments/import_taxonomies'

export const TaxonomyImport: React.FC = () => {
  const { message } = App.useApp()
  const [file, setFile] = useState<UploadFile | null>(null)
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)

  const { projectId: projectIdParam } = useParams()
  const { uploadFileAction } = useResources<User>(TAXONOMY_IMPORT)

  const handleTaxonomyImport = (data: FormData, projectId: number | null) => {
    let action = TAXONOMY_IMPORT
    if (projectId) {
      action += `?project_id=${projectId}`
    }

    setErrors([])
    setLoading(true)

    uploadFileAction(action, data)
      .then(() => {
        setFile(null)
        message.info(I18n.t('admin.taxonomy_import_success_msg'))
      })
      .catch((error) => {
        setErrors(error)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleUpload = () => {
    if (!file || loading) return

    const data = new FormData()
    data.append('file', file.originFileObj as Blob, file.name)

    handleTaxonomyImport(data, projectIdParam ? Number(projectIdParam) : null)
  }

  return (
    <Flex vertical className={styles.container}>
      {errors.length > 0 && (
        <Alert
          message={I18n.t('admin.taxonomy_import_error_title')}
          description={errors.map((e, i) => <div key={i}>{e}</div>)}
          type="error"
          showIcon
          closable
          onClose={() => setErrors([])}
          className="mb-24"
        />
      )}

      <Card title={I18n.t('admin.taxonomy_import_action_taxonomy')}>
        <Text type="secondary" className="mb-16">
          {I18n.t('admin.taxonomy_import_description')}
        </Text>

        <Space orientation="vertical" size="middle" className={styles.spaceFullWidth}>
          <Link
            href="/example_csv/import_taxonomy_sample_file.xlsx"
            target="_blank"
          >
            {I18n.t('admin.taxonomy_import_download_example_file')}
          </Link>

          <Upload.Dragger
            accept=".xlsx,.xls"
            multiple={false}
            beforeUpload={() => false}
            onChange={info => setFile(info.fileList[0] || null)}
            onRemove={() => {
              setFile(null)
              setErrors([])
            }}
            fileList={file ? [file] : []}
          >
            <UploadOutlined className={styles.uploadIcon} />
            <div className="mt-4">
              <Text>
                {I18n.t('admin.taxonomy_import_drag_text')}
              </Text>
            </div>
            <div>
              <Text type="secondary">
                {I18n.t('admin.taxonomy_import_file_hint')}
              </Text>
            </div>
          </Upload.Dragger>

          <Button
            type="primary"
            disabled={!file || loading}
            loading={loading}
            onClick={handleUpload}
            icon={loading ? <LoadingOutlined /> : <CheckOutlined />}
          >
            {I18n.t('admin.taxonomy_import_import_button')}
          </Button>
        </Space>
      </Card>
    </Flex>
  )
}
