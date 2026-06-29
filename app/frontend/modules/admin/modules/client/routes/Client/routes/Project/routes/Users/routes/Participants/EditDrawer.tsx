import { FC } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Drawer, Form, Row, Col, Typography, Space, Button, Skeleton, Input, message, List,
} from 'antd'

import {
  Participant,
  FETCH_SINGLE as FETCH_PROJECT_SINGLE_PARTICIPANT,
  getCurrent as getCurrentParticipant,
  UPDATE as UPDATE_PROJECT_PARTICIPANT,
} from '~/modules/admin/modules/client/core/participants'
import { isRequestInProgress } from '~/core/request'
import { RootState } from '~/modules/admin/core/rootReducers'

import ResourceForm from '~/components/ResourceForm'
import { constructCampaignUrl } from '../commonUtils'

const { I18n } = window

const connector = connect(
  (state: RootState) => ({
    participant: getCurrentParticipant(state),
    isFetching: isRequestInProgress(state, FETCH_PROJECT_SINGLE_PARTICIPANT),
    isUpdating: isRequestInProgress(state, UPDATE_PROJECT_PARTICIPANT),
  }),
)

type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps {
  isOpen: boolean
  projectId: number
  participantId: string
  handleClose(): void
}

type Props = PropsFromRedux & OwnProps

const EditDrawerComponent: FC<Props> = ({
  isOpen,
  projectId,
  participantId,
  handleClose,
  isFetching,
  participant,
  isUpdating,
}) => {
  const [form] = Form.useForm<Participant>()
  const parsedParticipantId = parseInt(participantId, 10)

  const onClose = () => {
    form.resetFields()
    handleClose()
  }

  if (participant && participant.permissions && participant.permissions.edit === false) {
    message.error(
      I18n.t('admin.project_users_no_edit_permission', {
        name: `${participant.firstName} ${participant.lastName}`,
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
            {I18n.t('admin.project_participants_edit_participant')}
          </Typography.Title>
        </Col>
        <Col>
          <Space>
            {participant && (
              <Button
                htmlType="submit"
                form="edit_participant_form"
                type="primary"
                loading={isUpdating}
                disabled={isFetching}
              >
                {I18n.t('shared.save')}
              </Button>
            )}
            <Button htmlType="reset" form="edit_participant_form" onClick={onClose}>
              {I18n.t('shared.cancel')}
            </Button>
          </Space>
        </Col>
      </Row>
      <ResourceForm
        resourceName="participants"
        requestScope="projects"
        resourceBaseUrl={`/administration/projects/${projectId}/participants`}
        resource={participant}
        resourceId={parsedParticipantId}
        showSuccessMessages
        onSuccessfulSubmission={onClose}
        scrollToFirstError
        mockRequest // to be removed when API is available
        storeManager={{ form }}
        formProps={{
          layout: 'vertical',
          labelAlign: 'left',
          id: 'edit_participant_form',
          preserve: false,
        }}
      >
        {() => (
          <Skeleton loading={isFetching} active title>
            <Form.Item name="firstName" label={I18n.t('shared.first_name')}>
              <Input autoFocus />
            </Form.Item>
            <Form.Item name="lastName" label={I18n.t('shared.last_name')}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label={I18n.t('shared.email')}>
              <Input />
            </Form.Item>
            <Form.Item label={I18n.t('admin.project_participants_column_created_at')}>
              <Input value={participant?.createdAt} variant="borderless" />
            </Form.Item>
            <Form.Item name="campaigns" label={I18n.t('admin.project_participants_column_campaigns')}>
              <List
                size="small"
                split={false}
                dataSource={participant?.campaigns}
                renderItem={campaign => (
                  <List.Item>
                    <Link to={constructCampaignUrl(projectId, campaign.id)}>{campaign.name}</Link>
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
