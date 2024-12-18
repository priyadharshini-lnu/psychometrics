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
import { SafeHTML } from '~/components/SafeHTML'
import '~/modules/reports/commands/froalaCommands'
import ResponseTextByQuestionType from './ResponseTextByQuestionType'
import styles from './Text.less'
import config from './froalaConfig'
import GetText from './GetText'
import LookupResultTextValue from './LookupResultTextValue'
import GetStyles from './GetStyles'
import PipedText from './PipedText'
import {
  convertColor, useAssignStyle, joinStyles, gradientStyle, borderRadiusStyle,
} from '../../CommonMethods/styles'

const assignStyle = useAssignStyle('Text')

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
      openConditionalText({ modules: [module] })
    } else if (module.props.sourceType === 'ConditionalFactorOccupationText') {
      openConditionalFactorOccupationText({ modules: [module] })
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

  pipedText (text) {
    const { module, pageNumber, totalPages } = this.props
    return PipedText.run(
      text ?? I18nStore.tModule(module, 'text'),
      module,
      { page_number: pageNumber, total_pages: totalPages },
    )
  }

  buildStyles (styles, overrides) {
    const { module, flipContent } = this.props

    let style = styles
    const outerStyle = {}

    const {
      backgroundColor, fontColor, fontFamily, borderColor, borderRadius,
      fontSize, fontWeight, fontStyle, verticalAlign, horizontalAlign,
    } = overrides
    let horizontalAlignNew = assignStyle(style, 'textAlign', horizontalAlign)

    if (window.I18n.locale === 'ar' && horizontalAlignNew === 'left' && I18nStore.isExistTModule(module, 'text')) {
      horizontalAlignNew = 'right'
    }

    if (flipContent && horizontalAlign === 'left') {
      horizontalAlignNew = horizontalAlign === 'left' ? 'right' : 'left'
    }

    if (flipContent && horizontalAlign === 'right') {
      horizontalAlignNew = horizontalAlign === 'right' ? 'left' : 'right'
    }

    if (!style.border && !overrides.borderColor) {
      style = _.omit(style, ['border', 'borderColor', 'borderWidth', 'borderStyle'])
    }

    style.color = assignStyle(style, 'color', convertColor(fontColor))
    style.fontSize = assignStyle(style, 'fontSize', fontSize)
    style.fontFamily = assignStyle(style, 'fontFamily', fontFamily)
    style.fontWeight = assignStyle(style, 'fontWeight', fontWeight)
    style.fontStyle = assignStyle(style, 'fontStyle', fontStyle)
    style.textAlign = horizontalAlignNew || assignStyle(style, 'textAlign', '')
    style.alignItems = verticalAlign || assignStyle(style, 'alignItems', '')

    style.borderColor = assignStyle(style, 'borderColor', convertColor(borderColor))
    style.borderWidth = assignStyle(style, 'borderWidth')
    style.borderStyle = assignStyle(style, 'borderStyle')
    const br = assignStyle(style, 'borderRadius', borderRadius)
    const borderCorners = borderRadiusStyle(style, br)


    style.backgroundColor = assignStyle(style, 'backgroundColor', convertColor(backgroundColor))

    if (!_.isNil(borderRadius)) {
      style.borderRadius = `${borderRadius}px`
      outerStyle.borderRadius = `${borderRadius}px`
    } else {
      Object.assign(style, borderCorners)
      Object.assign(outerStyle, borderCorners)
    }

    if (style.boxShadow?.enabled) {
      const {
        x, y, blur, spread, color,
      } = style.boxShadow
      const sx = flipContent ? -(x || 0) : x || 0
      outerStyle.boxShadow = `${sx}px ${y || 0}px ${blur || 0}px ${spread || 0}px ${color}`
    }

    if (!backgroundColor && style.gradient?.enabled) {
      const gradient = gradientStyle(style.gradient)
      if (gradient) { style.backgroundImage = gradient }
    }

    style = _.omit(style, ['boxShadow'])

    if (borderColor && !style.borderWidth) {
      style.border = `1px solid ${convertColor(borderColor)}`
    }

    return [style, outerStyle]
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

    if (preview) {
      const override = _.find(moduleOverrides, { moduleId: model.id })

      if ((sourceType === 'ResponseText') && !override?.content) {
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
              {this.pipedText(model.getTextByCondition())}
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
        if (model?.props?.source?.type === 'CampaignFactors' && model?.props?.source?.codes?.length > 0) {
          const factorResults = ResultStore.results[assessmentId].campaignFactorResults
          const code = model.props.source.codes[0]
          textValue = factorResults && (_.find(factorResults, { code })?.value ?? '')
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
      : <SafeHTML className={styles.editor} html={I18nStore.tModule(model, 'text')} />
  }

  render () {
    const {
      module: model, preview, reportStyles,
    } = this.props
    const { styleIds } = model.props
    let [style, outerStyle] = this.buildStyles(joinStyles(reportStyles, styleIds), model.props.style)

    if (model.props.sourceType === 'ConditionalText'
      || (model.props.sourceType === 'ConditionalFactorOccupationText' && model.props.basedOn === 'factor')) {
      let styles = null
      if (model.props.sourceType === 'ConditionalFactorOccupationText') {
        styles = GetStyles.run(model)
      } else {
        styles = model.getStylesByCondition()
      }
      if (styles) {
        [style, outerStyle] = this.buildStyles(
          joinStyles(reportStyles, styles.styleIds), { ...model.props.style, ...styles },
        )
      }
    }

    return (
      <Foundation {...this.props} preview={preview || this.edit} outerStyle={outerStyle}>
        <div style={style} onClick={this.click} className={styles.text} onDoubleClick={this.openEditor}>
          {this.renderText()}
        </div>
      </Foundation>
    )
  }
}


export default Text
