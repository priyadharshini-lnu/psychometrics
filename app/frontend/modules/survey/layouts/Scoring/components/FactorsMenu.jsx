import _ from 'lodash'
import { Component } from 'react'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import styles from './Scoring.less'

export class FactorsMenu extends Component {
  selectFactor = (factor) => {
    const { selectFactor } = this.props
    selectFactor(factor.id)
  }

  currentFactorName () {
    const { selectedFactor } = this.props
    if (selectedFactor) {
      return selectedFactor.name
    }
    return 'Choose Factor'
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

  render () {
    const { factors } = this.props

    return (
      <DropdownButton
        onClick={e => e.stopPropagation(e)}
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
