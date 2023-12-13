import _ from 'lodash'
import { Component } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import cs from 'classnames'
import PropTypes from 'prop-types'
import ReactMarkdown from 'react-markdown'
import FroalaEditor from 'react-froala-wysiwyg'
import 'froala-editor/js/froala_editor.pkgd.min'
import 'froala-editor/js/plugins.pkgd.min'
import Foundation from '~/modules/reports/components/Foundation'
import store from '~/modules/reports/store/PageList'
import ResultStore from '~/modules/reports/store/ResultStore'
import RichEditorStore from '~/modules/reports/store/RichEditorStore'
import I18nStore from '~/modules/reports/store/I18nStore'
import LookupSourceName from '~/modules/reports/commands/LookupSourceName'
import { SafeHTML } from '~/components/SafeHTML'
import '~/modules/reports/commands/froalaCommands'
import ResponseTextByQuestionType from './ResponseTextByQuestionType'
import styles from './Text.less'
import config from './froalaConfig'
import GetText from './GetText'
import LookupResultTextValue from './LookupResultTextValue'
import GetStyles from './GetStyles'
import PipedText from './PipedText'

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

  getTypeContent () {
    const {
      module: model,
      module: {
        props: {
          sourceType,
        },
      },
    } = this.props

    const compileMarkdown = markdown => (
      <ReactMarkdown>
        {markdown}
      </ReactMarkdown>
    )
    if (sourceType === 'ConditionalText') {
      return renderToStaticMarkup(compileMarkdown(model.getTextByCondition()))
    }
    if (sourceType === 'ConditionalFactorOccupationText') {
      return renderToStaticMarkup(compileMarkdown(GetText.run(model)))
    }
    if (sourceType === 'PipedText') {
      return this.pipedText()
    }
    if (sourceType === 'ResultText') {
      return renderToStaticMarkup(LookupResultTextValue.run(model))
    }
    return I18nStore.tModule(model, 'text')
  }

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

  pipedText () {
    const { module, pageNumber, totalPages } = this.props
    return PipedText.run(module, { page_number: pageNumber, total_pages: totalPages })
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
      moduleOverrides,
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
      const override = _.find(moduleOverrides, { moduleId: model.id })

      if (override) {
        return (
          <SafeHTML
            html={override?.content || this.getTypeContent()}
            ref={(ref) => { this.editor = ref }}
            className={cs(styles.editor)}
            config="adminRichText"
          />
        )
      }

      if (sourceType === 'ConditionalText') {
        return (
          <div
            ref={(ref) => { this.editor = ref }}
            className={cs(styles.editor, 'fr-view')}
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
            className={cs(styles.editor, 'fr-view')}
          >
            <ReactMarkdown>
              {GetText.run(model)}
            </ReactMarkdown>
          </div>
        )
      } if (sourceType === 'PipedText') {
        return (
          <SafeHTML
            ref={(ref) => { this.editor = ref }}
            className={cs(styles.editor, 'ltr')}
            html={this.pipedText()}
          />
        )
      } if (sourceType === 'ResultText') {
        let textValue = LookupResultTextValue.run(model)
        if (model.props.source.type === 'CampaignFactors') {
          const factorResults = ResultStore.results[assessmentId].campaignFactorResults
          const code = model.props.source.codes[0]
          const value = factorResults && _.find(factorResults, { code })?.value
          textValue = `${LookupSourceName.call({}, code, 'CampaignFactors')}: ${value}`
          return (
            textValue
          )
        }
        return (
          <div ref={(ref) => { this.editor = ref }} className={cs(styles.editor, 'fr-view')}>
            <div>{textValue}</div>
          </div>
        )
      }

      return (
        <SafeHTML
          html={override?.content || I18nStore.tModule(model, 'text')}
          ref={(ref) => { this.editor = ref }}
          className={cs(styles.editor)}
          config="adminRichText"
        />
      )
    }
    if (sourceType === 'ResultText') {
      if (model.props.source.type === 'CampaignFactors') {
        const code = model.props.source.codes[0]
        const factorResults = ResultStore.results[assessmentId].campaignFactorResults
        const value = factorResults && _.find(factorResults, { code })?.value
        const textValue = `${LookupSourceName.call({}, code, 'CampaignFactors')}: ${value}`
        return (
          <div ref={(ref) => { this.editor = ref }} className={cs(styles.editor, 'fr-view')}>
            <div>{textValue}</div>
          </div>
        )
      }
      return (
        <div ref={(ref) => { this.editor = ref }} className={cs(styles.editor, 'fr-view')}>
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
      module: model, preview,
    } = this.props
    const {
      backgroundColor, fontColor, fontFamily, borderColor, borderRadius,
      fontSize, fontWeight, fontStyle, verticalAlign,
    } = model.props.style
    let { horizontalAlign } = model.props.style

    if (window.I18n.locale === 'ar' && horizontalAlign === 'left' && I18nStore.isExistTModule(model, 'text')) {
      horizontalAlign = 'right'
    }

    const style = {
      border: '1px solid',
      borderRadius,
      color: fontColor,
      fontSize,
      fontFamily,
      fontWeight,
      fontStyle,
      textAlign: horizontalAlign,
      alignItems: verticalAlign,
      WebkitAlignItems: verticalAlign,
    }
    if (backgroundColor) {
      style.backgroundColor = `rgba(
        ${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b}, ${backgroundColor.a})`
    }
    if (borderColor) {
      style.borderColor = `rgba(${borderColor.r}, ${borderColor.g}, ${borderColor.b}, ${borderColor.a})`
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
          {this.renderText()}
        </div>
      </Foundation>
    )
  }
}


export default Text
