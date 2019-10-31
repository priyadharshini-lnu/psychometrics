/* eslint-disable jsx-a11y/no-autofocus */
/* eslint-disable jsx-a11y/no-autoFocus */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import store from 'rb/store/modals/AliasStore'
import styles from './AliasModal.scss'

export class Alias extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  componentDidMount () {
    this.popupListener = store.addListener('change', () => this.forceUpdate())
  }

  componentWillUnmount () {
    this.popupListener.remove()
  }

  selectAlias = (e, factor) => {
    factor.edit = true
    this.forceUpdate()
  }

  closeEdit = (e, factor) => {
    factor.edit = false
    this.forceUpdate()
  }

  onChangeAlias = (e, factor) => {
    factor.alias = e.currentTarget.value
    store.changeFactorsAlias(factor.id, factor.alias)
    this.forceUpdate()
  }

  onBlurAlias = (e, factor) => {
    factor.edit = false
    this.forceUpdate()
  }

  renderAliasTd (factor) {
    if (factor.edit) {
      return (
        <td>
          <div className={styles.aliasOuterTd}>
            <div className={styles.aliasInnerTd}>
              <div className="input-group">
                <input
                  value={factor.alias}
                  autoFocus
                  type="text"
                  className="form-control"
                  onBlur={(e => this.onBlurAlias(e, factor))}
                  onChange={(e => this.onChangeAlias(e, factor))}
                />
                <span className="input-group-btn">
                  <button className="btn btn-default" type="button" onClick={(e => this.closeEdit(e, factor))}>
                    <i className="fa fa-check" />
                  </button>
                </span>
              </div>
            </div>
          </div>
        </td>
      )
    }
    return (
      <td
        onClick={(e => this.selectAlias(e, factor))}
        className={[styles.aliasTd, styles.overflowEllipsis].join(' ')}
        title={factor.alias}
      >
        <div className={styles.aliasOuterTd}>
          <span className={`${styles.overflowEllipsis} ${styles.aliasInnerTd}`}>{factor.alias}</span>
        </div>
      </td>
    )
  }

  renderFactor (factor) {
    return (
      <tr>
        <td className={styles.overflowEllipsis} title={factor.name}>{factor.name}</td>
        {this.renderAliasTd(factor)}
      </tr>
    )
  }

  render () {
    const { model } = this.props
    return this.renderFactor(model)
  }
}

export default Alias
