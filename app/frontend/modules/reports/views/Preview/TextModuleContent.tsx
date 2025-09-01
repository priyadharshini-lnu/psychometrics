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
    return I18nStore.tModule(module, 'text')
  },
}
