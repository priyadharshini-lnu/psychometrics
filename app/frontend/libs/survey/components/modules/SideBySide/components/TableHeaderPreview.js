import _ from 'lodash'
import React from 'react'
import I18nStore from 'store/I18nStore'
import styles from './SideBySide.scss'

const TableHeaderPreview = ({ model }) => {
  const { props: { columnsData, scalePoints }, moduleConfig } = model
  return (
    <thead className={styles.tableHead}>
      <tr className={styles.row}>
        <td className={`${styles.group} ${styles.column} ${styles.firstColumn}`} />
        {_.times(scalePoints, i => (
          <td key={i} className={styles.column}>
            <div className={styles.group}>
              <span>
                {I18nStore.tQuestion(model, `text${i + 1}`, { group: i })
                  || moduleConfig.defaultGroupText(i + 1)}
              </span>
            </div>
          </td>
        ))}
      </tr>
      <tr className={styles.answersRow}>
        <th className={`${styles.header} ${styles.column} ${styles.firstColumn}`} />
        {_.times(scalePoints, i => (
          <th key={i} className={styles.column}>
            <div className={styles.answers}>
              {_.times(columnsData[i].answers, j => (
                <div className={styles.answer} key={j}>
                  <span>
                    {I18nStore.tQuestion(model, `answersTexts${i + 1}_${j + 1}`, { answer: j, group: i })
                      || moduleConfig.defaultAnswerText(j + 1)}
                  </span>
                </div>
              ))}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  )
}

export default TableHeaderPreview
