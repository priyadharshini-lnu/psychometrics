import _ from 'lodash'
import { connect } from 'react-redux'
import { Checkbox } from 'antd'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import ChoicesInput from '~/modules/reports/components/ChoicesInput'
import { getQuestions } from '~/modules/reports/core/builder/selectors'
import Series from './Series'

const { I18n } = window
const Properties = ({ questions, modules }) => {
  const model = modules[0]

  const updateAll = (cb) => {
    modules.forEach((module) => {
      cb?.(module)
      module.update()
    })
  }

  const changeDataFormat = (e) => {
    updateAll((item) => {
      item.props.dataFormat = e.currentTarget.value
    })
  }

  const checkboxHandler = (type, e) => {
    updateAll((item) => {
      item.props[type] = e.target.checked
    })
  }
  const change3D = (e) => {
    updateAll((item) => {
      item.props.graphicalRepresentation = e.currentTarget.value
    })
  }

  const changeInnerSize = (val) => {
    updateAll((item) => {
      item.props.innerSize = val
    })
  }

  const renderDataFormat = () => {
    if (!model.props.source || !model.getSourceType()) {
      return null
    }

    let question
    if (model.props.source && model.props.source.type === 'Question') {
      question = questions[model.props.source.id]
      if (!question) {
        return null
      }
    }

    if (!model.getSourceType()) return null

    const seriesFunction = Series[model.getSourceType()].functions
    const funcs = typeof seriesFunction === 'function' ? seriesFunction.call(this, question) : seriesFunction

    return (
      <select className="form-control" value={model.props.dataFormat} onChange={changeDataFormat}>
        {_.map(funcs, (name, i) => (<option key={i} value={name}>{name}</option>))}
      </select>
    )
  }

  const render3DOptions = () => (
    <div className="margin-top-10">
      <span className={styles.label}>Graph Subtype</span>
      <select className="form-control" value={model.props.graphicalRepresentation} onChange={change3D}>
        {_.map(['3D', 'Standard'], (name, i) => (<option key={i} value={name}>{name}</option>))}
      </select>
    </div>
  )

  return (
    <div>
      <span className={styles.label}>Data Format</span>
      {renderDataFormat()}
      {render3DOptions()}
      <div className="margin-top-10">
        Inner Size
        <ChoicesInput value={model.props.innerSize} onChange={changeInnerSize} maxValue={100} />
      </div>
      <Checkbox
        checked={model.props.showLegend || false}
        onChange={e => checkboxHandler('showLegend', e)}
        className="font-normal margin-top-10"
      >
        {I18n.t('reports.builder.graph.properties.showLegend')}
      </Checkbox>
    </div>
  )
}

export default connect((state, props) => ({
  questions: getQuestions(state.report, props?.modules[0]?.assessment_id),
}))(Properties)
