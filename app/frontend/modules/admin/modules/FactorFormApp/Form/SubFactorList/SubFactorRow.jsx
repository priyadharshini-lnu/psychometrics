import { DnDElement } from '~/components/DnD'
import styles from './styles.less'

const SubFactorRow = ({
  list, scoringStrategy, moveRow, subFactor, columns,
}) => {
  const renderTdList = () => columns.filter(c => c.render).map(c => (
    <td
      className={styles.td}
      key={c.dataIndex}
    >
      {c.render(subFactor)}
    </td>
  ))

  return (scoringStrategy === 'sub_factors_conditional_average'
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
        {renderTdList()}
      </DnDElement>
    )
    : <tr>{renderTdList()}</tr>)
}


export default SubFactorRow
