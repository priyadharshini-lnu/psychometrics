import React from 'react'
import { useDrop } from 'react-dnd'
import styles from './styles.scss'

interface Props {
  groupId: null | number
  text: string
}


const AssessmentsDropArea: React.FC<Props> = ({ text, groupId }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'ASSESSMENT',
    collect: monitor => ({ isOver: monitor.isOver(), canDrop: monitor.canDrop() }),
    drop: () => ({ groupId }),
  })

  return (
    <div
      style={{ background: isOver && canDrop ? '#ffffe3' : 'white' }}
      ref={drop}
      className={styles.container}
    >
      <span className={styles.icon} />
      <span className={styles.desc}>{text}</span>
    </div>
  )
}

export default AssessmentsDropArea
