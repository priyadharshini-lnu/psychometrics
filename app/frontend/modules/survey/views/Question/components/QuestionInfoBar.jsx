import _ from 'lodash'
import { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Dropdown, Button, Space, Popconfirm,
} from 'antd'
import {
  EyeOutlined, SaveOutlined, PartitionOutlined, SettingOutlined, CheckCircleOutlined,
  EyeInvisibleOutlined, DeleteOutlined,
} from '@ant-design/icons'
import LogicElement from '~/modules/survey/models/logic/LogicElement'
import styles from './Question.less'

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
          label: 'Randomization',
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
          label: 'Save as a Template',
          icon: <SaveOutlined />,
          onClick: this.saveAsTemplate,
        },
      ]
    }
    return []
  }

  defaultValueMenuItem () {
    const { moduleConfig } = this.props
    if (moduleConfig.defaultValue) {
      return [
        {
          key: 'add_default_choice',
          icon: <CheckCircleOutlined />,
          label: 'Default Choices',
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
              label: 'Add Display Logic',
              onClick: this.displayLogic,
            },
            {
              key: 'add_skip_logic',
              icon: <EyeInvisibleOutlined />,
              label: 'Add Skip Logic',
              onClick: this.addSkipLogic,
            },
            ...this.defaultValueMenuItem(),
            ...this.linkedQuestionsMenuItem(),
            ...this.randomizationMenuItem(),
            ...this.renderAddToTemplate(),
            {
              key: 'delete_question',
              label: (
                <Popconfirm
                  title="Delete the question"
                  description="Are you sure to delete this question?"
                  onConfirm={() => this.remove()}
                  okText="Yes"
                  cancelText="No"
                >
                  Delete Question
                </Popconfirm>
              ),
              icon: <DeleteOutlined />,
            },
          ],
        }}
      >
        <Button block>
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
        <div title="This question has randomization" className={styles.randomized}>
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
        <div title="This question has default choices" className={styles.randomized}>
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
          onclick: this.linkedAssessment,
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
