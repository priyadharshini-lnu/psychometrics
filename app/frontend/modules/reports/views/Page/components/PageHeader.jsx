import { Component } from 'react'
import PropTypes from 'prop-types'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import LabelEditor from '~/modules/reports/components/LabelEditor'
import styles from './Page.less'

export default class PageHeader extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  changeName = (val) => {
    const { renamePage, model } = this.props
    renamePage(model.id, val)
  }

  addDisplayLogic = () => {
    const { model, openDisplayLogic } = this.props
    openDisplayLogic({ model })
  }

  render () {
    const { model } = this.props
    return (
      <div className={styles.header}>
        <div>
          <a><LabelEditor value={model.name || 'Page'} onChange={this.changeName} width={120} /></a>
        </div>
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
      </div>
    )
  }
}
