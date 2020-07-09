import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Editable from 'components/modules/MultipleChoice/components/types/Editable'
import styles from './SelectBox.scss'

export default class extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  state = {
    edit: false,
  }

  change = (e) => {
    const select = e.currentTarget
    const val = select.value
    this.current = +val
    _.each(select.options, (option) => {
      if (option.value !== val) {
        option.selected = false
      }
    })
  }

  renderPanel () {
    return (
      <div className={`${styles.panel}`}>
        <a className={`btn btn-default ${styles.btn}`} onClick={this.moveUp}>
          <span className="fa fa-arrow-up" />
        </a>
        <a className={`btn btn-default ${styles.btn}`} onClick={this.moveDown}>
          <span className="fa fa-arrow-down" />
        </a>
      </div>
    )
  }

  renderSelect () {
    const { model: { props, moduleConfig } } = this.props

    return (
      <div>
        <div className={styles.container}>
          {this.renderPanel()}
          <select
            ref={(ref) => { this.select = ref }}
            multiple
            size={10}
            onChange={this.change}
            className={styles.select}
          >
            {_.times(props.choices, i => (
              <option value={i} key={i}>
                {props.choicesTexts[i] || moduleConfig.defaultChoiceText(i + 1)}
              </option>
            ))}
          </select>
          {this.renderPanel()}
        </div>
        <div className={styles.edit}>
          <a onClick={() => this.setState({ edit: true })}>Click here to edit answers</a>
        </div>
      </div>
    )
  }

  render () {
    const { edit } = this.state
    const { model } = this.props
    return (
      edit
        ? (
          <Editable
            model={model}
            onChange={() => this.forceUpdate()}
            endEdit={() => this.setState({ edit: false })}
          />
        )
        : this.renderSelect()
    )
  }
}
