import React from 'react'
import styles from './UniqueGenerator.scss'
import Controls from '../../Controls'

const UniqueGenerator = ({
  onRemove, onAddBelow, onDuplicate, onMove,
}) => (
  <div className={styles.block}>
    <div>
      <div className={styles.iconContainer}>
        <i className={`fa fa-user-secret ${styles.icon}`} />
      </div>
      <div className={styles.title}>
        Set Unique Identifier For Client
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

export default UniqueGenerator
