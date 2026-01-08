import React, { useState } from 'react'
import {
  Button, Modal, message, Alert, Form, Input,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import Event from 'interfaces/Event'
import _ from 'lodash'
import { LoadingOutlined, CheckOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  assignReportsAndAssessments, ASSIGN_REPORTS_AND_ASSESSMENTS,
} from '~/modules/admin/modules/campaigns/core/users'
import { isRequestInProgress } from '~/core/request'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    loading: isRequestInProgress(state, ASSIGN_REPORTS_AND_ASSESSMENTS),
  }),
  {
    assignReportsAndAssessments,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>
interface OwnProps {
  campaignId: number
  close(): void
}

const ImportReportsAndAssessmentsModal: React.FC<PropsFromRedux & OwnProps> = ({
  campaignId,
  close,
  assignReportsAndAssessments,
  loading,
}) => {
  const [form] = Form.useForm()
  const [file, setFile] = useState<File | null>(null)
  const [, setFields] = useState({})

  const [errors, setErrors] = useState([])

  const handleUpdate = (params) => {
    const data = new FormData()
    if (!file) return

    _.map(params, (value, key) => {
      data.append(key, value)
    })
    data.append('import_data', file)
    assignReportsAndAssessments(campaignId, data)
      .then(() => {
        message.info(I18n.t('user.modals.import.success_msg'))
        close()
      })
      .catch(setErrors)
  }

  return (
    <Modal
      width={700}
      title={I18n.t('user.modals.import_reports.title')}
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
          }}
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('frontend.update')}
        </Button>,
      ]}
    >
      <p>{I18n.t('user.modals.import_reports.body')}</p>
      <p><a target="_blank" href="/example_csv/import_reports_sample.csv">Sample File</a></p>
      {errors?.length ? (
        <Alert
          message={false}
          description={errors.map((e, i) => <div key={i}>{e}</div>)}
          type="error"
          className="mbm"
        />
      ) : null}
      <Form
        name="basic"
        form={form}
        onFinish={handleUpdate}
        initialValues={{}}
        onFieldsChange={(a, allFields) => {
          setFields(allFields)
        }}
      >
        <Form.Item name="importData">
          <Input
            type="file"
            accept=".csv"
            onChange={({ target: { files } }: Event<HTMLInputElement>) => setFile(files && files[0])}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}


export default connecter(ImportReportsAndAssessmentsModal)
