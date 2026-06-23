import React from 'react'
import {
  Alert,
  Button, Col, Form, Input, App, Row, Skeleton, Switch, Upload, Select,
} from 'antd'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { connect, ConnectedProps } from 'react-redux'
import _ from 'lodash'
import { MessageInstance } from 'antd/es/message/interface'
import { UploadOutlined, CopyOutlined, RedoOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { RootState } from '~/modules/admin/core/rootReducers'
import ResourceForm from '~/components/ResourceForm'
import {
  Dashboard as DashboardType,
  DashboardTR,
  uploadImage,
  UPLOAD_IMAGE,
  refresh,
  REFRESH,
  useDashboardStore,
} from '~/modules/admin/modules/campaigns/core/dashboard'
import { useResources } from '~/hooks/useResources'
import { isRequestInProgress } from '~/core/request'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    uploadInProgress: isRequestInProgress(state, UPLOAD_IMAGE),
    refreshRequestInProgress: isRequestInProgress(state, REFRESH),
  }),
  {
    uploadImage,
    refresh,
  },
)
type PropsFromRedux = ConnectedProps<typeof connecter>
type Props = PropsFromRedux

export const SettingsComponent: React.FC<Props> = ({
  uploadImage, uploadInProgress, refresh, refreshRequestInProgress,
}) => {
  const [form] = Form.useForm()
  const stateManager = useDashboardStore()
  const {
    updateResource, data, isLoading,
  } = useResources<DashboardType>('dashboards', { responseType: DashboardTR, stateManager })
  const { message } = App.useApp()
  const dashboard = data[0]
  const canBeRefreshed = !_.isEmpty(dashboard?.datasetId) && !_.isEmpty(dashboard?.reportId)

  const showSuccessMessage = () => {
    message.success(
      I18n.t(
        'frontend.resource.update_success',
        { readableResourceName: I18n.t('admin.dashboard') },
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
      formData.append('purge_image', '1')
    } else {
      formData.append('image', image.file as unknown as File, image.file.name)
    }

    uploadImage(data[0].id, formData).then(() => {
      showSuccessMessage()
    }).catch(() => {
      message.error(I18n.t('admin.dashboard_form_image_upload_failed'))
    })
  }

  const handleRefresh = () => {
    refresh(dashboard.id).then(() => {
      message.success(I18n.t('admin.dashboard_form_refresh_success'))
    }).catch((error) => {
      message.error(error)
    })
  }

  const image = Form.useWatch('imageUrl', form)

  if (isLoading('fetch') && !dashboard) return <Skeleton />

  return (
    <Row justify="space-between" className="pl">
      <Col sm={24} md={16} xl={12} xxl={10}>
        <ResourceForm
          resourceName="dashboards"
          readableResourceName={I18n.t('admin.dashboard')}
          resource={dashboard}
          scrollToFirstError
          request={{
            updateResource,
          }}
          transformValues={values => _.omit(values, ['imageUrl'])}
          storeManager={{ form }}
          onSuccessfulSubmission={uploadFile}
          nullifyEmptyString
        >
          {({ form }) => (
            <>
              <Form.Item
                name="enabled"
                label={I18n.t('admin.enabled')}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="dashboardType"
                label={I18n.t('common.column.type')}
                getValueProps={value => ({ value: I18n.t(`admin.dashboard_dashboard_types_${value}`) })}
              >
                <Input disabled />
              </Form.Item>
              <Form.Item
                name="name"
                label={I18n.t('common.column.name')}
                rules={[{ required: true }]}
              >
                <Input name="dashboard_tab_name" />
              </Form.Item>
              {dashboard.dashboardType === 'powerbi' && <PowerBIFields />}
              {dashboard.dashboardType === 'oracle_analytics' && <OracleAnalyticsFields />}
              <Form.Item name="imageUrl" label={I18n.t('admin.image')}>
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
                  <Button icon={<UploadOutlined />}>{I18n.t('shared.upload')}</Button>
                </Upload>
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading(`update@${data[0]?.id}`) || uploadInProgress}
                className="mb-16"
              >
                {I18n.t('shared.update')}
              </Button>
            </>
          )}
        </ResourceForm>
      </Col>
      {dashboard.dashboardType === 'powerbi' && (
        <Col sm={24} md={16} xl={10}>
          <AdditionalInfoForPowerBi
            canBeRefreshed={canBeRefreshed}
            handleRefresh={handleRefresh}
            refreshRequestInProgress={refreshRequestInProgress}
            capacityId={dashboard.capacityId}
            workspaceId={dashboard.workspaceId}
            message={message}
          />
        </Col>
      )}
    </Row>
  )
}

