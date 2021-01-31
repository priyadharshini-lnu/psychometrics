import React, { FC, useEffect } from 'react'
import {
  Button,
  Col,
  Drawer,
  Row,
  Skeleton,
  Space,
  Typography,
  Form,
  message,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'

import { RootState } from 'modules/admin/core/rootReducers'
import {
  ToggleDrawer,
  DrawerModes,
  ParentResourceType,
} from 'modules/admin/modules/DatasheetManagement/interfaces'
import {
  add,
  update,
  ADD,
  UPDATE,
} from 'modules/admin/modules/DatasheetManagement/core/list'
import { get as getColumnDefinitions } from 'modules/admin/modules/DatasheetManagement/core/columnDefinitions'
import {
  getCurrent,
  fetchSingle,
  FETCH_SINGLE,
} from 'modules/admin/modules/DatasheetManagement/core/current'
import { isRequestInProgress } from 'modules/admin/core/request'

import { COLUMN_ID_EMAIL } from 'modules/admin/modules/DatasheetManagement/constants'

import { toReadableString } from 'modules/admin/modules/DatasheetManagement/utils'
import { InputField, EmailField } from './FormFields'

const { I18n } = window

const connector = connect(
  (state: RootState) => ({
    columnDefinitions: getColumnDefinitions(state),
    datasheetDetails: getCurrent(state),
    isFetching: isRequestInProgress(state, FETCH_SINGLE),
    isAdding: isRequestInProgress(state, ADD),
    isUpdating: isRequestInProgress(state, UPDATE),
  }),
  {
    fetchSingle,
    add,
    update,
  },
)

interface OwnProps {
  isOpen: boolean
  toggleDrawer: ToggleDrawer
  mode: DrawerModes
  currentDatasheetId: string
  parentResourceType: ParentResourceType
  parentResourceId: number
}

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = OwnProps & PropsFromRedux

const AddEditDrawerComponent: FC<Props> = ({
  isOpen,
  toggleDrawer,
  mode,
  currentDatasheetId,
  datasheetDetails,
  columnDefinitions,
  parentResourceType,
  parentResourceId,
  isFetching,
  isAdding,
  isUpdating,
  fetchSingle,
  add,
  update,
}) => {
  const isInEditMode = mode === DrawerModes.Edit
  const isInAddMode = mode === DrawerModes.Add

  if (!currentDatasheetId && isInEditMode) {
    return null
  }

  const [form] = Form.useForm()

  // Effect running only if we dont have record data before hand
  useEffect(() => {
    if (isInEditMode) {
      fetchSingle(parentResourceType, parentResourceId, currentDatasheetId)
    }
  }, [currentDatasheetId])

  useEffect(() => {
    // Clear out any form values in between drawer write modes
    if (isInEditMode || isInAddMode) {
      form.resetFields()
    }
  }, [currentDatasheetId, mode])

  const handleFormSubmit = async (
    values: Record<string, string | number>,
  ): Promise<void> => {
    if (isInEditMode) {
      await update(currentDatasheetId, parentResourceType, parentResourceId, values)
      message.success(
        I18n.t(
          'administration.datasheets.drawers.add_edit.success_message_edit',
        ),
      )
    } else {
      await add(parentResourceType, parentResourceId, values)
      message.success(
        I18n.t('administration.datasheets.drawers.add_edit.success_message_add'),
      )
    }
    closeDrawer()
  }

  const closeDrawer = (): void => {
    form.resetFields()
    toggleDrawer(DrawerModes.None)
  }

  let datasheetFormValues: Record<string, string | number | null> = {}
  let email = ''
  if (isInEditMode) {
    datasheetFormValues = datasheetDetails.find(detail => detail.type === parentResourceType)
    ?.record ?? {}
    email = `${datasheetFormValues?.[COLUMN_ID_EMAIL] ?? ''}`
  }

  const recordTypeTitle = parentResourceType === ParentResourceType.Project
    ? I18n.t('administration.datasheets.drawers.view.project_title')
    : I18n.t('administration.datasheets.drawers.view.campaign_title')
  const buttonText = isAdding || isUpdating
    ? I18n.t('administration.datasheets.drawers.add_edit.saving')
    : I18n.t('administration.datasheets.drawers.add_edit.save')
  const drawerTitle = isInAddMode
    ? I18n.t('administration.datasheets.drawers.add_edit.title_add')
    : I18n.t('administration.datasheets.drawers.add_edit.title_edit')

  return (
    <Drawer
      title={drawerTitle}
      placement="right"
      closable={false}
      visible={isOpen}
      width="80%"
      zIndex={1001}
      maskClosable={false}
    >
      <Row justify="space-between" align="middle" className="mb-2">
        <Col>
          <Typography.Title level={4}>{recordTypeTitle}</Typography.Title>
        </Col>
        <Col>
          <Space>
            <Button htmlType="reset" onClick={closeDrawer}>
              {I18n.t('administration.datasheets.drawers.add_edit.cancelText')}
            </Button>
            <Button
              htmlType="submit"
              form="add_edit_record_form"
              type="primary"
              disabled={isFetching || isAdding || isUpdating}
              loading={isAdding || isUpdating}
            >
              {buttonText}
            </Button>
          </Space>
        </Col>
      </Row>
      <Skeleton loading={isFetching} active title>
        <Form
          name="add_edit_record_form"
          form={form}
          layout="vertical"
          scrollToFirstError
          onFinish={handleFormSubmit}
          initialValues={datasheetFormValues}
        >
          <EmailField isInAddMode={isInAddMode} email={email} />
          {columnDefinitions
            .filter(column => column.id !== COLUMN_ID_EMAIL)
            .map(field => (
              <Form.Item
                label={toReadableString(field.id)}
                name={field.id}
                key={field.id}
              >
                <InputField type={field.type} />
              </Form.Item>
            ))}
        </Form>
      </Skeleton>
    </Drawer>
  )
}

export const AddEditDrawer = connector(AddEditDrawerComponent)
