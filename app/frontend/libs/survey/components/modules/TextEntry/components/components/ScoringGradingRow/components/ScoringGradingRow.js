import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ScoringCell from 'components/ScoringCell'
import styles from './ScoringGradingRow.scss'

class ScoringGradingRow extends Component {
  static propTypes = {
    scoring: PropTypes.object.isRequired,
    index: PropTypes.any,
    value: PropTypes.any,
    row: PropTypes.number.isRequired,
    onChangeIndex: PropTypes.func.isRequired,
    onChangeValue: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
  }

  isLastRow () {
    const { scoring, row } = this.props
    return scoring.props.length === row + 1
  }

  render () {
    const {
      value, index, onChangeValue, onChangeIndex, onRemove, onAdd,
    } = this.props
    return (
      <div className={styles.scoringRow}>
        <ScoringCell
          value={value || ''}
          onChange={onChangeValue}
        />
        <input
          onChange={onChangeIndex}
          placeholder="Enter Text Response For Grading"
          className={`${styles.ceil} ${index ? styles.ceilFill : styles.ceilEmpty}`}
          value={index || ''}
        />
        <span
          onClick={onRemove}
          className={`btn fa fa-minus-circle ${styles.scoringButton}`}
          style={{ color: 'red' }}
        />
        {
          this.isLastRow() && (
            <span
              onClick={onAdd}
              className={`btn fa fa-plus-circle ${styles.scoringButton}`}
              style={{ color: 'green' }}
            />
          )
        }
      </div>

    )
  }
}

export default ScoringGradingRow
