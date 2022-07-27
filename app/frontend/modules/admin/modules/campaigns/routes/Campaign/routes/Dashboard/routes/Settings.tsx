import { useResources } from 'hooks/useResources'
import React from 'react'
import {
  Dashboard as DashboardType,
  dashboardAtom, DashboardTR,
  uploadImage,
  UPLOAD_IMAGE,
} from 'modules/admin/modules/campaigns/core/dashboard'
import {
  Alert,
  Button, Col, Form, Input, message, Row, Skeleton, Switch, Upload,
} from 'antd'
import { UploadOutlined, CopyOutlined } from '@ant-design/icons'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import ResourceForm from 'components/ResourceForm'
import { useRecoilStateStateManager } from 'hooks/useRecoilStateStateManager'
import { useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from 'modules/admin/core/rootReducers'
import { isRequestInProgress } from 'modules/admin/core/request'
import _ from 'lodash'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    uploadInProgress: isRequestInProgress(state, UPLOAD_IMAGE),
  }),
  {
    uploadImage,
  },
)
type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

export const SettingsComponent: React.FC<Props> = ({ uploadImage, uploadInProgress }) => {
  const { campaignId } = useParams<{ campaignId: string }>()
  const [form] = Form.useForm()
  const stateManager = useRecoilStateStateManager(dashboardAtom)
  const {
    updateResource, data, isLoading,
  } = useResources<DashboardType>('dashboards', { responseType: DashboardTR, stateManager })

  const showSuccessMessage = () => {
    message.success(
      I18n.t(
        'frontend.resource.update_success',
        { readableResourceName: I18n.t('administration.dashboard.tabs.dashboard') },
      ),
    )
  }

  const uploadFile = (_, { imageUrl: image }) => {
    if (!image) {
      showSuccessMessage()
      return
    }

    const formData = new FormData()
    if (image.file.status === 'removed') {
      formData.append('remove_image', '1')
    } else {
      formData.append('image', image.file as unknown as File, image.file.name)
    }

    uploadImage(data[0].id, formData).then(() => {
      showSuccessMessage()
    }).catch(() => {
      message.error(I18n.t('administration.dashboard_form.image_upload_failed'))
    })
  }

  const image = Form.useWatch('imageUrl', form)

  if (isLoading('fetch') && !data[0]) return <Skeleton />

  return (
    <Row justify="space-between" className="pl">
      <Col sm={24} md={16} xl={12} xxl={10}>
        <ResourceForm
          resourceName="dashboards"
          readableResourceName={I18n.t('administration.dashboard.tabs.dashboard')}
          resource={data[0]}
          scrollToFirstError
          request={{
            updateResource,
          }}
          transformValues={values => _.omit(values, ['imageUrl'])}
          storeManager={{ form }}
          onSuccessfulSubmission={uploadFile}
        >
          {({ form }) => (
            <>
              <Form.Item
                name="enabled"
                label={I18n.t('administration.dashboard_form.fields.enabled')}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="name"
                label={I18n.t('common.column.name')}
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="datasetId"
                label={I18n.t('administration.dashboard_form.fields.dataset_id')}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="reportId"
                label={I18n.t('administration.dashboard_form.fields.report_id')}
              >
                <Input />
              </Form.Item>
              <Form.Item name="imageUrl" label={I18n.t('administration.dashboard_form.fields.image')}>
                <Upload
                  listType="picture"
                  maxCount={1}
                  onRemove={() => form.setFieldsValue({ imageUrl: null })}
                  accept=".jpg, .png, .jpeg, .svg|image/*"
                  fileList={image && typeof image === 'string' ? [{
                    uid: '1', name: 'Image', status: 'done', url: image,
                  }] : undefined}
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadOutlined />}>{I18n.t('common.actions.upload')}</Button>
                </Upload>
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading(`update@${data[0]?.id}`) || uploadInProgress}
                className="mb-16"
              >
                {I18n.t('common.actions.update')}
              </Button>
            </>
          )}
        </ResourceForm>
      </Col>
      <Col sm={24} md={16} xl={10}>
        <ViewNameInfo campaignId={campaignId} />
      </Col>
    </Row>
  )
}

export const Settings = connecter(SettingsComponent)

interface ViewNameInfoProps {
  campaignId: string
}

const ViewNameInfo: React.FC<ViewNameInfoProps> = ({ campaignId }) => (
  <Alert
    message={I18n.t('administration.dashboard.settings.view_names')}
    description={(
      <Form layout="vertical">
        <Form.Item
          label={I18n.t('administration.dashboard.settings.datasheet_view_name')}
          initialValue={`c_${campaignId}_datasheet`}
          name="datasheetView"
        >
          <Input
            readOnly
            suffix={(
              <CopyToClipboard
                text={`c_${campaignId}_datasheet`}
                onCopy={() => {
                  message.info(I18n.t('common.text.copied'))
                }}
              >
                <CopyOutlined />
              </CopyToClipboard>
            )}
          />
        </Form.Item>

        <Form.Item
          label={I18n.t('administration.dashboard.settings.accesssheet_view_name')}
          initialValue={`c_${campaignId}_accesssheet`}
          name="accesssheetView"
        >
          <Input
            readOnly
            suffix={(
              <CopyToClipboard
                text={`c_${campaignId}_accesssheet`}
                onCopy={() => {
                  message.info(I18n.t('common.text.copied'))
                }}
              >
                <CopyOutlined />
              </CopyToClipboard>
            )}
          />
        </Form.Item>
      </Form>
)}
    type="info"
    showIcon
  />
)
