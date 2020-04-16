import React from 'react'
import styles from './RankOrder.scss'

interface Props {
  description: string
}

const DescriptionPreview: React.FC<Props> = ({ description }) => (
  <div className={styles.description}>{description}</div>
)

export default DescriptionPreview
