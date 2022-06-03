import { CheckOutlined } from '@ant-design/icons'
import _ from 'lodash'
import React, { Component } from 'react'
import cs from 'classnames'
import PropTypes from 'prop-types'
import ReactMarkdown from 'react-markdown'
import FroalaEditor from 'react-froala-wysiwyg'
import 'froala-editor/js/froala_editor.pkgd.min'
import 'froala-editor/js/plugins.pkgd.min'
import { SafeHTML } from 'components/SafeHTML'
import Foundation from 'modules/reports/components/Foundation'
import store from 'modules/reports/store/PageList'
import ResultStore from 'modules/reports/store/ResultStore'
import AppStore from 'modules/reports/store/AppStore'
import RichEditorStore from 'modules/reports/store/RichEditorStore'
import I18nStore from 'modules/reports/store/I18nStore'
import Factors from 'modules/reports/commands/Factors'
import 'modules/reports/commands/froalaCommands'
import { getSavilleFactorsScore } from 'modules/reports/commands/getSavilleFactorsScore'
import { Button, Checkbox, Popconfirm } from 'antd'
import htmldiff from 'libs/htmldiff'
import ResponseTextByQuestionType from './ResponseTextByQuestionType'
import styles from './Text.scss'
import config from './froalaConfig'
import GetText from './GetText'
import GetStyles from './GetStyles'

class Text extends Component {
  static propTypes = {
    module: PropTypes.object.isRequired,
    page: PropTypes.object.isRequired,
    children: PropTypes.node,
    preview: PropTypes.bool,
  }

