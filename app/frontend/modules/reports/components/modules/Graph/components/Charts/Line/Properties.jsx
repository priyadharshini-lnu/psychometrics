import _ from 'lodash'
import { connect } from 'react-redux'
import { Checkbox } from 'antd'
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
      model.props[type] = e.target.checked
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
      <Checkbox
        checked={lineModule.props.xAxisLinesHide || false}
        onChange={e => checkboxHandler('xAxisLinesHide', e)}
        className="font-normal margin-top-10"
      >
        Hide X-axis gridlines
      </Checkbox>
      <Checkbox
        checked={lineModule.props.yAxisLinesHide || false}
        onChange={e => checkboxHandler('yAxisLinesHide', e)}
        className="font-normal margin-top-10"
      >
        Hide Y-axis gridlines

      </Checkbox>
      <Checkbox
        checked={lineModule.props.yAxisTitleDisabled || false}
        onChange={e => checkboxHandler('yAxisTitleDisabled', e)}
        className="font-normal margin-top-10"
      >
        Hide Y-axis title
      </Checkbox>
      <Checkbox
        checked={lineModule.props.yAxisLabelDisabled || false}
        onChange={e => checkboxHandler('yAxisLabelDisabled', e)}
        className="font-normal margin-top-10"
      >
        Hide Y-axis label
      </Checkbox>
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
      <hr className={styles.divider} />
      <Checkbox
        checked={lineModule.props.showLegend || false}
        onChange={e => checkboxHandler('showLegend', e)}
        className="font-normal"
      >
        Show Legend
      </Checkbox>
    </div>
  )
}


export default connect((state, { modules }) => ({
  questions: getQuestions(state.report, modules[0].assessment_id),
}), {})(Properties)
