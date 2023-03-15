import React, {
  FC, useState, useEffect,
} from 'react'
import {
  Drawer,
  Form,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Checkbox,
  Select,
  Input,
  Spin,
  message,
  Divider,
} from 'antd'
import _ from 'lodash'
import { useHistory, useParams } from 'react-router-dom'
import { CreateResource, UpdateResource } from '~/hooks/useResources/interfaces'
import { useResources } from '~/hooks/useResources'
import ResourceForm from '~/components/ResourceForm'
import { UserDetails } from '~/modules/admin/modules/client/core/users'
import { Admin, AdminPermissions, CurrentUserPermissions } from '~/modules/admin/modules/client/core/admin'
import styles from './styles.less'
import { AdminTypes, CampaignAdminGrants, ProjectAdminGrants } from './constants'

const { I18n } = window
const { Option } = Select

interface Props {
  updateAdmin?: UpdateResource<Admin>
  createAdmin: CreateResource<Admin>
  permissions: AdminPermissions
  currentUserGrants: CurrentUserPermissions
  isSuperAdmin: boolean
  isVisible: boolean
  isEditMode: boolean
  adminId: string
  adminType: string
  handleClose: () => void
}

const AddEditDrawerComponent: FC<Props> = ({
  isVisible,
  isEditMode,
  handleClose,
  updateAdmin,
  createAdmin,
  currentUserGrants,
  isSuperAdmin,
  permissions,
  adminId,
  adminType,
}) => {
  const [form] = Form.useForm()

  const [selected, setSelected] = useState([])

  const [notFromList, setNotFromList] = useState(true)

  const [open, setUserSelectOpen] = useState(true)

  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(
    {
      firstName: '', lastName: '', name: '', email: '', id: '',
    },
  )

  const grantsHash = adminType === AdminTypes.ProjectAdmin
    ? ProjectAdminGrants : CampaignAdminGrants

  const { projectId } = useParams<{ projectId: string }>()
  const { campaignId } = useParams<{ campaignId: string }>()

  const historyPath = (adminType === AdminTypes.CampaignAdmin)
    ? `/administration/projects/${projectId}/new_campaigns/${campaignId}/admins`
    : `/administration/projects/${projectId}/admins`

  const showRequestSuccessMessage = (response) => {
    if (isEditMode) {
      message.success(
        I18n.t('administration.administrators.drawers.edit.update_success', {
          name: `${response.firstName} ${response.lastName}`,
        }),
      )
    } else {
      message.success(
        I18n.t('administration.administrators.drawers.edit.create_success', {
          name: `${response.firstName} ${response.lastName}`,
        }),
      )
    }
    onClose()
  }

  const {
    data: users, fetch: fetchUsers, isLoading: isUserLoading,
  } = useResources<UserDetails>('users')

  const {
    fetchSingle, getResource, getErrors,
  } = useResources<Admin>(
    'memberships',
    {
      apiConfig: {
        filter: {
          with_role: adminType,
          client_id_eq: projectId,
          campaign_id_eq: campaignId,
        },
      },
    },
  )

  const requestErrors = getErrors('add')

  const errors = _.compact(
    [
      requestErrors && _.get(requestErrors[0], ['email', 'title']),
      requestErrors && _.get(requestErrors[0], ['userId', 'title']),
    ],
  )

  const admin = getResource(adminId)

  useEffect(() => {
    if (isEditMode) {
      fetchSingle({
        id: adminId,
      })
    }
  }, [adminId, isEditMode])

  useEffect(() => {
    if (isEditMode) {
      form.setFieldsValue(({
        email: admin?.email ?? '',
        firstName: admin?.firstName ?? '',
        lastName: admin?.lastName ?? '',
        grantNames: admin?.grantNames ?? {},
      }))
    }
  }, [admin])

  useEffect(() => {
    form.setFieldsValue(({ firstName: selectedUser?.firstName, lastName: selectedUser?.lastName }))
  }, [selectedUser])

  const drawerTitle = isEditMode
    ? I18n.t(`administration.administrators.drawers.view.edit_${adminType}`)
    : I18n.t(`administration.administrators.drawers.view.add_${adminType}`)

  const actionButtonText = isEditMode
    ? I18n.t('administration.administrators.drawers.edit.update')
    : I18n.t('administration.administrators.drawers.edit.save')

  const onClose = () => {
    form.resetFields()
    history.push(historyPath)
    handleClose()
  }

  const history = useHistory()

  const transformValues = values => ({
    ...values,
    campaignId,
    clientId: projectId,
    role: adminType,
    email: notFromList ? values.userId[0] : undefined,
    userId: notFromList ? [] : values.userId,
  })

  const setRequiredStates = (value) => {
    setNotFromList(!(_.includes(_.map(users, 'id'), value[0])))
    setSelectedUser(_.find(users, { id: value[0] }) || null)
    setSelected(value[0])
    setUserSelectOpen(false)
  }

  if (
    isEditMode
    && admin
    && permissions
    && permissions.edit === false
  ) {
    message.error(
      I18n.t('administration.administrators.drawers.edit.no_edit_permission', {
        name: `${admin?.firstName} ${admin?.lastName}`,
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
      width="80%"
      zIndex={1001}
      visible={isVisible}
      destroyOnClose
    >
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <Typography.Title level={4}>{drawerTitle}</Typography.Title>
        </Col>
        <Col>
          <Space>
            {true && (
              <Button
                htmlType="submit"
                key="submit"
                form="add_edit_admin_form"
                type="primary"
                onClick={() => {
                  form.submit()
                }}
              >
                {actionButtonText}
              </Button>
            )}
            <Button
              htmlType="reset"
              form="add_edit_admin_form"
              onClick={onClose}
            >
              {I18n.t('administration.administrators.list.actions.cancel_text')}
            </Button>
          </Space>
        </Col>
      </Row>
      <ResourceForm
        resourceName="memberships"
        resource={admin}
        readableResourceName="Admin"
        storeManager={{ form }}
        formProps={{
          labelAlign: 'left',
          id: 'edit_participant_form',
          preserve: false,
        }}
        scrollToFirstError
        request={{
          createResource: createAdmin,
          updateResource: updateAdmin,
        }}
        onSuccessfulSubmission={showRequestSuccessMessage}
        transformValues={transformValues}
      >
        {() => (
          <>
            {isEditMode && (
              <>
                <Form.Item
                  label={I18n.t('administration.administrators.list.columns.email')}
                  name="email"
                >
                  <Input type="email" disabled />
                </Form.Item>
                <Form.Item
                  label={I18n.t(
                    'administration.administrators.drawers.edit.first_name',
                  )}
                  name="firstName"
                >
                  <Input disabled />
                </Form.Item>
                <Form.Item
                  label={I18n.t(
                    'administration.administrators.drawers.edit.last_name',
                  )}
                  name="lastName"
                >
                  <Input disabled />
                </Form.Item>
              </>
            )}
            {!isEditMode && (
              <>
                <Form.Item
                  name="userId"
                  label={I18n.t(
                    'administration.administrators.drawers.edit.email',
                  )}
                  rules={[{ required: true }]}
                  validateStatus={errors.length > 0 ? 'error' : 'success'}
                  help={errors.length ? errors : null}
                >
                  <Select
                    mode="tags"
                    open={open}
                    value={selected}
                    onChange={(value) => {
                      if (value?.length > 1) {
                        value.pop()
                      }
                      setRequiredStates(value)
                    }}
                    onFocus={() => setUserSelectOpen(true)}
                    onBlur={() => setUserSelectOpen(false)}
                    showSearch
                    onSearch={(value) => {
                      setUserSelectOpen(true)
                      fetchUsers({
                        apiConfig: {
                          filter: { search_query: value, admins: 'true' },
                          fields: { users: ['id', 'email', 'first_name', 'last_name'] },
                        },
                      })
                    }}
                    notFoundContent={isUserLoading('fetch') ? <Spin size="small" /> : null}
                    optionFilterProp="children"
                  >
                    {users.map(({ id, email }) => (
                      <Option key={id} value={id}>
                        {email}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  label={I18n.t(
                    'administration.administrators.drawers.edit.first_name',
                  )}
                  name="firstName"
                  rules={[
                    {
                      required: true,
                      message: I18n.t(
                        'administration.administrators.drawers.edit.first_name_required',
                      ),
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label={I18n.t(
                    'administration.administrators.drawers.edit.last_name',
                  )}
                  name="lastName"
                  rules={[
                    {
                      required: true,
                      message: I18n.t(
                        'administration.administrators.drawers.edit.last_name_required',
                      ),
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </>
            )}
            {_.map(grantsHash, (grants, grantFor) => (
              <>
                <Form.Item
                  name={['grantNames', `${grantFor}`]}
                  label={_.startCase(grantFor)}
                  initialValue={
                    _.map(admin?.grantNames?.[grantFor], grantName => grantName)
                  }
                >
                  { isSuperAdmin ? (
                    <Checkbox.Group className={styles.grants_checkbox_group}>
                      {_.map(grants, grant => (
                        <Checkbox value={grant}>
                          {I18n.t(`administration.administrators.permissions.labels.${grantFor}.${grant}`)}
                        </Checkbox>
                      ))}
                    </Checkbox.Group>
                  )
                    : (
                      <Checkbox.Group className={styles.grants_checkbox_group}>
                        {_.map(grants, grant => (
                          _.get(currentUserGrants, grantFor, []).includes(grant) && (
                          <Checkbox value={grant}>
                            {I18n.t(`administration.administrators.permissions.labels.${grantFor}.${grant}`)}
                          </Checkbox>
                          )
                        ))}
                      </Checkbox.Group>
                    )
                  }
                </Form.Item>
                <Divider />
              </>
            ))}
          </>
        )}
      </ResourceForm>
    </Drawer>
  )
}

export const AddEditDrawer = AddEditDrawerComponent
