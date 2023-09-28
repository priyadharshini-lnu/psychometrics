import { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './EndOfAssessment.less'
import Controls from '../../Controls'

class EndOfAssessment extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    onRemove: PropTypes.func.isRequired,
  }

  showOptions = () => {
    const {
      model, openModal, onUpdate,
    } = this.props

    openModal({
      flowElement: model, onUpdate,
    })
  }

  render () {
    const {
      onRemove, onAddBelow, onDuplicate, onMove,
    } = this.props
    return (
      <div className={styles.block}>
        <div>
          <div className={styles.iconContainer}>
            <i className={`fa fa-exclamation-triangle ${styles.icon}`} />
          </div>
          End Of Assessment
        </div>
        <div className={styles.footerContainer}>
          <div className={styles.footer}>
            <Controls
              styles={styles}
              onRemove={onRemove}
              onAddBelow={onAddBelow}
              onDuplicate={onDuplicate}
              onMove={onMove}
              customBlocks={<a onClick={this.showOptions} className={styles.dup}>Options</a>}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default EndOfAssessment
