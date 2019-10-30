import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LabelEditor from 'rb/components/LabelEditor'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import DisplayLogicStore from 'rb/store/modals/DisplayLogicStore'
import styles from './Page.scss'

export default class PageHeader extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeName = (val) => {
    const { model } = this.props
    model.name = val
    this.forceUpdate()
  }

  addDisplayLogic = () => {
    const { model } = this.props
    DisplayLogicStore.open(model)
  }

  render () {
    const { model } = this.props
    return (
      <div className={styles.header}>
        <div>
          <a><LabelEditor value={model.name || 'Page'} onChange={this.changeName} width={120} /></a>
        </div>
        {
          <div className={styles.controls}>
            <DropdownButton
              id={`display_options_${model.id}`}
              className={styles.options}
              bsStyle="default"
              pullRight
              bsSize="small"
              title={<span className="icon fa fa-gear" />}
            >
              <MenuItem onSelect={this.addDisplayLogic}>
                <span className={`icon fa fa-eye ${styles.icon}`} />
                Add Display Logic...
              </MenuItem>
            </DropdownButton>
          </div>
        }
      </div>
    )
  }
}
