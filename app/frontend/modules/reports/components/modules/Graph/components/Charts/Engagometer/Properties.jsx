import { connect } from 'react-redux'
import { Checkbox } from 'antd'
import { getQuestions } from '~/modules/reports/core/builder/selectors'

const { I18n } = window

const connector = connect(
  (state, { modules }) => ({
    questions: getQuestions(state.report, modules[0].assessment_id),
  }),
  {},
)

const Properties = ({ modules }) => {
  const model = modules[0]

  const updateAll = (cb) => {
    modules.forEach((module) => {
      if (cb) cb(module)
      module.update()
    })
  }

  const checkboxHandler = (type, e) => {
    updateAll((model) => {
      model.props[type] = e.target.checked
    })
  }

  return (
    <Checkbox
      checked={model.props.showLegend || false}
      onChange={e => checkboxHandler('showLegend', e)}
      className="font-normal"
    >
      {I18n.t('reports.builder.graph.properties.showLegend')}
    </Checkbox>
  )
}

const BarProperties = connector(Properties)
export default BarProperties