export const Settings = connecter(SettingsComponent)

const PowerBIFields = () => (
  <>
    <Form.Item
      name="datasetId"
      label={I18n.t('admin.dataset_id')}
    >
      <Input />
    </Form.Item>
    <Form.Item
      name="reportId"
      label={I18n.t('admin.report_id')}
    >
      <Input />
    </Form.Item>
    <Form.Item
      name="refreshInterval"
      label={I18n.t('admin.refresh_interval')}
    >
      <Select>
        {[null, 15, 30, 60, 90].map(n => (
          <Select.Option key={n || 'None'} value={n}>
            {n || I18n.t('admin.dashboard_form_none')}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
    <Form.Item
      name="visualHeaderVisibility"
      label={I18n.t('admin.visual_header_visibility')}
    >
      <Select
        options={
            ['hide_all', 'show_all', 'keep_original'].map(opt => ({
              value: opt, label: I18n.t(`admin.${opt}`),
            }))
          }
      />
    </Form.Item>
  </>
)

const OracleAnalyticsFields = () => (
  <>
    <Form.Item
      name="projectPath"
      label={I18n.t('admin.project_path')}
    >
      <Input />
    </Form.Item>
  </>
)


interface AdditionalInfoForPowerBiProps {
  canBeRefreshed: boolean
  refreshRequestInProgress: boolean
  handleRefresh: () => void
  message: MessageInstance
  capacityId?: string | null
  workspaceId?: string | null
}

const AdditionalInfoForPowerBi: React.FC<AdditionalInfoForPowerBiProps> = ({
  capacityId, workspaceId, canBeRefreshed, handleRefresh, refreshRequestInProgress, message,
}) => (
  <Alert
    message={(
      <>
        {I18n.t('admin.dashboard_settings_details')}
        {canBeRefreshed
          && (
            <Button
              type="primary"
              icon={<RedoOutlined />}
              onClick={handleRefresh}
              loading={refreshRequestInProgress}
              className="float-r"
            >
              {I18n.t('admin.dashboard_settings_refresh')}
            </Button>
          )}
      </>
    )}
    description={(
      <Form layout="vertical" className="clear-float">
        {capacityId && (
          <Form.Item
            label={
            `${I18n.t('admin.dashboard_settings_capacity_id')}`
          }
            initialValue={capacityId}
            name="capacityId"
          >
            <Input
              readOnly
              suffix={(
                <CopyToClipboard
                  text={capacityId}
                  onCopy={() => {
                    message.info(I18n.t('common.text.copied'))
                  }}
                >
                  <CopyOutlined />
                </CopyToClipboard>
            )}
            />
          </Form.Item>
        )}

        {workspaceId && (
          <Form.Item
            label={I18n.t('admin.dashboard_settings_workspace_id')}
            initialValue={workspaceId}
            name="workspaceId"
          >
            <Input
              readOnly
              suffix={(
                <CopyToClipboard
                  text={workspaceId}
                  onCopy={() => {
                    message.info(I18n.t('shared.copied'))
                  }}
                >
                  <CopyOutlined />
                </CopyToClipboard>
            )}
            />
          </Form.Item>
        )}
      </Form>
)}
    type="info"
    showIcon
  />
)
