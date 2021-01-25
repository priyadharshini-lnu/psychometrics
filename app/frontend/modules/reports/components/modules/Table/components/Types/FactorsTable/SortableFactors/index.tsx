import React, { useState, useEffect } from 'react'
import DndElement from 'components/DnD/DnDElement'
import styles from './styles.scss'

export interface FactorType {
  id: number
  name: string
  position: number
}

export interface Factors {
  factors: FactorType[],
}

interface Props {
  selectedFactors: FactorType[],
  update(factors: FactorType[]): void
}

const SortableFactors: React.FC<Props> = ({ selectedFactors, update }) => {
  const [factors, setFactors] = useState(selectedFactors || [])
  useEffect(() => {
    setFactors(selectedFactors)
  }, [selectedFactors])

  const onDrag = (factors: FactorType[]) => {
    setFactors(factors)
    update(factors)
  }

  const renderFactor = (factor: { id: number, name: string }) => (
    <DndElement
      strategy="index"
      uniqField="id"
      element={factor}
      list={factors}
      onDrag={onDrag}
      key={factor.id}
      additionalWrapper
    >
      <div className={styles.factor}>
        {factor.name}
      </div>
    </DndElement>
  )

  return (
    <>
      {factors.map(factor => renderFactor(factor))}
    </>
  )
}

export default SortableFactors
