import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TextEditor from 'components/TextEditor'
import styles from './GapAnalysis.scss'
import TableHeader from './TableHeader'
import TableBody from './TableBody'

export class GapAnalysis extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeText = (value) => {
    const { model } = this.props
    model.changeProps({ questionText: value })
    this.forceUpdate()
  }

  update = () => {
    this.forceUpdate()
  }

  render () {
    const { model, model: { props } } = this.props
    return (
      <div style={{ position: 'relative' }}>
        <div className={styles.questionText}>
          <TextEditor model={model} value={props.questionText} onChange={this.changeText} />
        </div>
        <table className={styles.table}>
          <TableHeader {...this.props} onChange={this.update} />
          <TableBody {...this.props} />
        </table>
      </div>
    )
  }
}

export default GapAnalysis
