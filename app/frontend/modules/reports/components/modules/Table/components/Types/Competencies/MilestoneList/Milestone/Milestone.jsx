import cs from 'classnames'
import { ColorPicker } from '~/glint'
import styles from './styles.less'

export default function Milestone ({ milestone, onRemove, onUpdate }) {
  const removeMilestone = () => onRemove(milestone)
  const updateMilestone = ({ currentTarget }) => onUpdate(milestone.id, { [currentTarget.name]: currentTarget.value })

  return (
    <div className={styles.container}>
      <div className={styles.nameContainer}>
        <input
          onChange={updateMilestone}
          className={styles.name}
          name="name"
          placeholder="Name"
          value={milestone.name}
        />
      </div>
      <div className={styles.limitContainer}>
        <input onChange={updateMilestone} name="min" placeholder="Min" value={milestone.min} />
        <input onChange={updateMilestone} name="max" placeholder="Max" value={milestone.max} />
      </div>
      <div className={styles.icons}>
        <ColorPicker
          value={milestone.color || '#cccccc'}
          getValueInHexFormat
          onChange={color => onUpdate(milestone.id, { color })}
        />
        <span className={styles.remove} onClick={removeMilestone}>
          Remove
          {' '}
          <i className={cs('fa', 'fa-trash', 'mls')} />
        </span>

      </div>
    </div>
  )
}
