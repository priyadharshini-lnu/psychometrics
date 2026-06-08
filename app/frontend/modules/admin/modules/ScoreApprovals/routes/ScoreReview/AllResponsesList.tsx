import { useEffect, useState } from 'react'
import {
  Modal, Flex, Typography, Spin,
} from 'antd'
import get from 'lodash/get'
import { useStore } from 'react-redux'
import dayjs from '~/utils/dayjs'
import AssessmentContainer from '~/modules/survey/containers/AssessmentContainer'
import styles from './ScoreReview.less'

const { I18n } = window

export type SubjectAssessment = {
  result: {
    user: {
      first_name: string
      last_name: string
    }
    completed_at?: string
    id: string
  }
  assessment: Record<string, unknown>
}

type AllResponsesListProps = {
  scoreApprovalId: string
  open: boolean
  onClose: () => void
  fetchAssessment: (id: string) => Promise<SubjectAssessment>
}

const AllResponsesList: React.FC<AllResponsesListProps> = ({
  scoreApprovalId,
  fetchAssessment,
  open,
  onClose,
}) => {
  const [subjectForm, setSubjectForm] = useState<SubjectAssessment | null>(null)
  const [loading, setLoading] = useState(false)
  const store = useStore()

  useEffect(() => {
    if (open && scoreApprovalId && !subjectForm) {
      setLoading(true)
      fetchAssessment(scoreApprovalId).then((data) => {
        setSubjectForm(data)
        setLoading(false)
      }).catch(() => {
        setLoading(false)
      })
    }
  }, [open, scoreApprovalId, subjectForm, fetchAssessment])

  const loaded = !!subjectForm

  const modalTitle = loaded ? (
    <Flex vertical gap={4}>
      <Typography.Text strong style={{ fontSize: 16 }}>
        {String(get(subjectForm, ['assessment', 'name'], ''))}
      </Typography.Text>
      <Flex gap={16}>
        <Typography.Text type="secondary">
          <strong>
            {`${subjectForm.result.user.first_name} ${subjectForm.result.user.last_name}`}
          </strong>
        </Typography.Text>
        {get(subjectForm.result, 'completed_at') && (
          <Typography.Text type="secondary">
            {I18n.t('admin.assessor_completed_at')}
            {': '}
            <strong>{dayjs(subjectForm.result.completed_at).format('DD MMM YYYY')}</strong>
          </Typography.Text>
        )}
      </Flex>
    </Flex>
  ) : I18n.t('shared.loading')

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1400}
      centered
      title={modalTitle}
      classNames={{
        container: styles.modalContainer,
        body: styles.modalBody,
      }}
    >
      {loading ? (
        <Flex justify="center" align="center" style={{ minHeight: 400 }}>
          <Spin size="large" />
        </Flex>
      ) : (
        loaded && (
          <AssessmentContainer
            id="pass_assessment"
            initialized={false}
            type="view_results"
            data={subjectForm.assessment}
            result={subjectForm.result}
            resultsUrl={`/user_assessments/${1}/users_results/${subjectForm.result.id}`}
            rstore={store}
            showAsSinglePage
            preventOverflow
          />
        )
      )}
    </Modal>
  )
}

export default AllResponsesList
