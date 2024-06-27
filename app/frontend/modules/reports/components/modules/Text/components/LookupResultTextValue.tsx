import { ReactElement } from 'react'
import _ from 'lodash'
import ReactMarkdown from 'react-markdown'
import ResultStore from '~/modules/reports/store/ResultStore'
import AppStore from '~/modules/reports/store/AppStore'
import Factors from '~/modules/reports/commands/Factors'
import { SafeHTML } from '~/components/SafeHTML'
import GetSavilleScore from './GetSavilleScore'
import Result from '~/modules/reports/models/Result'

const LookupResultTextValue = {
  run (model): ReactElement | number | string | null {
    const sourceType = _.get(model, 'props.source.type')
    switch (sourceType) {
      case 'DataSheet': {
        const columnName = _.get(model, ['props', 'source', 'columns', 0])
        if (columnName) {
          const field = _.find(AppStore.report.dataSheetColumns, { name: columnName })
          if (!field) break
          const text = _.get(ResultStore, ['results', model.assessment_id, 'dataSheet', columnName])

          if (field.type === 'Number' && model.props.precision) {
            return parseFloat(text).toFixed(model.props.precision)
          }
          if (field.type === 'Markdown') {
            return <ReactMarkdown>{text}</ReactMarkdown>
          }
          if (field.type === 'HTML') {
            return <SafeHTML config="report" html={text} />
          }

          return text
        }
        break
      }
      case 'Factor': {
        const factor = _.get(model, ['props', 'source', 'factors'])
        if (factor) {
          const factorIds = [factor.id]
          const result = ResultStore.results[model.assessment_id] as unknown as Result
          const factorData = result.getTopFactors(0, factorIds.length, factorIds, 1)
          if (factorData.length) {
            return (factorData[0].meanNormScore || factorData[0].meanRawScore) ?? ''
          }
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
        return GetSavilleScore.run(model)
      case 'ReportData': {
        const key = _.get(model, ['props', 'source', 'reportDataColumns', 'value'])
        return _.get(ResultStore, ['results', model.assessment_id, 'reportData', key])
      }
      default:
    }
    return ''
  },
}


export default LookupResultTextValue
