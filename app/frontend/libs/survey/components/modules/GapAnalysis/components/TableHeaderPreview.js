import _ from 'lodash'
import I18nStore from 'store/I18nStore'
import React from 'react'
import styles from './GapAnalysis.scss'
import Smiles from '../assets'

const TableHeaderPreview = ({ model, model: { props } }) => (
  <thead className={styles.tableHead}>
    <tr className={styles.row}>
      <th className={`${styles.header} ${styles.column} ${styles.firstColumn}`}>
        <span>{I18nStore.tQuestion(model, 'categoriesText')}</span>
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
          <span>{I18nStore.tQuestion(model, 'tellUsText')}</span>
        </div>
      </th>
    </tr>
  </thead>
)

export default TableHeaderPreview
