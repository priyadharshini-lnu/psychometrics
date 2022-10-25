import React, { FC, useEffect } from 'react'
import { connect, ConnectedProps } from 'react-redux'
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
  Checkbox,
  message,
  Divider,
} from 'antd'

import {
  fetchSingle as fetchAdmin,
  FETCH_SINGLE as FETCH_CAMPAIGN_SINGLE_ADMINS,
  getCurrent as getCurrentAdmin,
  SEARCH as SEARCH_ADMIN,
  search as searchAdmin,
  UpdateRequest as UpdateAdminRequest,
  update as updateAdmin,
  UPDATE as UPDATE_ADMIN,
  CreateRequest as CreateAdminRequest,
  create as createAdmin,
  CREATE as CREATE_ADMIN,
} from 'modules/admin/modules/Admins/core'
import { isRequestInProgress } from 'core/request'
import { RootState } from 'modules/admin/core/rootReducers'
import { GrantType, ParentResourceType } from './constants'

const { I18n } = window

const connector = connect(
  (state: RootState) => ({
    admin: getCurrentAdmin(state),
    isFetching: isRequestInProgress(state, FETCH_CAMPAIGN_SINGLE_ADMINS),
    isSearching: isRequestInProgress(state, SEARCH_ADMIN),
    isUpdating: isRequestInProgress(state, UPDATE_ADMIN),
    isCreating: isRequestInProgress(state, CREATE_ADMIN),
  }),
  {
    fetchAdmin,
    searchAdmin,
    updateAdmin,
    createAdmin,
  },
)

type PropsFromRedux = ConnectedProps<typeof connector>

interface OwnProps {
  isVisible: boolean
  parentResourceType: ParentResourceType
  parentResourceId: number
  isEditMode: boolean
  isAddMode: boolean
  adminId: string
  handleClose: () => void
}

type Props = PropsFromRedux & OwnProps

