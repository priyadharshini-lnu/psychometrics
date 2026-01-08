/* eslint-disable react/no-danger */
import React, { useState } from 'react'
import {
  Button, Modal, message, Alert, Form, Input, Typography,
} from 'antd'
import { Store } from 'antd/lib/form/interface'
import Event from 'interfaces/Event'
import each from 'lodash/each'
import { connect, ConnectedProps } from 'react-redux'
import { LoadingOutlined, CheckOutlined, InfoCircleOutlined } from '~/glint/icons/AccessibleIconsAntDesign'

import { RootState } from '~/modules/admin/core/rootReducers'

import { importSheet, IMPORT, SheetType } from '~/modules/admin/modules/SheetManagement/core/list'
import { isRequestInProgress } from '~/core/request'
import { ParentResourceType } from '../../interfaces'
import styles from './styles.less'

const connecter = connect(
  (state: RootState) => ({
    loading: isRequestInProgress(state, IMPORT),
  }),
  {
    importSheet,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>


const { I18n } = window

interface OwnProps {
  parentType: ParentResourceType
  parentId: number
  close(): void
  sheetType: SheetType
}
type Props = OwnProps & PropsFromRedux

const ImportSheetModalComponent: React.FC<Props> = ({
  parentType,
  parentId,
  close,
  importSheet,
  loading,
  sheetType,
}) => {
  const [form] = Form.useForm()
  const [file, setFile] = useState<File | null>(null)
  const [, setFields] = useState({})

  const [errors, setErrors] = useState([])

  const handleUpdate = (params: Store) => {
    const data = new FormData()
    if (!file) return

    each(params, (value, key) => {
      data.append(key, value)
    })
    data.append('file', file)
    importSheet(parentType, parentId, sheetType, data)
      .then(() => {
        message.info(I18n.t('sheet.import_modal.success_message'))
        close()
      })
      .catch(setErrors)
  }

  return (
    <Modal
      width={700}
      title={I18n.t('sheet.import_modal.title')}
      open
      onCancel={close}
      footer={[
        <Button
          key="back"
          onClick={close}
        >
          {I18n.t('common.actions.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={!form.getFieldValue('importData')}
          onClick={() => {
            form.submit()
          }
          }
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('frontend.update')}
        </Button>,
      ]}
    >
      {errors.length ? (
        <Alert
          message={false}
          description={errors.map((e, i) => <div dangerouslySetInnerHTML={{ __html: e }} key={i} />)}
          type="error"
          className="mbm"
        />
      ) : null}
      <Form
        name="basic"
        form={form}
        onFinish={handleUpdate}
        onFieldsChange={(a, allFields) => {
          setFields(allFields)
        }}
      >
        <Form.Item name="importData">
          <Input
            type="file"
            accept=".xlsx"
            onChange={({ target: { files } }: Event<HTMLInputElement>) => setFile(files && files[0])}
          />
        </Form.Item>
        {sheetType === 'Accesssheet'
          && (
            <>
              <Typography.Text type="danger">
                <InfoCircleOutlined className={styles.infoIcon} />
                {I18n.t('sheet.import_modal.alert_access_sheet_removal')}
              </Typography.Text>
            </>
          )}
      </Form>
    </Modal>
  )
}


export const ImportSheetModal = connecter(ImportSheetModalComponent)
