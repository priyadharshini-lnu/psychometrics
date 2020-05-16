import React from 'react'
import { DnDElement } from 'components/DnD'
import styles from './styles.scss'

const SubFactorRow = ({
  list, scoringStrategy, moveRow, subFactor, columns, ...restProps
}) => (scoringStrategy === 'sub_factors_conditional_average'
  ? (
    <DnDElement
      element={subFactor}
      onDrag={moveRow}
      list={list}
      uniqField="sub_factor_id"
      strategy="position"
      wrapper="tr"
      iconWrapper="td"
      iconClass={styles.td}
    >
      {columns.filter(c => c.render).map(c => <td className={styles.td} key={c.dataIndex}>{c.render(subFactor)}</td>)}
    </DnDElement>
  )
  : <tr {...restProps} />)


export default SubFactorRow
