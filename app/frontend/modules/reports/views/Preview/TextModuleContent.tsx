import {
  ReactElement,
} from 'react'
import _ from 'lodash'
import ReactMarkdown from 'react-markdown'
import { renderToStaticMarkup } from 'react-dom/server'
import I18nStore from '~/modules/reports/store/I18nStore'
import PipedText from '~/modules/reports/components/modules/Text/components/PipedText'
import GetText from '~/modules/reports/components/modules/Text/components/GetText'
import ModuleInterface from '~/modules/reports/core/interfaces/Module'
import LookupResultTextValue from '~/modules/reports/components/modules/Text/components/LookupResultTextValue'
import { ResponseTexts } from '~/modules/reports/components/modules/Text/components/ResponseTextByQuestionType'
import ResultStore from '~/modules/reports/store/ResultStore'

const { I18n } = window

const renderAIRationaleEvidence = (module: ModuleInterface): string => {
  const questionId = module.props.question
  if (!questionId) return I18n.t('shared.reports.ai_rationale_evidence.no_question_selected')

  let aiMetadata = _.get(ResultStore, ['results', module.assessment_id, 'aiMetadataByQuestion', String(questionId)])
  if (!aiMetadata || aiMetadata.length === 0) {
    return I18n.t('shared.reports.ai_rationale_evidence.no_data')
  }

  const { hideRationale, hideEvidence, selectedFactors } = module.props

  if (selectedFactors && selectedFactors.length > 0) {
    aiMetadata = aiMetadata.filter(entry => selectedFactors.includes(entry.factorId))
  }

  if (aiMetadata.length === 0) {
    return I18n.t('shared.reports.ai_rationale_evidence.no_data')
  }

  const parts: string[] = []

  aiMetadata.forEach((entry) => {
    parts.push(`<div style="margin-bottom: 12px;"><strong>${_.escape(entry.factorName)}</strong>`)

    if (!hideRationale && entry.rationale) {
      parts.push(`<div style="margin-top: 4px;">${_.escape(entry.rationale)}</div>`)
    }

    if (!hideEvidence && entry.citations && entry.citations.length > 0) {
      parts.push('<ul style="margin-top: 4px; padding-left: 20px;">')
      entry.citations.forEach((citation) => {
        const text = typeof citation === 'string' ? citation : citation.text
        if (text) {
          parts.push(`<li>${_.escape(text)}</li>`)
        }
      })
      parts.push('</ul>')
    }

    parts.push('</div>')
  })

  return parts.join('')
}

const renderAITranscript = (module: ModuleInterface): string => {
  const questionId = module.props.question
  if (!questionId) return I18n.t('shared.reports.ai_transcript.no_question_selected')

  const mediaResponses = _.get(ResultStore, ['results', module.assessment_id, 'mediaResponses']) || []
  const mediaResponse = _.findLast(mediaResponses, { question_id: questionId })

  if (!mediaResponse || !mediaResponse.transcription_text) {
    return I18n.t('shared.reports.ai_transcript.no_data')
  }

  return mediaResponse.transcription_text
}

export const TextModuleContent = {
  run: (module: ModuleInterface, questions) => {
    const compileMarkdown = markdown => (
      <ReactMarkdown>
        {markdown}
      </ReactMarkdown>
    )
    if (module.props.sourceType === 'ConditionalText') {
      return renderToStaticMarkup(compileMarkdown(PipedText.run(module.getTextByCondition(), module)))
    }
    if (module.props.sourceType === 'ConditionalFactorOccupationText') {
      return renderToStaticMarkup(compileMarkdown(GetText.run(module)))
    }
    if (module.props.sourceType === 'PipedText') {
      return PipedText.run(I18nStore.tModule(module, 'text'), module)
    }
    if (module.props.sourceType === 'ResultText' || module.props.sourceType === 'AIContent') {
      const result = LookupResultTextValue.run(module)
      return result ? renderToStaticMarkup(result as ReactElement) : ''
    }
    if (module.props.sourceType === 'ResponseText') {
      if (!module.props.question) { return '' }
      const question = questions[module.props.question]
      if (!question) { return '' }
      const ResponseText = ResponseTexts[question.type]
      if (!ResponseText) { return ' ' }

      const particularResult = _.get(ResultStore, ['results', module.assessment_id, 'questions', question.id, 0])
      return ResponseText({ result: particularResult, model: module, question })
    }
    if (module.props.sourceType === 'AIRationaleEvidence') {
      return renderAIRationaleEvidence(module)
    }
    if (module.props.sourceType === 'AITranscript') {
      return renderAITranscript(module)
    }
    return I18nStore.tModule(module, 'text')
  },
}
