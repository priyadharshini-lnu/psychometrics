import React from 'react'
import cs from 'classnames'
import ColorPicker from 'rb/components/ColorPicker'
import styles from './styles.scss'

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
        <ColorPicker
          color={milestone.color || '#cccccc'}
          onChange={color => onUpdate(milestone.id, { color: color.hex })}
        />
        <i className={cs('fa', 'fa-minus', 'mls', styles.remove)} onClick={removeMilestone} />
      </div>
      <div className={styles.limitContainer}>
        <input onChange={updateMilestone} name="min" placeholder="Min" value={milestone.min} />
        <input onChange={updateMilestone} name="max" placeholder="Max" value={milestone.max} />
      </div>
    </div>
  )
}
