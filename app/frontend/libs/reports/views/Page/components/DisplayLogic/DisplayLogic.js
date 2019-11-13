import React, { Component } from 'react'
import PropTypes from 'prop-types'
import DisplayLogicStore from 'rb/store/modals/DisplayLogicStore'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import styles from './DisplayLogic.scss'
import LogicPreview from './LogicPreview'

export default class DisplayLogic extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  openDisplayLogic = () => {
    const { model } = this.props
    DisplayLogicStore.open(model)
  }

  removeDisplayLogic = () => {
    const { model } = this.props
    DisplayLogicStore.remove(model)
  }

  render () {
    const { model } = this.props
    const { conditions } = model.displayLogic
    return (
      <div className={styles.displayLogic}>
        <div className={styles.displayHeader}>
          <div className={styles.preview}>
            <div className={styles.title}>Display This Page:</div>
          </div>
          <DropdownButton
            id={`display_options_${model.id}`}
            className={styles.options}
            bsStyle="default"
            pullRight
            bsSize="small"
            title="Options"
          >
            <MenuItem onSelect={this.openDisplayLogic}>
              <span className={`${styles.menuicon}`} />
              Edit
            </MenuItem>
            <MenuItem onSelect={this.removeDisplayLogic}>
              <span className={`${styles.menuicon}`} />
              Remove
            </MenuItem>
          </DropdownButton>
        </div>
        <LogicPreview conditions={conditions} />
      </div>
    )
  }
}
