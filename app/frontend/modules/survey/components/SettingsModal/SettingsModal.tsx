import {
  Button, Modal, Space, Switch, TimePicker, Row, Col,
} from 'antd'
import _ from 'lodash'
import { connect } from 'react-redux'
import dayjs from '~/utils/dayjs'
import { closeModal, getData } from '~/modules/admin/core/ui/modals'
import { RootState } from '~/modules/survey/core/rootReducers'
import {
  toggleEnableBack, toggleEnableProgress, toggleSingleQuestionPage, saveAssessment, updateExtra,
  toggleInstructions,
} from '~/modules/survey/core/builder/assessment/actions'
import { TYPES as CAMPAIGN_TYPES } from '~/constants/campaign'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    ...getData(state.survey).settings,
    assessment: state.survey.builder.assessment,
  }),
  {
    close: () => closeModal('settings'),
    toggleEnableBack,
    toggleEnableProgress,
    toggleSingleQuestionPage,
    saveAssessment,
    updateExtra,
    toggleInstructions,
  },
)

const SettingsModalComponent = ({
  assessment, close, toggleEnableBack, toggleEnableProgress, toggleSingleQuestionPage,
  updateExtra, toggleInstructions,
}) => {
  const { extra } = assessment
  const isAssessmentTimerAdded = extra && Object.prototype.hasOwnProperty.call(extra, 'timer')
  const isThreeSixtyAsessment = assessment && assessment.category === CAMPAIGN_TYPES.THREESIXTY

  const toggleTimer = () => {
    if (isAssessmentTimerAdded) {
      updateExtra(_.omit(extra, 'timer'))
    } else {
      updateExtra({ ...extra, timer: null })
    }
  }

  const updateTimer = (time) => {
    const timer = time && dayjs.duration(time.format('HH:mm:ss')).asSeconds()
    updateExtra({ ...extra, timer })
  }

  return (
    <Modal
      width="50%"
      title={I18n.t('administration.assessments.settings.title')}
      open
      maskClosable
      onCancel={close}
      footer={[
        <Button key="close" onClick={close}>
          {I18n.t('administration.close')}
        </Button>,
      ]}
    >
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <Space>
            <Switch checked={assessment.enable_back} onChange={toggleEnableBack} />
            {I18n.t('administration.assessments.settings.enable_back')}
          </Space>
        </Col>

        <Col span={24}>
          <Space>
            <Switch checked={assessment.enable_progress} onChange={toggleEnableProgress} />
            {I18n.t('administration.assessments.settings.enable_progress')}
          </Space>
        </Col>
        <Col span={24}>
          <Space>
            <Switch checked={assessment.options.enable_single_question_page} onChange={toggleSingleQuestionPage} />
            {I18n.t('administration.assessments.settings.enable_single_question_page')}
          </Space>
        </Col>

        {!isThreeSixtyAsessment && (
        <Col span={24}>
          <Space>
            <Switch checked={assessment.instructions.enabled} onChange={toggleInstructions} />
            {I18n.t('administration.assessments.settings.instructions')}
          </Space>
        </Col>
        )}
        <Col span={24}>
          <Space>
            <Switch checked={isAssessmentTimerAdded} onChange={toggleTimer} />
            {I18n.t('administration.assessments.settings.enable_timer')}
          </Space>
        </Col>

        {isAssessmentTimerAdded && (
        <Col span={24}>
          {I18n.t('administration.assessments.settings.timer')}
          :
          <TimePicker
            defaultValue={dayjs.utc(0)}
            value={(extra.timer || extra.timer === 0) ? dayjs.utc(extra.timer * 1000) : null}
            onChange={updateTimer}
            placeholder="Set timer"
            className="mhs"
            popupClassName="assessment-timer"
          />
        </Col>
        )}
      </Row>
    </Modal>
  )
}

export const SettingsModal = connecter(SettingsModalComponent)
