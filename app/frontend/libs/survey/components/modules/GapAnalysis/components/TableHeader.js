import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import LabelEditor from 'components/LabelEditor'
import styles from './GapAnalysis.scss'
import Smiles from '../assets'

export class TableHeader extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
  }

  update = () => {
    this.forceUpdate()
  }

  changeCategoryText = (val) => {
    const { model } = this.props
    model.changeProps({ categoriesText: val })
    this.update()
  }

  changeTellUsText = (val) => {
    const { model } = this.props
    model.changeProps({ tellUsText: val })
    this.update()
  }

  render () {
    const { model: { props } } = this.props
    return (
      <thead className={styles.tableHead}>
        <tr className={styles.row}>
          <th className={`${styles.header} ${styles.column} ${styles.firstColumn}`}>
            <LabelEditor
              onChange={this.changeCategoryText}
              maxWidth={200}
              value={props.categoriesText}
            />
          </th>
          {_.times(5, i => (
            <th key={i} className={`${styles.smileColumn} ${i > 2 ? styles[`smileColumn${i}`] : ''}`}>
              <div className={styles.group}>
                <img src={Smiles[`Smile${props.type === 'Positive' ? i + 1 : 5 - i}`]} />
              </div>
            </th>
          ))}
          <th className={styles.tellUs}>
            <div className={styles.tellUsLabel}>
              <LabelEditor
                onChange={this.changeTellUsText}
                maxWidth={80}
                value={props.tellUsText}
              />
            </div>
          </th>
        </tr>
      </thead>
    )
  }
}

export default TableHeader
