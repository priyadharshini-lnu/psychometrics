import {
  FC, useState, useEffect, Fragment, ReactNode,
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
import { getTenantId as getCurrentCampaignTenantId } from '~/modules/admin/modules/campaigns/core/current'
import { getClientId as getCurrentProjectTenantId } from '~/modules/admin/modules/client/core/projects'
import styles from './styles.less'
import {
  AdminTypes,
  CampaignTypes,
  ThreeSixtySpecificGrants,
} from './constants'
import { AvailablePermissions } from './core'
import { extractFieldRequestErrors } from '~/utils/requestErrors'


const { I18n } = window
const { Option } = Select

const connecter = connect(
  (state: RootState) => ({
    currentCampaignId: getCampaignId(state),
    currentCampaignTenantId: getCurrentCampaignTenantId(state),
    currentProjectTenantId: getCurrentProjectTenantId(state),
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

const extractRequestErrors = (errors: unknown): string[] => extractFieldRequestErrors(errors, {
  pointerIncludes: ['user.email', 'email'],
  fallbackPaths: ['email', 'user.email', 'userId'],
})

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
  currentCampaignTenantId,
  currentProjectTenantId,
  addOrUpdateInProgress,
  requestErrors,
}) => {
  const [form] = Form.useForm()
  const [submissionErrors, setSubmissionErrors] = useState<string[]>([])

  const errors = submissionErrors.length > 0 ? submissionErrors : extractRequestErrors(requestErrors)

  const [selected, setSelected] = useState([])
  const [notFromList, setNotFromList] = useState(true)
  const [adminRolesOpen, setAdminRolesOpen] = useState(false)
  const [open, setUserSelectOpen] = useState(false)
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [availablePermissions, setAvailablePermissions] = useState<AvailablePermissions>({})
  const [selectedUser, setSelectedUser] = useState<Omit<UserDetails, 'enable_2fa'> | null>(
    {
      firstName: '', lastName: '', name: '', email: '', id: '',
    },
  )

  const { message } = App.useApp()
  const params = useParams() as { projectId: string, campaignId: string, clientId: string }
  const { projectId } = params
  const { clientId } = params
  const campaignIdParams = params.campaignId

  const campaignId = campaignType === CampaignTypes.common ? campaignIdParams : currentCampaignId

  const tenantIdByAdminType = {
    [AdminTypes.ClientAdmin]: clientId,
    [AdminTypes.ProjectAdmin]: currentProjectTenantId,
    [AdminTypes.CampaignAdmin]: currentCampaignTenantId,
  }
  const tenantId = tenantIdByAdminType[adminType]


  const showRequestSuccessMessage = (response) => {
    setSubmissionErrors([])
    if (isEditMode) {
      message.success(
        I18n.t('admin.admin_updated_successfully', {
          name: `${response.firstName} ${response.lastName}`,
        }),
      )
    } else {
      message.success(
        I18n.t('admin.admin_created_successfully', {
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
    `clients/${tenantId}/admin_roles`, {
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
    // Condition should be removed when the backend supports fetching roles for all admins
    if (isSuperAdmin) {
      fetchAdminRoles()
    }
    form.setFieldsValue({
      adminRoleIds: admin?.adminRoles.map(adminRole => adminRole?.id),
    })
  }, [admin, isSuperAdmin])

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
    ? I18n.t(`admin.edit_${adminType}`)
    : I18n.t(`admin.add_${adminType}`)

  const actionButtonText = isEditMode
    ? I18n.t('shared.update')
    : I18n.t('shared.save')

  const onClose = () => {
    handleClose()
  }

  const handleFailedSubmission = (_values, error) => {
    setSubmissionErrors(extractRequestErrors(error))
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
    setSubmissionErrors([])
    setNotFromList(!(_.includes(_.map(users, 'id'), value[0])))
    setSelectedUser(_.find(users, { id: value[0] }) || {
      firstName: '', lastName: '', name: '', email: value[0], id: value[0],
    })
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
      I18n.t('admin.edit_permission_denied', {
        name: `${admin?.firstName} ${admin?.lastName}`,
      }),
    )
    onClose()

    return null
  }

  const buttons = (
    <Space>
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
      <Button
        htmlType="reset"
        form="add_edit_admin_form"
        onClick={onClose}
        disabled={addOrUpdateInProgress}
      >
        {I18n.t('shared.cancel')}
      </Button>
    </Space>
  )

  let userSelectNotFoundContent: ReactNode = null
  if (isUserLoading('fetch')) {
    userSelectNotFoundContent = <Spin size="small" />
  } else if (userSearchTerm.trim()) {
    userSelectNotFoundContent = I18n.t('shared.no_results_found')
  }

  return (
    <Drawer
      title={<Typography.Title level={4}>{drawerTitle}</Typography.Title>}
      placement="right"
      maskClosable={false}
      closable={false}
      width="80%"
      zIndex={1001}
      open={isOpen}
      destroyOnHidden
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
        onFailedSubmission={handleFailedSubmission}
        transformValues={transformValues}
      >
        {() => (
          <>
            {isEditMode && (
              <>
                <Form.Item
                  label={I18n.t('shared.email')}
                  name="email"
                >
                  <Input type="email" disabled />
                </Form.Item>
                <Form.Item
                  label={I18n.t('shared.first_name')}
                  name="firstName"
                >
                  <Input disabled />
                </Form.Item>
                <Form.Item
                  label={I18n.t('shared.last_name')}
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
                  label={I18n.t('shared.email')}
                  rules={[{ required: true }]}
                  validateStatus={errors.length > 0 ? 'error' : undefined}
                  help={errors.length ? (
                    <>
                      {errors.map((error, index) => (
                        <div key={index}>{error}</div>
                      ))}
                    </>
                  ) : null}
                >
                  <Select
                    mode="tags"
                    open={open}
                    value={selected}
                    onChange={(value) => {
                      const trimmedValue = value.map((v: string) => v.trim()).filter(v => v)
                      if (trimmedValue?.length > 1) {
                        trimmedValue.pop()
                      }
                      setRequiredStates(trimmedValue)
                    }}
                    onFocus={() => setUserSelectOpen(true)}
                    onBlur={() => setUserSelectOpen(false)}
                    showSearch={{
                      filterOption: (input, option) => {
                        const optionText = typeof option?.children === 'string' ? option.children : ''
                        return optionText.toLowerCase().includes(input.trim().toLowerCase())
                      },
                      onSearch: (value) => {
                        setUserSelectOpen(true)
                        setUserSearchTerm(value)
                        fetchUsers({
                          apiConfig: {
                            filter: { search_query: value, admins: 'true' },
                            fields: { users: ['id', 'email', 'first_name', 'last_name'] },
                          },
                        })
                      },
                    }}
                    notFoundContent={userSelectNotFoundContent}
                  >
                    {users.map(({ id, email }) => (
                      <Option key={id} value={id}>
                        {email}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  label={I18n.t('shared.first_name')}
                  name="firstName"
                  rules={[
                    {
                      required: true,
                      message: I18n.t(
                        'admin.first_name_required',
                      ),
                    },
                  ]}
                >
                  <Input name="admin_first_name" />
                </Form.Item>
                <Form.Item
                  label={I18n.t('shared.last_name')}
                  name="lastName"
                  rules={[
                    {
                      required: true,
                      message: I18n.t(
                        'admin.last_name_required',
                      ),
                    },
                  ]}
                >
                  <Input name="admin_last_name" />
                </Form.Item>
              </>
            )}
            {isSuperAdmin ? (
              <Form.Item
                label={I18n.t('admin.admin_roles')}
                name="adminRoleIds"
              >
                <Select
                  mode="multiple"
                  showSearch={false}
                  placeholder={I18n.t('admin.select_admin_role')}
                  options={_.map(adminRoles, role => ({ label: role.name, value: role.id }))}
                  open={adminRolesOpen}
                  onFocus={() => setAdminRolesOpen(true)}
                  onBlur={() => setAdminRolesOpen(false)}
                  notFoundContent={
                    isAdminRolesLoading('fetch') ? <Spin size="small" /> : I18n.t('shared.no_results_found')
                  }
                />
              </Form.Item>
            ) : null}
            {_.map(availablePermissions, (grants, grantFor) => (
              <Fragment key={grantFor}>
                <Form.Item
                  name={['grantNames', `${grantFor}`]}
                  label={I18n.t(`admin.permissions.${grantFor}.title`)}
                  initialValue={
                    _.map(admin?.grantNames?.[grantFor], grantName => grantName)
                  }
                >
                  { isSuperAdmin ? (
                    <Checkbox.Group rootClassName={styles.grants_checkbox_group}>
                      {_.map(grants, grant => (
                        <Checkbox key={grant as string} value={grant}>
                          {I18n.t(`admin.permissions.${grantFor}.${grant}`)}
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
                              {I18n.t(`admin.permissions.${grantFor}.${grant}`)}
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
          {I18n.t('admin.notes')}
          <ol className="notes">
            <li id="sup-note-1">
              {I18n.t('admin.permissions_360_campaigns')}
            </li>
          </ol>
        </div>
      )}
    </Drawer>
  )
}

export const AddEditDrawer = connecter(AddEditDrawerComponent)
