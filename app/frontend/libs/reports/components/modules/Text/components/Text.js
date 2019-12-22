/* eslint-disable react/no-danger */
/* eslint-disable no-case-declarations */
import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Foundation from 'rb/components/Foundation'
import store from 'rb/store/PageList'
import ResultStore from 'rb/store/ResultStore'
import AppStore from 'rb/store/AppStore'
import RichEditorStore from 'rb/store/RichEditorStore'
import I18nStore from 'rb/store/I18nStore'
import ConditionTextStore from 'rb/store/modals/ConditionTextStore'
import ConditionalFactorOccupationTextStore from 'rb/store/modals/ConditionalFactorOccupationTextStore'
// import config from 'rb/consts/CKConfig'
import AssessmentStore from 'rb/store/AssessmentStore'
import Factors from 'rb/commands/Factors'
import { renderMarkdown } from 'rb/utils/Markdown'
import 'rb/commands/froalaCommands'
import 'froala-editor/js/froala_editor.pkgd.min'
import 'froala-editor/js/plugins.pkgd.min'
import FroalaEditor from 'react-froala-wysiwyg'
import ResponseTextByQuestionType from './ResponseTextByQuestionType'
import styles from './Text.scss'
import config from './froalaConfig'

const { md } = window
class Text extends Component {
  static propTypes = {
    module: PropTypes.object.isRequired,
    page: PropTypes.object.isRequired,
    children: PropTypes.node,
    preview: PropTypes.bool,
  }

  editor = null

  edit = false

  componentDidMount () {
    RichEditorStore.addListener('close', () => {
      this.closeEditor()
    })
  }

  componentDidUpdate () {
    const { module, preview } = this.props
    if (!preview) {
      if (_.find(store.selected, module) && this.edit) {
        if (this.editor) {
          RichEditorStore.open()
        }
      } else if (this.editor && this.edit && RichEditorStore.opened) {
        module.update()
        RichEditorStore.close()
        this.edit = false
      }
    }
  }

  onChange = (value) => {
    const { module } = this.props
    module.props.text = value
    module.update()
  }

  openEditor = () => {
    const { module } = this.props
    if (module.props.sourceType === 'ConditionalText') {
      ConditionTextStore.open(module)
    } else if (module.props.sourceType === 'ConditionalFactorOccupationText') {
      ConditionalFactorOccupationTextStore.open(module)
    } else {
      this.edit = true
      RichEditorStore.open(module)
      this.forceUpdate()
    }
  }

  click = (e) => {
    if (this.edit) {
      e.stopPropagation()
    }
  }

  closeEditor =() => {
    const { module } = this.props
    module.update()
    this.edit = false
    this.forceUpdate()
  }

  lookupResultTextValue (model) {
    const sourceType = _.get(model, 'props.source.type')
    switch (sourceType) {
      case 'DataSheet':
        const columnName = _.get(model, ['props', 'source', 'columns', 0])
        if (columnName) {
          return _.get(ResultStore, ['results', model.assessment_id, 'dataSheet', columnName])
        }
        break
      case 'Count':
      case 'Score':
      case 'Stability':
      case 'RawScale':
      case 'PercentileScale':
        const factor = _.get(model, ['props', 'source', 'factors', 0])
        if (factor) {
          const externalScoring = _.get(ResultStore, ['results', model.assessment_id, 'externalScoring'])
          return Factors.LookupValue.call(externalScoring, sourceType, factor, 'string')
        }
        break
      default:
    }
    return ''
  }

