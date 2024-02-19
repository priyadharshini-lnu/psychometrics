import { useState } from 'react'
import {
  Alert, Button, Form, Input, Modal, message,
} from 'antd'
import { LoadingOutlined, CheckOutlined, CloudDownloadOutlined } from '@ant-design/icons'
import Event from 'interfaces/Event'
import { ConnectedProps, connect } from 'react-redux'
import {
  importQuestions,
} from '~/modules/survey/core/builder/assessment/actions'
import { closeModal, getData } from '~/modules/admin/core/ui/modals'
import { RootState } from '../../core/rootReducers'
import styles from './ImportQuestionsModal.less'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    assessmentId: getData(state.survey).importQuestionsModal.assessmentId,
  }),
  {
    importQuestions,
    closeModal,
  },
)
export default connecter
type PropsFromRedux = ConnectedProps<typeof connecter>
type OwnProps = {
  assessmentId: number
}
type Props = PropsFromRedux & OwnProps

export const ImportQuestionsModalComponent: React.FC<Props> = ({ assessmentId, closeModal, importQuestions }) => {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState([])

  const handleUpload = () => {
    if (!file) return

    const data = new FormData()
    data.append('file', file)
    setLoading(true)
    importQuestions(assessmentId, data).then(() => {
      message.success(I18n.t('administration.assessment_question_import.successfully_scheduled'))
      close()
    }).catch(setErrors).finally(() => {
      setLoading(false)
    })
  }

  const close = () => {
    closeModal('importQuestionsModal')
  }

  return (
    <Modal
      width={700}
      title={I18n.t('administration.assessment_question_import.modal.title')}
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
          disabled={!file}
          onClick={handleUpload}
        >
          {loading ? <LoadingOutlined /> : <CheckOutlined />}
          {I18n.t('common.actions.upload')}
        </Button>,
      ]}
    >
      <>
        {errors && errors.length > 0
            && (
            <div className={styles.errorContainer}>
              <Alert message={<ul className="mb-0">{errors.map(error => <li>{error}</li>)}</ul>} type="error" />
            </div>
            )}
        <div className="mbl" style={{ fontSize: '16px' }}>
          <a
            href={`/administration/assessments/${assessmentId}/import_questions_sample_file`}
            target="blank"
          >
            <CloudDownloadOutlined />
            <span className="mls">{I18n.t('administration.sms_invites.import.download_example_csv')}</span>
          </a>
        </div>
        <Form name="basic">
          <Form.Item name="file">
            <Input
              type="file"
              accept=".xlsx"
              onChange={({ target: { files } }: Event<HTMLInputElement>) => setFile(files && files[0])}
            />
          </Form.Item>
        </Form>
      </>
    </Modal>
  )
}

export const ImportQuestionsModal = connecter(ImportQuestionsModalComponent)
