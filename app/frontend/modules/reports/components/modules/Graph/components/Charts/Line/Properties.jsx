import _ from 'lodash'
import { connect } from 'react-redux'
import styles from '~/modules/reports/views/PropertyPanel/components/PropertyPanel.less'
import ChoicesInput from '~/modules/reports/components/ChoicesInput'
import { getQuestions } from '~/modules/reports/core/builder/selectors'
import Series from './Series'

const Properties = ({ modules, questions }) => {
  const lineModule = modules[0]

  const updateAll = (cb) => {
    modules.forEach((module) => {
      cb?.(module)
      module.update()
    })
  }

  const checkboxHandler = (type, e) => {
    updateAll((model) => {
      model.props[type] = e.currentTarget.checked
    })
  }

  const changeDataFormat = (e) => {
    updateAll((model) => {
      model.props.dataFormat = e.currentTarget.value
    })
  }

  const changeLineWidth = (val) => {
    updateAll((model) => {
      model.props.lineWidth = val
    })
  }

  const renderDataFormat = () => {
    if (!lineModule.props.source || !lineModule.getSourceType()) {
      return null
    }

    let question
    if (lineModule.props.source && lineModule.props.source.type === 'Question') {
      question = questions[lineModule.props.source.id]
      if (!question) {
        return null
      }
    }

    const seriesFunction = Series[lineModule.getSourceType()].functions
    const funcs = typeof seriesFunction === 'function' ? seriesFunction.call(this, question) : seriesFunction

    return (
      <select className="form-control" value={lineModule.props.dataFormat} onChange={changeDataFormat}>
        {_.map(funcs, (name, i) => (<option key={i} value={name}>{name}</option>))}
      </select>
    )
  }

  const renderAxisOptions = () => (
    <div>
      <div className="margin-top-10">
        <label style={{ fontWeight: 'normal' }}>
          <input
            type="checkbox"
            checked={lineModule.props.xAxisLinesHide || false}
            onChange={e => checkboxHandler('xAxisLinesHide', e)}
          />
          Hide X-axis gridlines
        </label>
      </div>
      <div className="margin-top-10">
        <label style={{ fontWeight: 'normal' }}>
          <input
            type="checkbox"
            checked={lineModule.props.yAxisLinesHide || false}
            onChange={e => checkboxHandler('yAxisLinesHide', e)}
          />
          Hide Y-axis gridlines
        </label>
      </div>
      <div className="margin-top-10">
        <label style={{ fontWeight: 'normal' }}>
          <input
            type="checkbox"
            checked={lineModule.props.yAxisTitleDisabled || false}
            onChange={e => checkboxHandler('yAxisTitleDisabled', e)}
          />
          Hide Y-axis title
        </label>
      </div>
    </div>
  )

  return (
    <div>
      <span className={styles.label}>Data Format</span>
      {renderDataFormat()}
      <div className="margin-top-10">
        Line Width
        <ChoicesInput value={lineModule.props.lineWidth} onChange={changeLineWidth} maxValue={10} />
      </div>
      {renderAxisOptions()}
    </div>
  )
}


export default connect((state, { modules }) => ({
  questions: getQuestions(state.report, modules[0].assessment_id),
}), {})(Properties)
