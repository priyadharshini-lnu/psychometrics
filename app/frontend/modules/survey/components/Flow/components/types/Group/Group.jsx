import styles from './Group.less'
import Controls from '../../Controls'

const Group = ({
  onRemove, onAddBelow, onDuplicate, onMove,
}) => (
  <div className={styles.block}>
    <div>
      <div className={styles.iconContainer}>
        <i className={`fa fa-object-group ${styles.icon}`} />
      </div>
      <div className={styles.title}>
        Group
      </div>
    </div>
    <div className={styles.footer}>
      <Controls
        styles={styles}
        onRemove={onRemove}
        onAddBelow={onAddBelow}
        onDuplicate={onDuplicate}
        onMove={onMove}
      />
    </div>
  </div>
)

export default Group
