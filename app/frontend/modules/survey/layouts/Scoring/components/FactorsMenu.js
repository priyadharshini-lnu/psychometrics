import _ from 'lodash'
import React, { Component } from 'react'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import styles from './Scoring.scss'

export class FactorsMenu extends Component {
  selectFactor = (factor) => {
    const { selectFactor } = this.props
    selectFactor(factor.id)
  }

  renderFactorBlock = factor => _.compact(_.flatten([
    <MenuItem key={factor.id} onSelect={() => this.selectFactor(factor)}>{factor.name}</MenuItem>,
    factor.sub_factors && factor.sub_factors.list.map(subFactor => (
      <MenuItem
        key={subFactor.id}
        onSelect={() => this.selectFactor(subFactor)}
      >
        {subFactor.name}
      </MenuItem>
    )),
  ]))

  currentFactorName () {
    const { selectedFactor } = this.props
    if (selectedFactor) {
      return selectedFactor.name
    }
    return 'Choose Factor'
  }

  render () {
    const { factors } = this.props

    return (
      <DropdownButton
        className={styles.dropdown}
        bsStyle="default"
        title={(
          <span>
            <span className="icon fa fa-gear" />
            {this.currentFactorName()}
          </span>
        )}
        id="main_menu"
      >
        {factors.map(factor => this.renderFactorBlock(factor))}
      </DropdownButton>
    )
  }
}

export default FactorsMenu
