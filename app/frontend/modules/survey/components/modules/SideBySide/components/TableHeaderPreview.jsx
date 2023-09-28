import _ from 'lodash'
import cs from 'classnames'
import styles from '../styles.less'

const TableHeaderPreview = ({ model, I18n }) => {
  const { props: { columnsData, scalePoints, hideHeaders }, moduleConfig } = model
  return (
    <thead className={styles.tableHead}>
      <tr className={styles.row}>
        <td className={`${styles.group} ${styles.column} ${styles.firstColumn} ps-2 pe-2 pt-2 pb-2`} />
        {_.times(scalePoints, i => (
          <td key={i} className={`${styles.column} ps-2 pe-2 pt-2 pb-2`}>
            <div className={styles.group}>
              <span>
                {I18n.tQuestion(model, `text${i + 1}`, { group: i })
                  || moduleConfig.defaultGroupText(i + 1)}
              </span>
            </div>
          </td>
        ))}
      </tr>
      {!hideHeaders && (
      <tr className={styles.answersRow}>
        <th className={`${styles.header} ${styles.column} ${styles.firstColumn}`} />
        {_.times(scalePoints, i => (
          <th key={i} className={cs(styles.column, { invisible: columnsData[i].isHeaderHidden })}>
            {!columnsData[i].isHeaderHidden
            && (
            <div className={styles.answers}>
              {_.times(columnsData[i].answers, j => (
                <div className={styles.answer} key={j}>
                  <span>
                    {I18n.tQuestion(model, `answersTexts${i + 1}_${j + 1}`, { answer: j, group: i })
                      || moduleConfig.defaultAnswerText(j + 1)}
                  </span>
                </div>
              ))}
            </div>
            )
          }
          </th>
        ))}
      </tr>
      )}
    </thead>
  )
}

export default TableHeaderPreview
