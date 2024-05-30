import {
  FC, useState, useEffect, Fragment,
} from 'react'
import {
  Drawer,
  Form,
  Typography,
  Space,
  Button,
  Checkbox,
  Select,
  Input,
  Spin,
  Divider,
  App,
} from 'antd'
import _ from 'lodash'
import { useParams } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from '~/modules/admin/core/rootReducers'
import { CreateResource, UpdateResource } from '~/hooks/useResources/interfaces'
import { useResources } from '~/hooks/useResources'
import ResourceForm from '~/components/ResourceForm'
import { UserDetails } from '~/modules/admin/modules/client/core/users'
import { Admin, AdminPermissions, CurrentUserPermissions } from '~/modules/admin/modules/client/core/admin'
import { getCampaignId } from '~/modules/admin/modules/threeSixtyCampaign/core/campaignDetails'
import styles from './styles.less'
import {
  AdminTypes,
  CampaignTypes,
  ThreeSixtySpecificGrants,
} from './constants'
import { AvailablePermissions } from './core'


const { I18n } = window
const { Option } = Select

const connecter = connect(
  (state: RootState) => ({
    currentCampaignId: getCampaignId(state),
  }),
  {},
)

type PropsFromRedux = ConnectedProps<typeof connecter>

interface OwnProps {
  updateAdmin?: UpdateResource<Admin>
  createAdmin: CreateResource<Admin>
  requestErrors?: { [key: string]: string; }[] | null | undefined
  permissions: AdminPermissions
  currentUserGrants: CurrentUserPermissions
  isSuperAdmin: boolean
  isOpen: boolean
  isEditMode: boolean
  adminId: string
  adminType: string
  campaignType?: string
  handleClose: () => void
  addOrUpdateInProgress: boolean
}

type Props = PropsFromRedux & OwnProps

