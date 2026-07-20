import { useState, useMemo } from 'react'
import {
  Button, Modal, Space, Switch, Row, Col, Alert, Popconfirm, Tooltip,
  Select,
} from 'antd'
import _ from 'lodash'
import { connect } from 'react-redux'
import { QuestionCircleOutlined, FieldTimeOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { setIn } from '~/utils/immutable'
import InputDuration from '~/components/InputDuration'
import { closeModal, getData } from '~/modules/admin/core/ui/modals'
import { RootState } from '~/modules/survey/core/rootReducers'
import {
  toggleEnableBack, toggleEnableProgress, toggleSingleQuestionPage, saveAssessment, updateExtra,
  toggleInstructions, toggleEnableSave,
} from '~/modules/survey/core/builder/assessment/actions'
import { updateBlocks } from '~/modules/survey/core/builder/assessment/block/actions'
import { TYPES as CAMPAIGN_TYPES } from '~/constants/campaign'

const { I18n } = window

const connecter = connect(
  (state: RootState) => ({
    ...getData(state.survey).settings,
    assessment: state.survey.builder.assessment,
    blocks: state.survey.builder.blocks,
    factorsData: state.survey.builder.factors,
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
    toggleEnableSave,
  },
)

const SettingsModalComponent = ({
  assessment, close, toggleEnableBack, toggleEnableProgress, toggleSingleQuestionPage,
  updateExtra, toggleInstructions, blocks, updateBlocks, toggleEnableSave, factorsData,
}) => {
  const { extra } = assessment
  const isAssessmentTimerAdded = extra && Object.prototype.hasOwnProperty.call(extra, 'timer')
  const isThreeSixtyAssessment = assessment && assessment.category === CAMPAIGN_TYPES.THREESIXTY
  const [enableSelectMainFactor, setEnableSelectMainFactor] = useState(extra && extra.main_factor_id)

  const hasRandomizedBlockWithMultiQuestionsPerPage = useMemo(
    () => checkRandomizedBlockWithMultiQuestionsPerPage(blocks), [blocks],
  )

  const toggleTimer = () => {
    if (isAssessmentTimerAdded) {
      updateExtra(_.omit(extra, 'timer'))
    } else {
      updateExtra({ ...extra, timer: null })
    }
  }

  const updateTimer = (timer) => {
    updateExtra({ ...extra, timer })
  }

  const updateExtraOptions = (name, value) => {
    updateExtra({ ...extra, [name]: value })
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

  const handleToggleSelectMainFactor = (value) => {
    setEnableSelectMainFactor(value)
    if (!value) {
      updateExtraOptions('main_factor_id', null)
    }
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
            <Switch checked={assessment?.options?.enable_save} onChange={toggleEnableSave} />
            {I18n.t('administration.assessments.settings.enable_save')}
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

        {!isThreeSixtyAssessment && (
          <Col span={24}>
            <Space>
              <Switch checked={assessment.instructions.enabled} onChange={toggleInstructions} />
              {I18n.t('administration.assessments.settings.instructions')}
            </Space>
          </Col>
        )}
        <AssessmentTimerSettings
          time={extra.timer}
          toggleTimer={toggleTimer}
          isAssessmentTimerAdded={isAssessmentTimerAdded}
          updateTimer={updateTimer}
          isAgile={false}
        />
        <Col span={24}>
          <Space>
            <Switch
              checked={extra.disable_navigation_back}
              onChange={() => updateExtraOptions('disable_navigation_back', !extra.disable_navigation_back)}
            />
            {I18n.t('administration.assessments.settings.disable_nav_btn')}
          </Space>
        </Col>
        <Col span={24}>
          <Space>
            <Switch
              checked={extra.disable_continue_to_dashboard}
              onChange={() => updateExtraOptions(
                'disable_continue_to_dashboard', !extra.disable_continue_to_dashboard,
              )}
            />
            {I18n.t('administration.assessments.settings.disable_continue_to_dashboard')}
          </Space>
        </Col>
        <Col span={24}>
          <Space>
            <Switch
              defaultChecked={enableSelectMainFactor}
              onChange={handleToggleSelectMainFactor}
            />
            {I18n.t('administration.assessments.settings.enable_select_main_factor')}
          </Space>
        </Col>
        {enableSelectMainFactor && (
          <Col offset={2} span={24}>
            <Select
              value={extra.main_factor_id}
              options={_.map(factorsData.factors, factor => ({ label: factor.name, value: factor.id }))}
              style={{ width: '40%' }}
              onChange={value => updateExtraOptions('main_factor_id', value)}
            />
          </Col>
        )}
        <Col span={24}>
          <Space>
            <Switch
              value={extra.enable_copy_content}
              onChange={value => updateExtraOptions('enable_copy_content', value)}
            />
            {I18n.t('administration.assessments.settings.enable_copy_content')}
          </Space>
        </Col>
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

export const AssessmentTimerSettings = ({
  time, toggleTimer, isAssessmentTimerAdded, updateTimer, isAgile,
}) => (
  <>
    <Col span={24}>
      <Space>
        <Switch checked={isAssessmentTimerAdded} onChange={toggleTimer} />
        {I18n.t('administration.assessments.settings.enable_timer')}
      </Space>
    </Col>

    {isAssessmentTimerAdded && (
      <>
        {isAgile && (
          <Col offset={2}>
            <Alert
              title={I18n.t('admin.agile_time_config_msg')}
              type="warning"
            />
          </Col>
        )}
        <Col offset={2} span={4}>
          <InputDuration
            placeholder="1h 30m"
            value={time}
            onChange={updateTimer}
            prefix={<FieldTimeOutlined />}
          />
        </Col>
        <Col span={2}>
          <Tooltip title={I18n.t('administration.components.input_duration.placeholder')}>
            <span><QuestionCircleOutlined className="ms-4" /></span>
          </Tooltip>
        </Col>
      </>
    )}
  </>
)

const checkRandomizedBlockWithMultiQuestionsPerPage = (blocks) => {
  const block = _.find(
    blocks, block => block.props.randomization.type === 'ByFactors' && block.props.randomization.perPage > 1,
  )
  return !!block
}

export const SettingsModal = connecter(SettingsModalComponent)
