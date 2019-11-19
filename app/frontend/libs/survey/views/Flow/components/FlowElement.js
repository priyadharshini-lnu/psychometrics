import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './Flow.scss'
import Views from './types'
import ButtonNew from './ButtonNew'
import Settings from './Settings'

export class FlowElement extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  addNew = () => {
    const { model, addNew } = this.props
    if (model.type === 'Randomizer' && model.props.number + 1 === model.elements.length) {
      model.props.number += 1
    }
    addNew(model)
  }

  addBelow = () => {
    const { model, addElementBelow } = this.props
    addElementBelow(model)
  }

  duplicate = () => {
    const { model, duplicateElement } = this.props
    duplicateElement(model)
  }

  update = () => {
    this.forceUpdate()
  }

  canAddMore = type => Settings[type].children

  remove = () => {
    const { model, removeElement } = this.props
    removeElement(model)
  }

  selectType = (type) => {
    const { model } = this.props
    model.type = type
    model.props = _.cloneDeep(Settings[type].defaults || {})
    this.forceUpdate()
  }

  renderElement = (element, i) => (
    <FlowElement key={i} model={element} onRemove={this.update} />
  )

  renderFlowType (model) {
    const View = Views[model.type]
    return (
      <div>
        <div className={`${styles.element} ${styles[model.type]}`}>
          <View model={model} onRemove={this.remove} onAddBelow={this.addBelow} onDuplicate={this.duplicate} />
        </div>
        <div className={styles.row}>
          {this.canAddMore(model.type) && (
          <div>
            <ButtonNew onClick={this.addNew} />
          </div>
          )}
        </div>
      </div>
    )
  }

  renderVariants () {
    return (
      <div className={styles.elementSelect}>
        <div className={styles.label}>
          What do you want to add?
          <a className="btn" onClick={this.remove}>Cancel</a>
        </div>
        <div className={styles.btns}>
          <button onClick={() => this.selectType('Block')} className={`btn btn-default ${styles.btn}`}>
            <span className="fa fa-square" />
            Block
          </button>
          <button onClick={() => this.selectType('Branch')} className={`btn btn-default ${styles.btn}`}>
            <span className="fa fa-code-fork fa-rotate-90" />
            Branch
          </button>
          <button onClick={() => this.selectType('EmbeddedData')} className={`btn btn-default ${styles.btn}`}>
            <span className="fa fa-database" />
            Embedded Data
          </button>
          <button onClick={() => this.selectType('Randomizer')} className={`btn btn-default ${styles.btn}`}>
            <span className="fa fa-random" />
            Randomizer
          </button>
          <button onClick={() => this.selectType('EndOfAssessment')} className={`btn btn-default ${styles.btn}`}>
            <span className="fa fa-exclamation-triangle" />
            End of Assessment
          </button>
        </div>
      </div>
    )
  }

  render () {
    const { model } = this.props
    return (
      model.type ? this.renderFlowType(model) : this.renderVariants(model)
    )
  }
}

export default FlowElement
