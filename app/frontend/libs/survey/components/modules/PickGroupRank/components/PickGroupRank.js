import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TextEditor from 'components/TextEditor'
import styles from './PickGroupRank.scss'
import Templates from './Templates'

export class PickGroupRank extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeText = (value) => {
    const { model } = this.props
    model.changeProps({ questionText: value })
    this.forceUpdate()
  }

  renderAnswersType = () => {
    const { model } = this.props
    const { type } = model.props
    const View = Templates[type] || Templates.DragAndDrop
    return <View model={model} key={type} />
  }

  render () {
    const { model, model: { props } } = this.props
    return (
      <div style={{ position: 'relative' }}>
        <div className={styles.questionText}>
          <TextEditor model={model} value={props.questionText} onChange={this.changeText} />
          {this.renderAnswersType()}
        </div>
      </div>
    )
  }
}

export default PickGroupRank
