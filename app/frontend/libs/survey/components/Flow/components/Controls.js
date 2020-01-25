import React from 'react'

export default function Controls ({
  styles, customBlocks, onRemove, onAddBelow, onDuplicate, onMove,
}) {
  const add = () => onAddBelow && onAddBelow()
  const move = () => onMove && onMove()
  const duplicate = () => onDuplicate && onDuplicate()
  const remove = () => onRemove && onRemove()

  return (
    <div>
      <a onClick={() => add()} className={styles.add}>Add Below</a>
      <a onClick={() => move()} className={`${styles.move} moveHandle`}>Move</a>
      <a onClick={() => duplicate()} className={styles.dup}>Duplicate</a>
      {customBlocks && customBlocks}
      <a onClick={() => remove()} className={styles.delete}>Delete</a>
    </div>
  )
}
