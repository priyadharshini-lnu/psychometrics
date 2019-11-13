import _ from 'lodash'
import React, { Component } from 'react'
import AppStore from 'store/AppStore'
import FactorList from 'store/FactorList'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import styles from './Scoring.scss'

export class FactorsMenu extends Component {
  closeScoring = () => {
    AppStore.scoring = false
    AppStore.update()
  }

  selectFactor = (factor) => {
    FactorList.changeFactor(factor)
    this.forceUpdate()
  }

  renderFactorBlock = factor => _.flatten([
    <MenuItem key={factor.id} onSelect={() => this.selectFactor(factor)}>{factor.getName()}</MenuItem>,
    factor.subFactors.list.map(subFactor => (
      <MenuItem
        key={subFactor.id}
        onSelect={() => this.selectFactor(subFactor)}
      >
        {subFactor.getName()}
      </MenuItem>
    )),
  ])

  render () {
    return (
      <DropdownButton
        className={styles.dropdown}
        bsStyle="default"
        title={(
          <span>
            <span className="icon fa fa-gear" />
            {FactorList.getCurrentFactorName()}
          </span>
)}
        id="main_menu"
      >
        {FactorList.list.map(factor => this.renderFactorBlock(factor))}
      </DropdownButton>
    )
  }
}

export default FactorsMenu