  state = {
    content: null,
    showDiff: false,
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

  onChangeReview = (content) => {
    this.setState({ content })
  }

  getSavilleScore = () => {
    const {
      module: {
        assessment_id: assessmentId,
        props: {
          source: { factors, type, valueType },
        },
      },
    } = this.props
    const factorId = factors && factors[0]
    if (factorId) {
      const externalScoring = _.get(ResultStore, ['results', assessmentId, 'externalScoring'])
      const scoreType = type.replace('Saville#', '')
      const assessment = AppStore.getAssessmentById(assessmentId)
      const scores = getSavilleFactorsScore({
        scoreType,
        valueType,
        scores: externalScoring,
        assessmentId,
        allFactors: assessment.factors,
        scoreForFactorIds: [factorId],
      })
      return scores?.length ? scores[0].score : null
    }
  }

  editor = null

  edit = false

  openEditor = () => {
    const {
      openConditionalText, openConditionalFactorOccupationText, module, openRichEditor, preview,
    } = this.props
    if (preview) { return }
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

  openReviewEditor = (override) => {
    const { openReviewEditor, module } = this.props
    this.setState({ content: override?.content || module.props.text })
    openReviewEditor()
    this.edit = true
  }

  saveReview = (override) => {
    const {
      module, updateTextOverride, createTextOverride, userReport: { id, campaignId },
    } = this.props
    const { content } = this.state
    const data = {
      userReportId: id,
      moduleId: module.id,
      content,
    }
    override ? updateTextOverride(campaignId, override.id, data) : createTextOverride(campaignId, data)
    this.closeReviewEditor()
  }

  closeReviewEditor = () => {
    const { closeReviewEditor } = this.props
    if (this.edit) {
      this.edit = false
      closeReviewEditor()
      this.forceUpdate()
    }
  }

  lookupResultTextValue (model) {
    const sourceType = _.get(model, 'props.source.type')
    switch (sourceType) {
      case 'DataSheet': {
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
      }
      case 'Count':
      case 'Score':
      case 'Stability':
      case 'RawScale':
      case 'PercentileScale': {
        const factor = _.get(model, ['props', 'source', 'factors', 0])
        if (factor) {
          const externalScoring = _.get(ResultStore, ['results', model.assessment_id, 'externalScoring'])
          return Factors.LookupValue.call(externalScoring, sourceType, factor, 'string')
        }
        break
      }
      case 'Saville#Ipsative':
      case 'Saville#Nipsative':
      case 'Saville#Normative':
      case 'Saville#Raw':
        return this.getSavilleScore()
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
      pageNumber,
      totalPages,
      moduleOverrides,
    } = this.props
    const { content, showDiff } = this.state

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
      const override = _.find(moduleOverrides, { moduleId: model.id })

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
        const interpolate = /{{(first_name|last_name|completed_at|norm_used|locale_name|page_number|total_pages)}}/g
        const compiled = _.template(I18nStore.tModule(model, 'text'), { interpolate })

        const html = compiled({
          first_name: _.get(ResultStore, 'user.first_name', '{{first_name}}'),
          last_name: _.get(ResultStore, 'user.last_name', '{{last_name}}'),
          completed_at: _.get(AppStore, 'report.result_completed_at', '{{completed_at}}'),
          norm_used: _.get(AppStore, ['report', 'norm_used', assessmentId], '{{norm_used}}'),
          locale_name: _.get(AppStore, ['report', 'result_locale', assessmentId], '{{locale_name}}'),
          page_number: pageNumber,
          total_pages: totalPages,
        })

        return (
          <SafeHTML
            ref={(ref) => { this.editor = ref }}
            className={cs(styles.editor, 'ltr')}
            html={html}
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

      return this.edit
        ? (
          <FroalaEditor
            key="editor"
            ref={(ref) => { this.editor = ref }}
            config={config}
            model={content}
            onModelChange={content => this.setState({ content })}
          />
        ) : (
          <SafeHTML
            html={override && showDiff
              ? htmldiff(model.props.text, override.content)
              : override?.content || I18nStore.tModule(model, 'text')}
            ref={(ref) => { this.editor = ref }}
            className={cs(styles.editor, { [styles.diff]: showDiff })}
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
      : <SafeHTML className={styles.editor} html={text} />
  }

  render () {
    const {
      module: model, preview, approveTextOverride, userReport = {},
      showOverrides, removeTextOverride, moduleOverrides,
    } = this.props
    const { campaignId } = userReport
    const override = _.find(moduleOverrides, { moduleId: model.id })
    const { showDiff } = this.state
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
        style.backgroundColor = `rgba(
          ${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b}, ${backgroundColor.a})`
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
          {preview && showOverrides && model.props.editable && (
            <div className={styles.editable}>
              {this.edit
                ? (
                  <>
                    <Button
                      type="primary"
                      onClick={() => this.saveReview(override)}
                      className={cs(styles.btn, styles.edit)}
                    >
                      Save
                    </Button>
                    <Button
                      type="danger"
                      className={cs(styles.btn, styles.discard)}
                      onClick={() => this.closeReviewEditor()}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    {override?.content && (
                      <Checkbox
                        className={cs(styles.checkbox)}
                        checked={showDiff}
                        onChange={() => this.setState({ showDiff: !showDiff })}
                      >
                        Show diff
                      </Checkbox>
                    )}
                    <Button
                      type="primary"
                      onClick={() => this.openReviewEditor(override)}
                      className={cs(styles.btn, styles.edit)}
                    >
                      Edit
                    </Button>
                    {override?.approved
                      ? (
                        <Button type="primary" className={cs(styles.btn, styles.approved)}>
                          <CheckOutlined />
                          {' '}
                          Accepted
                        </Button>
                      )
                      : (
                        <Button
                          type="primary"
                          className={cs(styles.btn, styles.approve)}
                          onClick={() => approveTextOverride(campaignId, {
                            id: override?.id,
                            moduleId: model.id,
                            userReportId: userReport.id,
                          })}
                        >
                          Accept
                        </Button>
                      )}
                    {override && (
                      <Popconfirm
                        overlayStyle={{ zIndex: 9999 }}
                        title="Are you sure to discard this text?"
                        onConfirm={() => removeTextOverride(campaignId, override.id, userReport.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button type="danger" className={cs(styles.btn, styles.discard)}>
                          Discard
                        </Button>
                      </Popconfirm>
                    )}
                  </>
                )}
            </div>
          )}
          {this.renderText()}
        </div>
      </Foundation>
    )
  }
}


export default Text