  renderText () {
    const { module: model, preview } = this.props
    if (preview) {
      if (model.props.sourceType === 'ConditionalText') {
        const html = renderMarkdown(model.getTextByCondition())
        return (
          <div
            ref={(ref) => { this.editor = ref }}
            className={styles.editor}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )
      } if (model.props.sourceType === 'ConditionalFactorOccupationText') {
        const html = renderMarkdown(ConditionalFactorOccupationTextStore.getText(model))
        return (
          <div
            ref={(ref) => { this.editor = ref }}
            className={styles.editor}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )
      } if (model.props.sourceType === 'ConditionalFactorOccupationText') {
        const html = md.render(ConditionalFactorOccupationTextStore.getText(model))
        return (
          <div
            ref={(ref) => { this.editor = ref }}
            className={styles.editor}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )
      } if (model.props.sourceType === 'PipedText') {
        _.templateSettings.interpolate = /{{([\s\S]+?)}}/g
        const compiled = _.template(I18nStore.tModule(model, 'text'))

        const html = compiled({
          first_name: _.get(ResultStore, 'user.first_name', '{{first_name}}'),
          last_name: _.get(ResultStore, 'user.last_name', '{{last_name}}'),
          completed_at: _.get(AppStore, 'report.result_completed_at', '{{completed_at}}'),
          norm_used: _.get(AppStore, 'report.norm_used', '{{norm_used}}'),
          locale_name: _.get(AppStore, 'report.result_locale', '{{locale_name}}'),
        })
        return (
          <div
            ref={(ref) => { this.editor = ref }}
            className={styles.editor}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )
      } if (model.props.sourceType === 'ResponseText') {
        const question = AssessmentStore.questions[model.assessment_id][model.props.question]
        if (!question) { return null }
        const QuestionTypeModel = ResponseTextByQuestionType[question.type]
        const particularResult = _.get(ResultStore, ['results', model.assessment_id, 'questions', question.id, 0])
        if (!QuestionTypeModel) {
          // eslint-disable-next-line no-console
          console.error(`QuestionTypeModel for ResponseText is not found by question ${question}`)
          return null
        }
        return (
          <div ref={(ref) => { this.editor = ref }} className={styles.editor}>
            <QuestionTypeModel
              result={particularResult}
              model={model}
              question={question}
              isReal={ResultStore.realResults}
            />
          </div>
        )
      } if (model.props.sourceType === 'ResultText') {
        return (
          <div ref={(ref) => { this.editor = ref }} className={styles.editor}>
            {/* TODO: Render as markdown only for Datasheet where the column is markdown */}
            <div>{this.lookupResultTextValue(model)}</div>
          </div>
        )
      }
      return (
        <div
          ref={(ref) => { this.editor = ref }}
          className={styles.editor}
          dangerouslySetInnerHTML={{ __html: I18nStore.tModule(model, 'text') }}
        />
      )
    }
    if (model.props.sourceType === 'ResultText') {
      return (
        <div ref={(ref) => { this.editor = ref }} className={styles.editor}>
          {/* TODO: Render as markdown only for Datasheet where the column is markdown */}
          <div>{`${JSON.stringify(model.props.source)}`}</div>
        </div>
      )
    }
    return this.edit
      ? (
        <FroalaEditor
          ref={(ref) => { this.editorRef = ref }}
          config={config}
          model={model.props.text}
          onModelChange={this.onChange}
        />
      )
      : <div className={styles.editor} dangerouslySetInnerHTML={{ __html: model.props.text }} />
  }

  render () {
    const { module: model, preview } = this.props
    const {
      backgroundColor, fontColor, fontFamily, borderColor, borderRadius,
      fontSize, fontWeight, fontStyle, verticalAlign,
    } = model.props.style
    let { horizontalAlign } = model.props.style


    if (window.I18n.locale === 'ar' && horizontalAlign === 'left' && I18nStore.isExistTModule(model, 'text')) {
      horizontalAlign = 'right'
    }

    const style = {
      backgroundColor: `rgba(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b}, ${backgroundColor.a})`,
      border: '1px solid',
      borderRadius,
      borderColor: `rgba(${borderColor.r}, ${borderColor.g}, ${borderColor.b}, ${borderColor.a})`,
      color: fontColor,
      fontSize,
      fontFamily,
      fontWeight,
      fontStyle,
      textAlign: horizontalAlign,
      alignItems: verticalAlign,
      WebkitAlignItems: verticalAlign,
    }
    if (model.props.sourceType === 'ConditionalText'
      || (model.props.sourceType === 'ConditionalFactorOccupationText' && model.props.basedOn === 'factor')) {
      let styles = {}
      if (model.props.sourceType === 'ConditionalFactorOccupationText') {
        styles = ConditionalFactorOccupationTextStore.fetchStyles(model)
      } else {
        styles = model.getStylesByCondition()
      }
      const {
        backgroundColor, fontColor, fontFamily, borderColor, fontSize,
      } = styles
      if (backgroundColor) {
        // eslint-disable-next-line max-len
        style.backgroundColor = `rgba(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b}, ${backgroundColor.a})`
      }
      if (borderColor) {
        style.borderColor = `rgba(${borderColor.r}, ${borderColor.g}, ${borderColor.b}, ${borderColor.a})`
      }
      if (fontColor) style.color = fontColor
      if (fontSize) style.fontSize = fontSize
      if (fontFamily) style.fontFamily = fontFamily
    }
    return (
      <Foundation {...this.props} preview={preview || this.edit}>
        <div style={style} onClick={this.click} className={styles.text} onDoubleClick={this.openEditor}>
          {this.renderText()}
        </div>
      </Foundation>
    )
  }
}

export default Text
