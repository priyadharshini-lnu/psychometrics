import {
  Button, Modal, TreeSelect, Row, Col,
} from 'antd'
import { connect } from 'react-redux'
import { useState } from 'react'
import { closeModal, getData } from '~/modules/admin/core/ui/modals'
import { RootState } from '~/modules/survey/core/rootReducers'
import {
  updateLinkedQuestions,
} from '~/modules/survey/core/builder/assessment/actions'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    ...getData(state.survey).linkedAssessment,
    assessment: state.survey.builder.assessment,
  }),
  {
    close: () => closeModal('linkedAssessment'),
    updateLinkedQuestions,
  },
)

const LinkedAssessmentModalComponent = ({
  assessment, close, id, updateLinkedQuestions,
}) => {
  const { linkedAssessment, linkedQuestions } = assessment
  const [value, setValue] = useState(linkedQuestions[id] || [])

  const save = () => {
    updateLinkedQuestions(id, value)
    close()
  }

  const onChange = (newValue) => {
    setValue(newValue)
  }

  const treeData = linkedAssessment.blocks.map(block => ({
    title: block.name,
    value: block.id,
    key: block.id,
    children: block.questions.map(question => ({
      title: question.name,
      value: question.id,
      key: question.id,
    })),
  }))

  return (
    <Modal
      width="50%"
      title={I18n.t('administration.assessments.linkedAssessment.title')}
      open
      mask={{ closable: true }}
      onCancel={close}
      footer={[
        <Button type="primary" key="save" onClick={save}>
          {I18n.t('administration.save')}
        </Button>,
        <Button key="close" onClick={close}>
          {I18n.t('administration.close')}
        </Button>,
      ]}
    >
      <Row gutter={[0, 16]}>
        <Col flex={1}>
          {I18n.t('administration.assessments.linkedAssessment.assessment_title', { name: assessment.name })}
        </Col>
      </Row>
      <Row gutter={[0, 16]}>
        <Col flex={1}>
          <TreeSelect
            value={value}
            style={{ width: '100%' }}
            treeData={treeData}
            onChange={onChange}
            treeCheckable
            placeholder="Please select"
            showCheckedStrategy={TreeSelect.SHOW_CHILD}
          />
        </Col>
      </Row>
    </Modal>
  )
}

export const LinkedAssessmentModal = connecter(LinkedAssessmentModalComponent)
