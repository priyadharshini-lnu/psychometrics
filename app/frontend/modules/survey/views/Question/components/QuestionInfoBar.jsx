import _ from 'lodash'
import { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Dropdown, Button, Space, Popconfirm,
} from 'antd'
import {
  EyeOutlined, SaveOutlined, PartitionOutlined, SettingOutlined, CheckCircleOutlined,
  EyeInvisibleOutlined, DeleteOutlined, SwapOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import LogicElement from '~/modules/survey/models/logic/LogicElement'
import styles from './Question.less'

const { I18n } = window

class Question extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  remove () {
    const { remove } = this.props
    remove()
  }

  addSkipLogic = () => {
    const { addSkipLogic, model } = this.props
    addSkipLogic(model)
  }

  invokeAdvanced = (element) => {
    const { model } = this.props
    _.invoke(model, element.callback)
  }

  randomization = () => {
    const { model, openRandomization } = this.props
    openRandomization({ id: model.id, entityName: 'choice' })
  }

  linkedAssessment = () => {
    const { model, openLinkedAssessment } = this.props
    openLinkedAssessment({ id: model.id })
  }

  saveAsTemplate = () => {
    const { saveAsTemplate, model } = this.props
    saveAsTemplate(model)
  }

  defaultValue = () => {
    const { model, openDefaultValue } = this.props
    openDefaultValue({ model })
  }

  displayLogic = () => {
    const { model, openDisplayLogic } = this.props
    openDisplayLogic({
      question: model,
      logicElement: model.display_logic || new LogicElement(),
    })
  }

  hasDefaultValues (model) {
    if (model.props.defaultValues.length > 0) {
      return model.type !== 'TextEntry' || _.some(
        model.props.defaultValues, object => object.value,
      )
    }
    return false
  }

  randomizationMenuItem () {
    const { moduleConfig } = this.props
    if (moduleConfig.randomization) {
      return [
        {
          key: 'randomization',
          icon: <span className={`icon fa fa-random ${styles.menuicon}`} />,
          label: I18n.t('administration.survey_builder.question_info_bar.randomization'),
          onClick: this.randomization,
        },
      ]
    }
    return []
  }

  renderAddToTemplate () {
    const { model, block } = this.props
    if (!model.templateId && !block.templateId) {
      return [
        {
          key: 'add_to_template',
          label: I18n.t('administration.survey_builder.question_info_bar.save_as_a_template'),
          icon: <SaveOutlined />,
          onClick: this.saveAsTemplate,
        },
      ]
    }
    return []
  }

  moveQuestionToPositionMenuItem () {
    const { model, openMoveQuestionModal } = this.props
    return [
      {
        key: 'move_question_to_position',
        label: I18n.t('administration.survey_builder.question_info_bar.move_question'),
        icon: <SwapOutlined />,
        onClick: (e) => {
          e.domEvent.stopPropagation()
          openMoveQuestionModal({ question: model })
        },
      },
    ]
  }

  defaultValueMenuItem () {
    const { moduleConfig } = this.props
    if (moduleConfig.defaultValue) {
      return [
        {
          key: 'add_default_choice',
          icon: <CheckCircleOutlined />,
          label: I18n.t('administration.survey_builder.question_info_bar.default_choices'),
          onClick: this.defaultValue,
        },
      ]
    }
    return []
  }

  renderOptions () {
    return (
      <Dropdown
        trigger={['click']}
        menu={{
          items: [
            {
              key: 'add_display_logic',
              icon: <EyeOutlined />,
              label: I18n.t('administration.survey_builder.question_info_bar.add_display_logic'),
              onClick: this.displayLogic,
            },
            {
              key: 'add_skip_logic',
              icon: <EyeInvisibleOutlined />,
              label: I18n.t('administration.survey_builder.question_info_bar.add_skip_logic'),
              onClick: this.addSkipLogic,
            },
            ...this.defaultValueMenuItem(),
            ...this.linkedQuestionsMenuItem(),
            ...this.randomizationMenuItem(),
            ...this.moveQuestionToPositionMenuItem(),
            ...this.renderAddToTemplate(),
            {
              key: 'delete_question',
              label: (
                <Popconfirm
                  title={I18n.t('administration.survey_builder.question_info_bar.delete_the_question')}
                  description={
                    I18n.t('administration.survey_builder.question_info_bar.are_you_sure_to_delete_this_question')
                  }
                  onConfirm={() => this.remove()}
                  okText={I18n.t('common.text.confirm')}
                  cancelText={I18n.t('common.text.cancel')}
                >
                  {I18n.t('administration.survey_builder.question_info_bar.delete_question')}
                </Popconfirm>
              ),
              icon: <DeleteOutlined />,
            },
          ],
        }}
      >
        <Button
          block
          onClick={e => e.stopPropagation()}
        >
          <Space>
            <SettingOutlined />
          </Space>
        </Button>
      </Dropdown>
    )
  }

  renderRandomLabel () {
    const { model, moduleConfig } = this.props
    if (moduleConfig.randomization) {
      return model.props.randomization.type !== 'No' && (
        <div
          title={I18n.t('administration.survey_builder.question_info_bar.this_question_has_randomization')}
          className={styles.randomized}
        >
          <span className="fa fa-random" />
        </div>
      )
    }
    return null
  }

  renderDefaultValue () {
    const { model, moduleConfig } = this.props
    if (moduleConfig.defaultValue) {
      return this.hasDefaultValues(model) && (
        <div
          title={I18n.t('administration.survey_builder.question_info_bar.this_question_has_default_choices')}
          className={styles.randomized}
        >
          <span className="fa fa-dot-circle-o" />
        </div>
      )
    }
    return null
  }

  linkedQuestionsMenuItem () {
    const { linkedAssessment } = this.props
    if (linkedAssessment) {
      return [
        {
          key: 'linked_assessment',
          label: I18n.t('assessments.question_info_bar.select_linked_questions'),
          icon: <PartitionOutlined />,
          onClick: this.linkedAssessment,
        },
      ]
    }
    return []
  }

  render () {
    return (
      <div className={styles.infobar}>
        {this.renderOptions()}
        {this.renderDefaultValue()}
        {this.renderRandomLabel()}
      </div>
    )
  }
}

export default Question
