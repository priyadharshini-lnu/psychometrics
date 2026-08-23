import { FC, useEffect, useState } from 'react'
import {
  Button,
  Col,
  Drawer,
  Row,
  Skeleton,
  Space,
  Typography,
  Form,
  App,
  Alert,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'

import { RootState } from '~/modules/admin/core/rootReducers'
import {
  ToggleDrawer,
  DrawerModes,
  ParentResourceType,
} from '~/modules/admin/modules/SheetManagement/interfaces'
import {
  add,
  update,
  ADD,
  UPDATE,
  SheetType,
} from '~/modules/admin/modules/SheetManagement/core/list'
import { get as getColumns } from '~/modules/admin/modules/SheetManagement/core/columnDefinitions'
import {
  getCurrent,
  fetchSingle,
  FETCH_SINGLE,
} from '~/modules/admin/modules/SheetManagement/core/current'
import { isRequestInProgress } from '~/core/request'

import { COLUMN_ID_EMAIL } from '~/modules/admin/modules/SheetManagement/constants'

import { InputField, EmailField } from './FormFields'

const { I18n } = window

interface OwnProps {
  isOpen: boolean
  toggleDrawer: ToggleDrawer
  mode: DrawerModes
  currentSheetRowId: string
  parentResourceType: ParentResourceType
  parentResourceId: number
  sheetType: SheetType
}

const connector = connect(
  (state: RootState, { parentResourceType, parentResourceId, sheetType }: OwnProps) => ({
    columnDefinitions: getColumns(state, {
      parentType: parentResourceType, parentId: parentResourceId, sheetType,
    }),
    sheetDetails: getCurrent(state),
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

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = OwnProps & PropsFromRedux

const AddEditDrawerComponent: FC<Props> = ({
  isOpen,
  toggleDrawer,
  mode,
  currentSheetRowId,
  sheetDetails,
  columnDefinitions,
  parentResourceType,
  parentResourceId,
  isFetching,
  isAdding,
  isUpdating,
  fetchSingle,
  add,
  update,
  sheetType,
}) => {
  const [errors, setErrors] = useState<string[] | undefined>()
  const { message } = App.useApp()

  const isInEditMode = mode === DrawerModes.Edit
  const isInAddMode = mode === DrawerModes.Add

  if (!currentSheetRowId && isInEditMode) {
    return null
  }

  const [form] = Form.useForm()

  useEffect(() => {
    if (isInEditMode) {
      fetchSingle(parentResourceType, parentResourceId, sheetType, currentSheetRowId)
    }
  }, [currentSheetRowId])

  useEffect(() => {
    if (isInEditMode || isInAddMode) {
      form.resetFields()
    }
  }, [currentSheetRowId, mode])

  const handleFormSubmit = async (
    values: Record<string, string | number>,
  ): Promise<void> => {
    if (isInEditMode) {
      await update(currentSheetRowId, parentResourceType, parentResourceId, sheetType, values).then(() => {
        message.success(I18n.t('admin.sheets_drawers_add_edit_success_message_edit'))
        closeDrawer()
      }).catch(setErrors)
    } else {
      add(parentResourceType, parentResourceId, sheetType, values).then(() => {
        message.success(I18n.t('admin.sheets_drawers_add_edit_success_message_add'))
        closeDrawer()
      }).catch(setErrors)
    }
  }

  const closeDrawer = (): void => {
    form.resetFields()
    toggleDrawer(DrawerModes.None)
  }

  let sheetRowFormValues: Record<string, string | number | null> = {}
  let email = ''
  if (isInEditMode) {
    sheetRowFormValues = sheetDetails.find(detail => detail.type === parentResourceType)
      ?.record ?? {}
    email = `${sheetRowFormValues?.[COLUMN_ID_EMAIL] ?? ''}`
  }

  const recordTypeTitle = parentResourceType === ParentResourceType.Project
    ? I18n.t('admin.sheets_drawers_view_project_title')
    : I18n.t('admin.sheets_drawers_view_campaign_title')
  const buttonText = isAdding || isUpdating
    ? I18n.t('admin.sheets_drawers_add_edit_saving')
    : I18n.t('admin.sheets_drawers_add_edit_save')
  const drawerTitle = isInAddMode
    ? I18n.t('admin.sheets_drawers_add_edit_title_add')
    : I18n.t('admin.sheets_drawers_add_edit_title_edit')

  return (
    <Drawer
      title={drawerTitle}
      placement="right"
      closable={false}
      open={isOpen}
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
              {I18n.t('admin.sheets_drawers_add_edit_cancelText')}
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
        {errors && <Alert type="error" description={Object.values(errors).join(',')} rootClassName="mb-2" />}
        <Form
          name="add_edit_record_form"
          form={form}
          layout="vertical"
          scrollToFirstError
          onFinish={handleFormSubmit}
          initialValues={sheetRowFormValues}
        >
          <EmailField isInAddMode={isInAddMode} email={email} />
          {columnDefinitions
            .filter(column => column.name !== COLUMN_ID_EMAIL)
            .map(field => (
              <Form.Item
                label={(field.name || '')}
                name={field.name || ''}
                key={field.name}
              >
                <InputField type={field.columnType} />
              </Form.Item>
            ))}
        </Form>
      </Skeleton>
    </Drawer>
  )
}

export const AddEditDrawer = connector(AddEditDrawerComponent)