const AddEditDrawerComponent: FC<Props> = ({
  isOpen,
  isEditMode,
  handleClose,
  updateAdmin,
  createAdmin,
  currentUserGrants,
  isSuperAdmin,
  permissions,
  adminId,
  adminType,
  campaignType,
  currentCampaignId,
  addOrUpdateInProgress,
  requestErrors,
}) => {
  const [form] = Form.useForm()

  const errors = _.compact(
    [
      requestErrors && _.get(requestErrors[0], ['email', 'title']),
      requestErrors && _.get(requestErrors[0], ['userId', 'title']),
      requestErrors && _.get(requestErrors[0], ['projectId', 'title']),
    ],
  )

  const [selected, setSelected] = useState([])
  const [notFromList, setNotFromList] = useState(true)
  const [adminRolesOpen, setAdminRolesOpen] = useState(false)
  const [open, setUserSelectOpen] = useState(true)
  const [availablePermissions, setAvailablePermissions] = useState<AvailablePermissions>({})
  const [selectedUser, setSelectedUser] = useState<Omit<UserDetails, 'enable_2fa'> | null>(
    {
      firstName: '', lastName: '', name: '', email: '', id: '',
    },
  )

  const { message } = App.useApp()
  const params = useParams<{ projectId: string, campaignId: string, clientId: string }>()
  const { projectId } = params
  const { clientId } = params
  const campaignIdParams = params.campaignId

  const campaignId = campaignType === CampaignTypes.common ? campaignIdParams : currentCampaignId


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
    data: adminRoles, fetch: fetchAdminRoles, isLoading: isAdminRolesLoading,
  } = useResources<Admin>(
    `clients/${clientId || projectId}/admin_roles`, {
      apiConfig: { fields: { admin_roles: ['id', 'name'] } },
    },
  )

  const {
    fetchSingle, getResource, collectionAction: membershipCollectionAction,
  } = useResources<Admin>(
    'memberships',
    {
      apiConfig: {
        filter: {
          with_role: adminType,
          client_id_eq: clientId,
          project_id_eq: projectId,
          campaign_id_eq: `${campaignId}`,
        },
        include: ['admin_roles'],
        fields: { admin_roles: ['id', 'name'] },
      },
    },
  )


  const admin = getResource(adminId)

  useEffect(() => {
    let role = adminType
    if (adminType === AdminTypes.CampaignAdmin) {
      role = campaignType === CampaignTypes.common ? AdminTypes.CampaignAdmin : 'threesixty_campaign_admin'
    }
    membershipCollectionAction(
      { action: 'available_permissions', method: 'get', body: { role } },
    ).then((response: AvailablePermissions) => {
      setAvailablePermissions(response)
    })
  }, [])

  useEffect(() => {
    if (isEditMode) {
      fetchSingle({
        id: adminId,
      })
    }
  }, [adminId, isEditMode])

  useEffect(() => {
    fetchAdminRoles()
    form.setFieldsValue({
      adminRoleIds: admin?.adminRoles.map(adminRole => adminRole?.id),
    })
  }, [admin])

  useEffect(() => {
    if (isEditMode) {
      form.setFieldsValue({
        email: admin?.email ?? '',
        firstName: admin?.firstName ?? '',
        lastName: admin?.lastName ?? '',
        grantNames: admin?.grantNames ?? {},
      })
    }
    return () => form.resetFields()
  }, [admin])

  useEffect(() => {
    form.setFieldsValue(({
      userId: selectedUser?.id ? [selectedUser?.id] : undefined,
      firstName: selectedUser?.firstName,
      lastName: selectedUser?.lastName,
    }))
    return () => form.resetFields()
  }, [selectedUser])

  const drawerTitle = isEditMode
    ? I18n.t(`administration.administrators.drawers.view.edit_${adminType}`)
    : I18n.t(`administration.administrators.drawers.view.add_${adminType}`)

  const actionButtonText = isEditMode
    ? I18n.t('administration.administrators.drawers.edit.update')
    : I18n.t('administration.administrators.drawers.edit.save')

  const onClose = () => {
    handleClose()
  }

  const transformValues = (values) => {
    if (isEditMode) {
      return values
    }
    return {
      ...values,
      campaignId,
      clientId,
      projectId,
      role: adminType,
      email: notFromList ? (values?.userId && values?.userId[0]) : undefined,
      userId: notFromList ? [] : values.userId,
    }
  }

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

  const buttons = (
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
        loading={addOrUpdateInProgress}
      >
        {actionButtonText}
      </Button>
      )}
      <Button
        htmlType="reset"
        form="add_edit_admin_form"
        onClick={onClose}
        disabled={addOrUpdateInProgress}
      >
        {I18n.t('administration.administrators.list.actions.cancel_text')}
      </Button>
    </Space>
  )

  return (
    <Drawer
      title={<Typography.Title level={4}>{drawerTitle}</Typography.Title>}
      placement="right"
      maskClosable={false}
      closable={false}
      width="80%"
      zIndex={1001}
      open={isOpen}
      destroyOnClose
      extra={buttons}
    >
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
                  <Input name="admin_first_name" />
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
                  <Input name="admin_last_name" />
                </Form.Item>
              </>
            )}
            <Form.Item
              label={I18n.t('administration.administrators.drawers.edit.admin_roles')}
              name="adminRoleIds"
            >
              <Select
                mode="multiple"
                showSearch={false}
                placeholder={I18n.t('administration.administrators.drawers.edit.admin_role_select')}
                options={_.map(adminRoles, role => ({ label: role.name, value: role.id }))}
                open={adminRolesOpen}
                onFocus={() => setAdminRolesOpen(true)}
                onBlur={() => setAdminRolesOpen(false)}
                notFoundContent={isAdminRolesLoading('fetch') ? <Spin size="small" /> : null}
              />
            </Form.Item>
            {_.map(availablePermissions, (grants, grantFor) => (
              <Fragment key={grantFor}>
                <Form.Item
                  name={['grantNames', `${grantFor}`]}
                  label={_.startCase(grantFor)}
                  initialValue={
                    _.map(admin?.grantNames?.[grantFor], grantName => grantName)
                  }
                >
                  { isSuperAdmin ? (
                    <Checkbox.Group rootClassName={styles.grants_checkbox_group}>
                      {_.map(grants, grant => (
                        <Checkbox key={grant as string} value={grant}>
                          {I18n.t(`administration.administrators.permissions.labels.${grantFor}.${grant}`)}
                          {adminType !== AdminTypes.CampaignAdmin && _.includes(
                            ThreeSixtySpecificGrants[grantFor], grant,
                          ) && (
                            <sup>
                              <a href="#sup-note-1">1</a>
                            </sup>
                          )}
                        </Checkbox>
                      ))}
                    </Checkbox.Group>
                  )
                    : (
                      <Checkbox.Group rootClassName={styles.grants_checkbox_group}>
                        {_.map(grants, grant => (
                          _.get(currentUserGrants, grantFor, [] as unknown[]).includes(grant) && (
                          <Checkbox value={grant} key={grant as string}>
                            {I18n.t(`administration.administrators.permissions.labels.${grantFor}.${grant}`)}
                          </Checkbox>
                          )
                        ))}
                      </Checkbox.Group>
                    )
                  }
                </Form.Item>
                <Divider />
              </Fragment>
            ))}
          </>
        )}
      </ResourceForm>
      {adminType !== AdminTypes.CampaignAdmin && (
        <div className="notes">
          {I18n.t('administration.administrators.drawers.notes.title')}
          <ol className="notes">
            <li id="sup-note-1">
              {I18n.t('administration.administrators.drawers.notes.threesixty_permission')}
            </li>
          </ol>
        </div>
      )}
    </Drawer>
  )
}

export const AddEditDrawer = connecter(AddEditDrawerComponent)
