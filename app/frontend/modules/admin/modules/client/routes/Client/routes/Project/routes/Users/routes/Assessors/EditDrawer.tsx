import { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Drawer,
  Form,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Skeleton,
  Input,
  message,
  List,
} from 'antd'

import {
  Assessor,
  FETCH_SINGLE as FETCH_PROJECT_SINGLE_ASSESSOR,
  getCurrent as getCurrentAssessor,
  UPDATE as UPDATE_PROJECT_ASSESSOR,
} from '~/modules/admin/modules/client/core/assessors'
import { isRequestInProgress } from '~/core/request'
import { RootState } from '~/modules/admin/core/rootReducers'

import ResourceForm from '~/components/ResourceForm'
import { constructCampaignUrl } from '../commonUtils'

const { I18n } = window

const connector = connect(
  (state: RootState) => ({
    assessor: getCurrentAssessor(state),
    isFetching: isRequestInProgress(state, FETCH_PROJECT_SINGLE_ASSESSOR),
    isUpdating: isRequestInProgress(state, UPDATE_PROJECT_ASSESSOR),
  }),
)

type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps {
  isOpen: boolean
  projectId: number
  assessorId: string
  handleClose: () => void
}

type Props = PropsFromRedux & OwnProps

const EditDrawerComponent: FC<Props> = ({
  isOpen,
  projectId,
  assessorId,
  handleClose,
  isFetching,
  assessor,
  isUpdating,
}) => {
  const [form] = Form.useForm<Assessor>()

  const parsedAssessorId = parseInt(assessorId, 10)

  const onClose = () => {
    form.resetFields()
    handleClose()
  }

  if (assessor && assessor.permissions && assessor.permissions.edit === false) {
    message.error(
      I18n.t('admin.project_users_no_edit_permission', {
        name: `${assessor.firstName} ${assessor.lastName}`,
      }),
    )
    onClose()

    return null
  }

  return (
    <Drawer
      placement="right"
      maskClosable={false}
      closable={false}
      width="40%"
      zIndex={1001}
      open={isOpen}
      destroyOnHidden
    >
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <Typography.Title level={4}>
            {I18n.t('admin.project_users_edit_assessor')}
          </Typography.Title>
        </Col>
        <Col>
          <Space>
            {assessor && (
              <Button
                htmlType="submit"
                form="edit_assessor_form"
                type="primary"
                loading={isUpdating}
                disabled={isFetching}
              >
                {I18n.t('shared.save')}
              </Button>
            )}
            <Button
              htmlType="reset"
              form="edit_assessor_form"
              onClick={onClose}
            >
              {I18n.t('shared.cancel')}
            </Button>
          </Space>
        </Col>
      </Row>
      <ResourceForm
        resourceName="assesssors"
        resourceBaseUrl={`/administration/projects/${projectId}/assesssors`}
        requestScope="projects"
        resourceId={parsedAssessorId}
        showSuccessMessages
        onSuccessfulSubmission={onClose}
        scrollToFirstError
        storeManager={{ form }}
        mockRequest
        formProps={{
          layout: 'vertical',
          labelAlign: 'left',
          id: 'edit_assessor_form',
          preserve: false,
        }}
      >
        {() => (
          <Skeleton loading={isFetching} title>
            <Form.Item
              name="firstName"
              label={I18n.t('shared.first_name')}
            >
              <Input autoFocus />
            </Form.Item>
            <Form.Item
              name="lastName"
              label={I18n.t('shared.last_name')}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={I18n.t('shared.email')}
            >
              <Input value={assessor?.email} variant="borderless" />
            </Form.Item>
            <Form.Item
              label={I18n.t('admin.project_users_column_created_at')}
            >
              <Input value={assessor?.createdAt} variant="borderless" />
            </Form.Item>
            <Form.Item
              label={I18n.t('admin.project_users_column_campaigns')}
            >
              <List
                size="small"
                split={false}
                dataSource={assessor?.campaigns}
                renderItem={campaign => (
                  <List.Item>
                    <Link to={constructCampaignUrl(projectId, campaign.id)}>
                      {campaign.name}
                    </Link>
                  </List.Item>
                )}
              />
            </Form.Item>
          </Skeleton>
        )}
      </ResourceForm>
    </Drawer>
  )
}

export const EditDrawer = connector(EditDrawerComponent)
