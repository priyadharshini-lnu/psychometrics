import {
  Button, Modal, Space, Switch, TimePicker, Row, Col, Alert, Popconfirm,
} from 'antd'
import _ from 'lodash'
import { connect } from 'react-redux'
import { setIn } from '~/utils/immutable'
import dayjs from '~/utils/dayjs'
import { closeModal, getData } from '~/modules/admin/core/ui/modals'
import { RootState } from '~/modules/survey/core/rootReducers'
import {
  toggleEnableBack, toggleEnableProgress, toggleSingleQuestionPage, saveAssessment, updateExtra,
  toggleInstructions,
} from '~/modules/survey/core/builder/assessment/actions'
import { updateBlocks } from '~/modules/survey/core/builder/assessment/block/actions'
import { TYPES as CAMPAIGN_TYPES } from '~/constants/campaign'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    ...getData(state.survey).settings,
    assessment: state.survey.builder.assessment,
    blocks: state.survey.builder.blocks,
  }),
  {
    close: () => closeModal('settings'),
    toggleEnableBack,
    toggleEnableProgress,
    toggleSingleQuestionPage,
    saveAssessment,
    updateExtra,
    toggleInstructions,
    updateBlocks,
  },
)

const SettingsModalComponent = ({
  assessment, close, toggleEnableBack, toggleEnableProgress, toggleSingleQuestionPage,
  updateExtra, toggleInstructions, blocks, updateBlocks,
}) => {
  const { extra } = assessment
  const isAssessmentTimerAdded = extra && Object.prototype.hasOwnProperty.call(extra, 'timer')
  const isThreeSixtyAsessment = assessment && assessment.category === CAMPAIGN_TYPES.THREESIXTY

  const hasRandomizedBlockWithMultiQuestionsPerPage = checkRandomizedBlockWithMultiQuestionsPerPage(blocks)

  const toggleTimer = () => {
    if (isAssessmentTimerAdded) {
      updateExtra(_.omit(extra, 'timer'))
    } else {
      updateExtra({ ...extra, timer: null })
    }
  }

  const updateTimer = (time) => {
    const timer = time && dayjs.duration({
      hours: time.hour(),
      minutes: time.minute(),
      seconds: time.second(),
    }).asSeconds()
    updateExtra({ ...extra, timer })
  }

  const handleToggleSingleQuestionPage = () => {
    if (hasRandomizedBlockWithMultiQuestionsPerPage) {
      const updatedBlocks = _.map(blocks, (block) => {
        if (block.props.randomization.type === 'ByFactors' && block.props.randomization.perPage > 1) {
          return setIn(block, ['props', 'randomization', 'perPage'], 1)
        }
        return block
      })
      updateBlocks(_.keyBy(updatedBlocks, 'id'))
    }
    toggleSingleQuestionPage()
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
        {hasRandomizedBlockWithMultiQuestionsPerPage && !assessment.options.enable_single_question_page
          && <Alert message={I18n.t('administration.assessments.settings.has_randomized_block_warning')} banner />}
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
            <EnableSingleQuestionWrapper
              hasRandomizedBlockWithMultiQuestionsPerPage={handleToggleSingleQuestionPage}
              handleToggleSingleQuestionPage={handleToggleSingleQuestionPage}
              renderSwitch={props => (
                <Space>
                  <Switch
                    checked={assessment.options.enable_single_question_page}
                    onChange={props?.handleToggleSingleQuestionPage}
                  />
                </Space>
              )}
              enableSingleQuestionPage={assessment.options.enable_single_question_page}
            />
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

const EnableSingleQuestionWrapper = ({
  hasRandomizedBlockWithMultiQuestionsPerPage, enableSingleQuestionPage,
  handleToggleSingleQuestionPage, renderSwitch,
}) => {
  if (hasRandomizedBlockWithMultiQuestionsPerPage && !enableSingleQuestionPage) {
    return (
      <Popconfirm
        title={I18n.t('common.text.confirm')}
        description={I18n.t('administration.assessments.settings.enable_single_question_page_confirm')}
        onConfirm={() => handleToggleSingleQuestionPage(true)}
      >
        {renderSwitch()}
      </Popconfirm>
    )
  }
  return <>{renderSwitch({ handleToggleSingleQuestionPage })}</>
}

const checkRandomizedBlockWithMultiQuestionsPerPage = (blocks) => {
  const block = _.find(
    blocks, block => block.props.randomization.type === 'ByFactors' && block.props.randomization.perPage > 1,
  )
  return !!block
}

export const SettingsModal = connecter(SettingsModalComponent)