const AddEditDrawerComponent: FC<Props> = ({
  isVisible,
  parentResourceType,
  parentResourceId,
  isEditMode,
  isAddMode,
  adminId,
  handleClose,
  fetchAdmin,
  isFetching,
  isSearching,
  searchAdmin,
  updateAdmin,
  isUpdating,
  createAdmin,
  isCreating,
  admin,
}) => {
  type FormDataType = {
    email: string
    firstName: string
    lastName: string
  } & Record<string, string | boolean | undefined>

  const [form] = Form.useForm<FormDataType>()

  useEffect(() => {
    if (isEditMode) {
      fetchAdmin(parentResourceType, parentResourceId, parseInt(adminId, 10))
    }
  }, [adminId, parentResourceId, isEditMode])

  useEffect(() => {
    form.resetFields()

    if (isEditMode || isAddMode) {
      if (admin && admin.email && admin.email.length !== 0) {
        const formFieldsValues = {
          email: admin.email,
          firstName: admin?.firstName ?? '',
          lastName: admin?.lastName ?? '',
          [`assessors-${GrantType.manage}`]:
            admin?.grants?.data?.assessors?.includes(GrantType.manage),
          [`campaigns-${GrantType.view}`]:
            admin?.grants?.data?.campaigns?.includes(GrantType.view),
          [`campaigns-${GrantType.manage}`]:
            admin?.grants?.data?.campaigns?.includes(GrantType.manage),
          [`campaigns-${GrantType.manage_users}`]:
            admin?.grants?.data?.campaigns?.includes(GrantType.manage_users),
          [`campaigns-${GrantType.manage_options}`]:
            admin?.grants?.data?.campaigns?.includes(GrantType.manage_options),
          [`smsInvites-${GrantType.view}`]:
            admin?.grants?.data?.smsInvites?.includes(GrantType.view),
          [`smsInvites-${GrantType.manage}`]:
            admin?.grants?.data?.smsInvites?.includes(GrantType.manage),
          [`communications-${GrantType.view}`]:
            admin?.grants?.data?.communications?.includes(GrantType.view),
          [`communications-${GrantType.manage}`]:
            admin?.grants?.data?.communications?.includes(GrantType.manage),
          [`datasheets-${GrantType.view}`]:
            admin?.grants?.data?.datasheets?.includes(GrantType.view),
          [`datasheets-${GrantType.manage}`]:
            admin?.grants?.data?.datasheets?.includes(GrantType.manage),
          [`registrationCodes-${GrantType.view}`]:
            admin?.grants?.data?.registrationCodes?.includes(GrantType.view),
          [`registrationCodes-${GrantType.manage}`]:
            admin?.grants?.data?.registrationCodes?.includes(GrantType.manage),
          [`results-${GrantType.view_report}`]:
            admin?.grants?.data?.results?.includes(GrantType.view_report),
          [`results-${GrantType.report_data}`]:
            admin?.grants?.data?.results?.includes(GrantType.report_data),
          [`results-${GrantType.raw_responses}`]:
            admin?.grants?.data?.results?.includes(GrantType.raw_responses),
          [`results-${GrantType.scores}`]:
            admin?.grants?.data?.results?.includes(GrantType.scores),
          [`results-${GrantType.reset_responses}`]:
            admin?.grants?.data?.results?.includes(GrantType.reset_responses),
          [`results-${GrantType.rescrore_responses}`]:
            admin?.grants?.data?.results?.includes(
              GrantType.rescrore_responses,
            ),
        }
        form.setFieldsValue(formFieldsValues)
      }
    }
  }, [admin?.id])

  const drawerTitle = isEditMode
    ? I18n.t('administration.administrators.drawers.view.title_campaign_edit')
    : I18n.t('administration.administrators.drawers.view.title_campaign_add')

  const actionButtonText = isEditMode
    ? I18n.t('administration.administrators.drawers.edit.update')
    : I18n.t('administration.administrators.drawers.edit.save')

  const onClose = () => {
    form.resetFields()
    handleClose()
  }

  const handleOnSearch = (email: string) => {
    form.resetFields()

    if (email.trim().length !== 0) {
      searchAdmin(parentResourceType, parentResourceId, email)
    }
  }

  const handleOnSubmit = async (values: FormDataType) => {
    const {
      firstName, lastName, email, ...valuesWithGrants
    } = values

    if (admin === null) {
      return
    }

    const selectedGrants = Object.entries(valuesWithGrants)
      .filter(([, value]) => value === true)
      .map(([key]) => key)

    // combining grants of same parent
    const grants: Partial<
      UpdateAdminRequest['resource']['grantsAttributes']['data']
    > = selectedGrants.reduce((prevValue, currentValue) => {
      const [grantItem, grantType] = currentValue.split('-')

      const prevGrantType = prevValue?.[grantItem] ?? []
      const newGrantType = [...prevGrantType, grantType]

      return { ...prevValue, [grantItem]: newGrantType }
    }, {})

    const grantsAttributesData: UpdateAdminRequest['resource']['grantsAttributes']['data'] = {
      clients: grants?.clients ?? [],
      projects: grants?.projects ?? [],
      campaigns: grants?.campaigns ?? [],
      communications: grants?.communications ?? [],
      results: grants?.results ?? [],
      assessors: grants?.assessors ?? [],
      registrationCodes: grants?.registrationCodes ?? [],
      smsInvites: grants?.smsInvites ?? [],
      datasheets: grants?.datasheets ?? [],
    }

    let userAttributes:
      | UpdateAdminRequest['resource']['userAttributes']
      | CreateAdminRequest['resource']['userAttributes']
    if (isEditMode) {
      userAttributes = {
        id: admin?.userId,
        email,
        firstName,
        lastName,
      }
    } else {
      userAttributes = {
        email: admin?.email ?? '',
        firstName,
        lastName,
      }
    }

    const updateData: UpdateAdminRequest | CreateAdminRequest = {
      resource: {
        userAttributes,
        grantsAttributes: {
          data: grantsAttributesData,
        },
      },
    }

    try {
      if (isEditMode) {
        await updateAdmin(
          parentResourceType,
          parentResourceId,
          admin?.id ?? 0,
          updateData as UpdateAdminRequest,
        )
        message.success(
          I18n.t('administration.administrators.drawers.edit.update_success', {
            name: `${firstName} ${lastName}`,
          }),
        )
      } else {
        await createAdmin(
          parentResourceType,
          parentResourceId,
          updateData as CreateAdminRequest,
        )
        message.success(
          I18n.t('administration.administrators.drawers.edit.create_success', {
            name: `${firstName} ${lastName}`,
          }),
        )
      }

      onClose()
    } catch (error) {
      console.error(error)

      if (isEditMode) {
        message.error(
          I18n.t('administration.administrators.drawers.edit.update_failed', {
            name: `${firstName} ${lastName}`,
          }),
        )
      } else {
        message.error(
          I18n.t('administration.administrators.drawers.edit.create_failed', {
            name: `${firstName} ${lastName}`,
          }),
        )
      }
    }
  }

  // Redirect to admin list if permission to edit isnt granted
  if (
    isEditMode
    && admin
    && admin.permissions
    && admin.permissions.edit === false
  ) {
    message.error(
      I18n.t('administration.administrators.drawers.edit.no_edit_permission', {
        name: `${admin.firstName} ${admin.lastName}`,
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
            {admin && (
              <Button
                htmlType="submit"
                form="add_edit_admin_form"
                type="primary"
                loading={isUpdating || isCreating}
                disabled={isFetching || isUpdating || isCreating}
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
      {isAddMode && admin === null && (
        <>
          <Typography.Text strong>
            {I18n.t('administration.administrators.list.columns.email')}
          </Typography.Text>
          <Input.Search
            className="mb-4"
            type="email"
            placeholder={I18n.t(
              'administration.administrators.drawers.edit.search_placeholder',
            )}
            enterButton={I18n.t(
              'administration.administrators.drawers.edit.next',
            )}
            allowClear={false}
            loading={isSearching}
            disabled={isSearching}
            onSearch={handleOnSearch}
          />
        </>
      )}
      <Skeleton loading={isFetching || isSearching} active title>
        {admin !== null && (
          <Form
            id="add_edit_admin_form"
            form={form}
            layout="vertical"
            autoComplete="off"
            scrollToFirstError
            preserve={false}
            onFinish={handleOnSubmit}
          >
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
            <Typography.Title level={5}>
              {I18n.t('administration.administrators.drawers.edit.permissions')}
            </Typography.Title>
            <Divider />
            <Row gutter={24}>
              <Col span={4}>
                <Typography.Text strong>
                  {I18n.t(
                    'administration.administrators.drawers.edit.permission_assessors',
                  )}
                </Typography.Text>
              </Col>
              <Col>
                <Form.Item
                  name={`assessors-${GrantType.view}`}
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox>
                    {I18n.t(
                      'administration.administrators.drawers.edit.can_view',
                    )}
                  </Checkbox>
                </Form.Item>
                <Form.Item
                  name={`assessors-${GrantType.manage}`}
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox>
                    {I18n.t(
                      'administration.administrators.drawers.edit.can_manage',
                    )}
                  </Checkbox>
                </Form.Item>
              </Col>
            </Row>
            <Divider />
            <Row gutter={24}>
              <Col span={4}>
                <Typography.Text strong>
                  {I18n.t(
                    'administration.administrators.drawers.edit.permission_campaigns',
                  )}
                </Typography.Text>
              </Col>
              <Col>
                <Form.Item
                  name={`campaigns-${GrantType.view}`}
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox>
                    {I18n.t(
                      'administration.administrators.drawers.edit.can_view',
                    )}
                  </Checkbox>
                </Form.Item>
                <Form.Item
                  name={`campaigns-${GrantType.manage}`}
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox>
                    {I18n.t(
                      'administration.administrators.drawers.edit.can_manage',
                    )}
                  </Checkbox>
                </Form.Item>
                <Form.Item
                  name={`campaigns-${GrantType.manage_users}`}
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox>
                    {I18n.t(
                      'administration.administrators.drawers.edit.can_manage_users',
                    )}
                  </Checkbox>
                </Form.Item>
                <Form.Item
                  name={`campaigns-${GrantType.manage_options}`}
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox>
                    {I18n.t(
                      'administration.administrators.drawers.edit.can_manage_options',
                    )}
                  </Checkbox>
                </Form.Item>
              </Col>
            </Row>
            <Divider />
            <Row gutter={24}>
              <Col span={4}>
                <Typography.Text strong>
                  {I18n.t(
                    'administration.administrators.drawers.edit.permission_sms_invites',
                  )}
                </Typography.Text>
              </Col>
              <Col>
                <Form.Item
                  name={`smsInvites-${GrantType.view}`}
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox>
                    {I18n.t(
                      'administration.administrators.drawers.edit.can_view',
                    )}
                  </Checkbox>
                </Form.Item>
                <Form.Item
                  name={`smsInvites-${GrantType.manage}`}
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox>
                    {I18n.t(
                      'administration.administrators.drawers.edit.can_manage',
                    )}
                  </Checkbox>
                </Form.Item>
              </Col>
            </Row>
            <Divider />
            <Row gutter={24}>
              <Col span={4}>
                <Typography.Text strong>
                  {I18n.t(
                    'administration.administrators.drawers.edit.permission_communication',
                  )}
                </Typography.Text>
              </Col>
              <Col>
                <Form.Item
                  name={`communications-${GrantType.view}`}
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox>
                    {I18n.t(
                      'administration.administrators.drawers.edit.can_view',
                    )}
                  </Checkbox>
                </Form.Item>
                <Form.Item
                  name={`communications-${GrantType.manage}`}
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox>
                    {I18n.t(
                      'administration.administrators.drawers.edit.can_manage',
                    )}
                  </Checkbox>
                </Form.Item>
              </Col>
            </Row>
            <Divider />
            <Row gutter={24}>
              <Col span={4}>
                <Typography.Text strong>
                  {I18n.t(
                    'administration.administrators.drawers.edit.permission_datasheet',
                  )}
                </Typography.Text>
              </Col>
              <Col>
                <Form.Item
                  name={`datasheets-${GrantType.view}`}
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox>
                    {I18n.t(
                      'administration.administrators.drawers.edit.can_view',
                    )}
                  </Checkbox>
                </Form.Item>
                <Form.Item
                  name={`datasheets-${GrantType.manage}`}
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox>
                    {I18n.t(
                      'administration.administrators.drawers.edit.can_manage',
                    )}
                  </Checkbox>
                </Form.Item>
              </Col>
            </Row>
            <Divider />
            <Row gutter={24}>
              <Col span={4}>
                <Typography.Text strong>
                  {I18n.t(
                    'administration.administrators.drawers.edit.permission_regcode',
                  )}
                </Typography.Text>
              </Col>
              <Col>
                <Form.Item
                  name={`registrationCodes-${GrantType.view}`}
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox>
                    {I18n.t(
                      'administration.administrators.drawers.edit.can_view',
                    )}
                  </Checkbox>
                </Form.Item>
                <Form.Item
                  name={`registrationCodes-${GrantType.manage}`}
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox>
                    {I18n.t(
                      'administration.administrators.drawers.edit.can_manage',
                    )}
                  </Checkbox>
                </Form.Item>
              </Col>
            </Row>
            <Divider />
            <Row className="mb-4" gutter={24}>
              <Col span={4}>
                <Typography.Text strong>
                  {I18n.t(
                    'administration.administrators.drawers.edit.permission_results',
                  )}
                </Typography.Text>
              </Col>
              <Col>
                <Form.Item
                  name={`results-${GrantType.view_report}`}
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox>
                    {I18n.t(
                      'administration.administrators.drawers.edit.can_view_report',
                    )}
                  </Checkbox>
                </Form.Item>
                <Form.Item
                  name={`results-${GrantType.download_report}`}
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox>
                    {I18n.t(
                      'administration.administrators.drawers.edit.can_download_report',
                    )}
                  </Checkbox>
                </Form.Item>
                <Form.Item
                  name={`results-${GrantType.report_data}`}
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox>
                    {I18n.t(
                      'administration.administrators.drawers.edit.can_view_report_data',
                    )}
                  </Checkbox>
                </Form.Item>
                <Form.Item
                  name={`results-${GrantType.raw_responses}`}
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox>
                    {I18n.t(
                      'administration.administrators.drawers.edit.can_view_raw_responses',
                    )}
                  </Checkbox>
                </Form.Item>
                <Form.Item
                  name={`results-${GrantType.scores}`}
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox>
                    {I18n.t(
                      'administration.administrators.drawers.edit.can_view_scores',
                    )}
                  </Checkbox>
                </Form.Item>
                <Form.Item
                  name={`results-${GrantType.reset_responses}`}
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox>
                    {I18n.t(
                      'administration.administrators.drawers.edit.can_reset_responses',
                    )}
                  </Checkbox>
                </Form.Item>
                <Form.Item
                  name={`results-${GrantType.rescrore_responses}`}
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox>
                    {I18n.t(
                      'administration.administrators.drawers.edit.can_rescore_responses',
                    )}
                  </Checkbox>
                </Form.Item>
              </Col>
            </Row>
            <Divider />
          </Form>
        )}
      </Skeleton>
    </Drawer>
  )
}

export const AddEditDrawer = connector(AddEditDrawerComponent)
