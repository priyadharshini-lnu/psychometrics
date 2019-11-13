import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TextEditor from 'components/TextEditor'
import styles from './ConstantSum.scss'
import Templates from './Templates'

export class ConstantSum extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeText = (value) => {
    const { model } = this.props
    model.props.questionText = value
    model.update()
    this.forceUpdate()
  }

  renderSubModule () {
    const { model } = this.props
    const { type } = model.props
    const View = Templates[type] || Templates.Choice
    return <View model={model} key={type} />
  }

  render () {
    const { model, model: { props } } = this.props
    return (
      <div style={{ position: 'relative' }}>
        <div className={styles.questionText}>
          <TextEditor model={model} value={props.questionText} onChange={this.changeText} />
        </div>
        {this.renderSubModule()}
      </div>
    )
  }
}

export default ConstantSum
