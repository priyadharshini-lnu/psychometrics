/* eslint-disable react/no-danger */
/* eslint-disable no-case-declarations */
import _ from 'lodash'
import React, { Component } from 'react'
import cs from 'classnames'
import PropTypes from 'prop-types'
import ReactMarkdown from 'react-markdown'
import FroalaEditor from 'react-froala-wysiwyg'
import 'froala-editor/js/froala_editor.pkgd.min'
import 'froala-editor/js/plugins.pkgd.min'

import Foundation from 'rb/components/Foundation'
import store from 'rb/store/PageList'
import ResultStore from 'rb/store/ResultStore'
import AppStore from 'rb/store/AppStore'
import RichEditorStore from 'rb/store/RichEditorStore'
import I18nStore from 'rb/store/I18nStore'
import Factors from 'rb/commands/Factors'
import 'rb/commands/froalaCommands'
import ResponseTextByQuestionType from './ResponseTextByQuestionType'
import styles from './Text.scss'
import config from './froalaConfig'
import GetText from './GetText'
import GetStyles from './GetStyles'

class Text extends Component {
  editor = null

  edit = false

  static propTypes = {
    module: PropTypes.object.isRequired,
    page: PropTypes.object.isRequired,
    children: PropTypes.node,
    preview: PropTypes.bool,
  }

  componentDidMount () {
    this.listener = RichEditorStore.addListener('close', () => {
      this.closeEditor()
    })
  }

  componentDidUpdate () {
    const {
      module, preview, openRichEditor, closeRichEditor, richEditorOpened,
    } = this.props
    if (!preview) {
      if (_.find(store.selected, { id: module.id }) && this.edit) {
        if (this.editor && !richEditorOpened) {
          openRichEditor()
        }
      } else if (this.editor && this.edit && !richEditorOpened) {
        module.update()
        closeRichEditor()
        this.edit = false
        this.forceUpdate()
      }
    }
  }

  componentWillUnmount () {
    this.listener.remove()
  }

  onChange = (value) => {
    const { module } = this.props
    module.props.text = value
    module.update()
  }

  openEditor = () => {
    const {
      openConditionalText, openConditionalFactorOccupationText, module, openRichEditor,
    } = this.props
    if (module.props.sourceType === 'ConditionalText') {
      openConditionalText({ module })
    } else if (module.props.sourceType === 'ConditionalFactorOccupationText') {
      openConditionalFactorOccupationText({ module })
    } else {
      this.edit = true
      openRichEditor()
    }
  }

  click = (e) => {
    if (this.edit) {
      e.stopPropagation()
    }
  }

  closeEditor = () => {
    const { closeRichEditor } = this.props
    if (this.edit) {
      const { module } = this.props
      module.update()
      closeRichEditor()
    }
  }

  lookupResultTextValue (model) {
    const sourceType = _.get(model, 'props.source.type')
    switch (sourceType) {
      case 'DataSheet':
        const columnName = _.get(model, ['props', 'source', 'columns', 0])
        if (columnName) {
          const field = _.find(AppStore.report.dataSheetColumns, { name: columnName })
          if (!field) break
          const text = _.get(ResultStore, ['results', model.assessment_id, 'dataSheet', columnName])
          if (field.type === 'Markdown') {
            return <ReactMarkdown>{text}</ReactMarkdown>
          }
          return text
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
    const {
      module: model,
      module: {
        assessment_id: assessmentId,
        props: {
          source, sourceType, text, question: modelQuestion,
        },
      },
      questions,
      preview,
    } = this.props

    if (sourceType === 'ResponseText') {
      const question = _.find(questions, { id: modelQuestion })
      if (!question) { return null }
      const QuestionTypeModel = ResponseTextByQuestionType[question.type]
      const particularResult = _.get(ResultStore, ['results', assessmentId, 'questions', question.id, 0])
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
            preview={preview}
          />
        </div>
      )
    }

    if (preview) {
      if (sourceType === 'ConditionalText') {
        return (
          <div
            ref={(ref) => { this.editor = ref }}
            className={styles.editor}
          >
            <ReactMarkdown>
              {model.getTextByCondition()}
            </ReactMarkdown>
          </div>
        )
      } if (sourceType === 'ConditionalFactorOccupationText') {
        return (
          <div
            ref={(ref) => { this.editor = ref }}
            className={styles.editor}
          >
            <ReactMarkdown>
              {GetText.run(model)}
            </ReactMarkdown>
          </div>
        )
      } if (sourceType === 'PipedText') {
        const templateInterpolate = /{{(first_name|last_name|completed_at|norm_used|locale_name)}}/g
        const compiled = _.template(I18nStore.tModule(model, 'text'), { interpolate: templateInterpolate })

        const html = compiled({
          first_name: _.get(ResultStore, 'user.first_name', '{{first_name}}'),
          last_name: _.get(ResultStore, 'user.last_name', '{{last_name}}'),
          completed_at: _.get(AppStore, 'report.result_completed_at', '{{completed_at}}'),
          norm_used: _.get(AppStore, ['report', 'norm_used', assessmentId], '{{norm_used}}'),
          locale_name: _.get(AppStore, ['report', 'result_locale', assessmentId], '{{locale_name}}'),
        })
        return (
          <div
            ref={(ref) => { this.editor = ref }}
            className={cs(styles.editor, 'ltr')}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )
      } if (sourceType === 'ResultText') {
        const textValue = this.lookupResultTextValue(model)
        return (
          <div ref={(ref) => { this.editor = ref }} className={styles.editor}>
            <div>{textValue}</div>
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
    if (sourceType === 'ResultText') {
      return (
        <div ref={(ref) => { this.editor = ref }} className={styles.editor}>
          {/* TODO: Render as markdown only for Datasheet where the column is markdown */}
          <div>{`${JSON.stringify(source)}`}</div>
        </div>
      )
    }
    return this.edit
      ? (
        <FroalaEditor
          key="editor"
          ref={(ref) => { this.editor = ref }}
          config={config}
          model={text}
          onModelChange={this.onChange}
        />
      )
      : <div key="text" className={styles.editor} dangerouslySetInnerHTML={{ __html: text }} />
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
        styles = GetStyles.run(model)
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
